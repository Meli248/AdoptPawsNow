import { useState, useEffect } from 'react';
import { Search, Filter, PawPrint, Dog, Cat, MapPin, Heart } from 'lucide-react';
import { adoptionAPI } from '../../services/api';
import '../../css/Adopt.css';

const Adopt = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    applicant_name: '',
    email: '',
    phone: '',
    address: '',
    reason: ''
  });

  useEffect(() => {
    fetchPets();
  }, [filter]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filter === 'dogs') {
        params.species = 'Dog';
      } else if (filter === 'cats') {
        params.species = 'Cat';
      }

      const response = await adoptionAPI.getAllPets(params);
      setPets(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching pets:', err);
      setError('Failed to load pets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdoptClick = (pet) => {
    setSelectedPet(pet);
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    try {
      const applicationData = {
        ...formData,
        pet_id: selectedPet.pet_id
      };
      
      const response = await adoptionAPI.createApplication(applicationData);
      
      alert(response.message || 'Application submitted successfully! We will contact you soon.');
      
      setFormData({
        applicant_name: '',
        email: '',
        phone: '',
        address: '',
        reason: ''
      });
      setShowModal(false);
      setSelectedPet(null);
    } catch (err) {
      console.error('Error submitting application:', err);
      alert(err.message || 'Failed to submit application. Please try again.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPet(null);
    setFormData({
      applicant_name: '',
      email: '',
      phone: '',
      address: '',
      reason: ''
    });
  };

  const filteredPets = pets.filter(pet => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      pet.name.toLowerCase().includes(search) ||
      (pet.breed && pet.breed.toLowerCase().includes(search)) ||
      pet.species.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="adopt-page">
        <section className="adopt-hero">
          <div className="container">
            <h1 className="page-title">Loading pets...</h1>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adopt-page">
        <section className="adopt-hero">
          <div className="container">
            <h1 className="page-title">Error</h1>
            <p className="page-subtitle">{error}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="adopt-page">
      <section className="adopt-hero">
        <div className="container">
          <h1 className="page-title fade-in">Find Your Perfect Companion</h1>
          <p className="page-subtitle fade-in">
            Give a loving pet their forever home. Browse our adorable dogs and cats waiting for families.
          </p>
        </div>
      </section>

      <section className="search-section">
        <div className="container">
          <div className="search-bar fade-in">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by name, breed, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="filter-button">
              <Filter size={20} />
            </button>
          </div>

          <div className="filter-tabs fade-in">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <PawPrint size={20} />
              All Pets
            </button>
            <button 
              className={`filter-tab ${filter === 'dogs' ? 'active' : ''}`}
              onClick={() => setFilter('dogs')}
            >
              <Dog size={20} />
              Dogs
            </button>
            <button 
              className={`filter-tab ${filter === 'cats' ? 'active' : ''}`}
              onClick={() => setFilter('cats')}
            >
              <Cat size={20} />
              Cats
            </button>
          </div>
        </div>
      </section>

      <section className="pets-section">
        <div className="container">
          <div className="pets-info">
            <p>Showing <strong>{filteredPets.length}</strong> pets for adoption</p>
          </div>

          <div className="pets-grid">
            {filteredPets.map((pet, index) => (
              <div key={pet.pet_id} className="pet-card fade-in">
                <div className="pet-image-wrapper">
                  <img 
                    src={pet.image_url || 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop'} 
                    alt={pet.name} 
                    className="pet-image" 
                  />
                  <div className="pet-status available">
                    {pet.status || 'Available'}
                  </div>
                  <button className="favorite-btn">
                    <Heart size={20} />
                  </button>
                </div>
                <div className="pet-info">
                  <h3 className="pet-name">{pet.name}</h3>
                  <p className="pet-breed">
                    {pet.breed || pet.species} • {pet.age ? `${pet.age} years` : 'Age unknown'}
                  </p>
                  <div className="pet-location">
                    <MapPin size={16} />
                    {pet.size || 'Unknown size'} • {pet.gender || 'Unknown'}
                  </div>
                  <p className="pet-description">
                    {pet.description || 'A wonderful pet looking for a loving home.'}
                  </p>
                  <button 
                    className="btn btn-primary btn-adopt"
                    onClick={() => handleAdoptClick(pet)}
                  >
                    Adopt {pet.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showModal && selectedPet && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply to Adopt {selectedPet.name}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmitApplication}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="applicant_name"
                  value={formData.applicant_name}
                  onChange={handleFormChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  placeholder="john@example.com"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="555-1234"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  rows="2"
                  placeholder="123 Main St, City, State"
                />
              </div>

              <div className="form-group">
                <label>Why do you want to adopt {selectedPet.name}?</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleFormChange}
                  rows="4"
                  placeholder="Tell us why you'd be a great pet parent..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Submit Application
                </button>
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adopt;