import { useState, useEffect } from 'react';
import { Search, Filter, PawPrint, Dog, Cat, MapPin, AlertTriangle } from 'lucide-react';
import { missingAPI } from '../../services/api';
import '../../css/Missing.css';

const Missing = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [missingPets, setMissingPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewingSightings, setViewingSightings] = useState(false);
  const [sightings, setSightings] = useState([]);
  const [sightingForm, setSightingForm] = useState({
    location: '',
    sighting_date: '',
    description: '',
    reporter_name: '',
    reporter_email: '',
    reporter_phone: ''
  });

  useEffect(() => {
    fetchMissingPets();
  }, [filter]);

  const fetchMissingPets = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filter === 'dogs') {
        params.species = 'Dog';
      } else if (filter === 'cats') {
        params.species = 'Cat';
      }

      const response = await missingAPI.getAllMissingPets(params);
      setMissingPets(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching missing pets:', err);
      setError('Failed to load missing pets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleReportSighting = (pet) => {
    setSelectedPet(pet);
    setViewingSightings(false);
    setShowModal(true);
  };

  const handleViewSightings = async (pet) => {
    try {
      setSelectedPet(pet);
      const response = await missingAPI.getSightings(pet.missing_id);
      setSightings(response.data || []);
      setViewingSightings(true);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching sightings:', err);
      setSightings([]);
      setViewingSightings(true);
      setShowModal(true);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSightingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitSighting = async (e) => {
    e.preventDefault();
    
    try {
      const sightingData = {
        ...sightingForm,
        missing_id: selectedPet.missing_id
      };
      
      const response = await missingAPI.reportSighting(sightingData);
      
      alert(response.message || 'Sighting reported successfully! The owner will be notified.');
      
      setSightingForm({
        location: '',
        sighting_date: '',
        description: '',
        reporter_name: '',
        reporter_email: '',
        reporter_phone: ''
      });
      setShowModal(false);
      setSelectedPet(null);
    } catch (err) {
      console.error('Error submitting sighting:', err);
      alert(err.message || 'Failed to report sighting. Please try again.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPet(null);
    setViewingSightings(false);
    setSightings([]);
    setSightingForm({
      location: '',
      sighting_date: '',
      description: '',
      reporter_name: '',
      reporter_email: '',
      reporter_phone: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredPets = missingPets.filter(pet => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      pet.pet_name.toLowerCase().includes(search) ||
      (pet.breed && pet.breed.toLowerCase().includes(search)) ||
      pet.species.toLowerCase().includes(search) ||
      (pet.last_seen_location && pet.last_seen_location.toLowerCase().includes(search))
    );
  });

  if (loading) {
    return (
      <div className="missing-page">
        <section className="missing-hero">
          <div className="container">
            <h1 className="page-title">Loading missing pets...</h1>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="missing-page">
        <section className="missing-hero">
          <div className="container">
            <h1 className="page-title">Error</h1>
            <p className="page-subtitle">{error}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="missing-page">
      <section className="missing-hero">
        <div className="container">
          <h1 className="page-title fade-in">Help Find Missing Pets</h1>
          <p className="page-subtitle fade-in">
            Help reunite these lost pets with their families. If you've seen any of them, please reach out!
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
            <p>Showing <strong>{filteredPets.length}</strong> missing pet{filteredPets.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="pets-grid">
            {filteredPets.map((pet, index) => (
              <div key={pet.missing_id} className="pet-card missing-card fade-in">
                <div className="pet-image-wrapper">
                  <img 
                    src={pet.image_url || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop'} 
                    alt={pet.pet_name} 
                    className="pet-image" 
                  />
                  <div className="pet-status missing">
                    Missing
                  </div>
                  <div className="urgent-badge">
                    <AlertTriangle size={16} />
                  </div>
                </div>
                <div className="pet-info">
                  <h3 className="pet-name">{pet.pet_name}</h3>
                  <p className="pet-breed">
                    {pet.breed || pet.species} {pet.age ? `• ${pet.age} years` : ''}
                  </p>
                  <div className="pet-location">
                    <MapPin size={16} />
                    Last seen: {pet.last_seen_location}
                  </div>
                  <p className="pet-description">
                    Missing since {formatDate(pet.last_seen_date)}. {pet.description || 'Please help find this pet.'}
                  </p>
                  <button 
                    className="btn btn-orange btn-contact"
                    onClick={() => handleReportSighting(pet)}
                  >
                    Report Sighting
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
              <h2>
                {viewingSightings ? `Sightings of ${selectedPet.pet_name}` : `Report Sighting of ${selectedPet.pet_name}`}
              </h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            {viewingSightings ? (
              <div className="sightings-view">
                {sightings.length === 0 ? (
                  <p className="no-sightings">No sightings reported yet.</p>
                ) : (
                  <div className="sightings-list">
                    {sightings.map((sighting) => (
                      <div key={sighting.sighting_id} className="sighting-item">
                        <div className="sighting-header">
                          <strong>📍 {sighting.location}</strong>
                          <span>{formatDate(sighting.sighting_date)}</span>
                        </div>
                        <p>{sighting.description}</p>
                        {sighting.reporter_name && (
                          <p className="reporter">Reported by: {sighting.reporter_name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={closeModal} className="btn btn-secondary">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitSighting}>
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={sightingForm.location}
                    onChange={handleFormChange}
                    required
                    placeholder="Where did you see the pet?"
                  />
                </div>

                <div className="form-group">
                  <label>Date of Sighting *</label>
                  <input
                    type="date"
                    name="sighting_date"
                    value={sightingForm.sighting_date}
                    onChange={handleFormChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={sightingForm.description}
                    onChange={handleFormChange}
                    required
                    rows="4"
                    placeholder="Describe what you saw..."
                  />
                </div>

                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    name="reporter_name"
                    value={sightingForm.reporter_name}
                    onChange={handleFormChange}
                    placeholder="Your name"
                  />
                </div>

                <div className="form-group">
                  <label>Your Email</label>
                  <input
                    type="email"
                    name="reporter_email"
                    value={sightingForm.reporter_email}
                    onChange={handleFormChange}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="form-group">
                  <label>Your Phone</label>
                  <input
                    type="tel"
                    name="reporter_phone"
                    value={sightingForm.reporter_phone}
                    onChange={handleFormChange}
                    placeholder="555-1234"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-orange">
                    Submit Sighting
                  </button>
                  <button type="button" onClick={closeModal} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Missing;