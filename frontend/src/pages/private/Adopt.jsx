import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, PawPrint, Dog, Cat, MapPin, Heart, User, Mail, Phone, X } from 'lucide-react';
import { adoptionAPI } from '../../services/api';
import '../../css/Adopt.css';

const Adopt = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role'));

  // Adoption Form State
  const [showModal, setShowModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({
    applicant_name: '',
    email: '',
    phone: '',
    address: '',
    reason: ''
  });

  const handleAdoptClick = (e, pet) => {
    e.stopPropagation(); // Prevent navigating to detail page
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
      const token = localStorage.getItem('access_token');
      // If no token, maybe prompt login? For now let's assume they might not need to be logged in or handle error
      // Ideally users should be logged in to adopt.
      if (!token) {
        alert('Please login to submit an adoption application.');
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/pets/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          pet_id: selectedPet.pet_id || selectedPet.id
        })
      });

      if (response.ok) {
        alert('Application submitted successfully! We will contact you soon.');
        setShowModal(false);
        setFormData({
          applicant_name: '',
          email: '',
          phone: '',
          address: '',
          reason: ''
        });
      } else {
        alert('Failed to submit application.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  // Favorites logic
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    fetchFavorites();
    fetchPets();
  }, [filter]);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        return;
      }

      const data = await response.json();
      if (data.success) {
        const favSet = new Set(data.data.map(f => f.pet_id));
        setFavorites(favSet);
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  const toggleFavorite = async (e, petId) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Please login to favorite pets');
        return;
      }

      const isFavorited = favorites.has(petId);
      const method = isFavorited ? 'DELETE' : 'POST';
      const url = isFavorited
        ? `${import.meta.env.VITE_API_URL}/users/favorites/${petId}`
        : `${import.meta.env.VITE_API_URL}/users/favorites`;

      const body = isFavorited ? undefined : JSON.stringify({ pet_id: petId });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      });

      if (response.ok) {
        setFavorites(prev => {
          const newFavs = new Set(prev);
          if (isFavorited) newFavs.delete(petId);
          else newFavs.add(petId);
          return newFavs;
        });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

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

  const handlePetClick = (petId) => {
    navigate(`/pet/${petId}`);
  };

  const filteredPets = pets.filter(pet => {
    if (pet.status && pet.status.toLowerCase() !== 'available') return false;
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
          {/* Search bar - standalone, full width */}
          <div className="search-bar fade-in">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by name, breed, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchTerm('')}
                title="Clear"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter row: funnel icon + tabs */}
          <div className="filter-row fade-in">
            <Filter size={18} className="filter-row-icon" />
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                <PawPrint size={16} />
                All Pets
              </button>
              <button
                className={`filter-tab ${filter === 'dogs' ? 'active' : ''}`}
                onClick={() => setFilter('dogs')}
              >
                <Dog size={16} />
                Dogs
              </button>
              <button
                className={`filter-tab ${filter === 'cats' ? 'active' : ''}`}
                onClick={() => setFilter('cats')}
              >
                <Cat size={16} />
                Cats
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="pets-section">
        <div className="container">
          <div className="pets-info">
            <p>Showing <strong>{filteredPets.length}</strong> available pets</p>
          </div>

          <div className="pets-grid">
            {filteredPets.map((pet) => (
              <div
                key={pet.pet_id}
                className="pet-card fade-in"
                onClick={() => handlePetClick(pet.pet_id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="pet-image-wrapper">
                  <img
                    src={pet.image_url ? `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}${pet.image_url}` : 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop'}
                    alt={pet.name}
                    className="pet-image"
                  />
                  <div className={`pet-status ${pet.status || 'available'}`}>
                    {pet.status === 'available' || !pet.status ? 'Available' : 'Unavailable'}
                  </div>
                  <button
                    className="favorite-btn"
                    onClick={(e) => toggleFavorite(e, pet.pet_id || pet.id)}
                  >
                    <Heart size={20} fill={favorites.has(pet.pet_id || pet.id) ? "red" : "none"} color={favorites.has(pet.pet_id || pet.id) ? "red" : "currentColor"} />
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
                    {pet.description?.substring(0, 100) || 'A wonderful pet looking for a loving home.'}
                    {pet.description?.length > 100 && '...'}
                  </p>

                  {/* Contact Information */}
                  {/* Contact Information - ADMIN ONLY */}
                  {userRole === 'admin' && pet.contact_name && (
                    <div className="pet-contact-info" style={{
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <p style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#6c757d',
                        marginBottom: '8px'
                      }}>
                        Contact for Adoption:
                      </p>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#495057',
                        margin: '4px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <User size={14} />
                        <strong>{pet.contact_name}</strong>
                      </p>
                      {pet.contact_email && (
                        <p style={{
                          fontSize: '0.85rem',
                          color: '#6c757d',
                          margin: '4px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Mail size={14} />
                          {pet.contact_email}
                        </p>
                      )}
                      {pet.contact_phone && (
                        <p style={{
                          fontSize: '0.85rem',
                          color: '#6c757d',
                          margin: '4px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Phone size={14} />
                          {pet.contact_phone}
                        </p>
                      )}
                    </div>
                  )}

                  {!userRole || userRole !== 'admin' ? (
                    <button
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/pet/${pet.pet_id || pet.id}`);
                      }}
                      style={{ marginTop: '15px', width: '100%' }}
                    >
                      View Details
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Adoption Application Modal */}
      {
        showModal && selectedPet && (
          <div className="modal-overlay" onClick={() => setShowModal(false)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center', pading: '20px'
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
              backgroundColor: 'white', padding: '2rem', borderRadius: '12px',
              maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto'
            }}>
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2>Apply to Adopt {selectedPet.name}</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              <form onSubmit={handleSubmitApplication}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name *</label>
                  <input
                    type="text"
                    name="applicant_name"
                    value={formData.applicant_name}
                    onChange={handleFormChange}
                    required
                    placeholder="John Doe"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ced4da' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    placeholder="john@example.com"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ced4da' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="555-1234"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ced4da' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    rows="2"
                    placeholder="123 Main St, City, State"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ced4da', resize: 'vertical' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Why do you want to adopt {selectedPet.name}?</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleFormChange}
                    rows="4"
                    placeholder="Tell us why you'd be a great pet parent..."
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ced4da', resize: 'vertical' }}
                  />
                </div>

                <div className="form-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{
                    backgroundColor: '#6b9b7f', color: 'white',
                    border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer'
                  }}>
                    Submit Application
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{
                    backgroundColor: '#6c757d', color: 'white',
                    border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer'
                  }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Adopt;