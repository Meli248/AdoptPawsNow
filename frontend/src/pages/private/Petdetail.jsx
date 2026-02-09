import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, Edit, Trash2, Heart } from 'lucide-react';
import '../../css/PetDetail.css';

const PetDetail = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role'));

  const [formData, setFormData] = useState({
    applicant_name: '',
    email: '',
    phone: '',
    address: '',
    reason: ''
  });

  useEffect(() => {
    fetchPetDetails();
    checkIfFavorited();
  }, [petId]);

  const [isFavorited, setIsFavorited] = useState(false);

  const checkIfFavorited = async () => {
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
        // data.data is array of pets. Check if any has id == petId
        const found = data.data.some(p => p.id === parseInt(petId) || p.pet_id === parseInt(petId));
        setIsFavorited(found);
      }
    } catch (err) {
      console.error("Error checking favorites:", err);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Please login to favorite pets');
        return;
      }

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
        setIsFavorited(!isFavorited);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const fetchPetDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pets/${petId}`);
      const data = await response.json();

      if (data.success) {
        setPet(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pet details:', error);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this pet?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Pet deleted successfully');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/edit-pet/${petId}`);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pets/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          pet_id: petId
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
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="pet-detail">
        <div className="detail-container">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="pet-detail">
        <div className="detail-container">
          <h1>Pet not found</h1>
        </div>
      </div>
    );
  }

  const isAdmin = userRole === 'admin';

  return (
    <div className="pet-detail">
      <div className="detail-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="detail-content">
          <div className="detail-image-section">
            <img
              src={pet.image_url ? `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}${pet.image_url}` : 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=600&h=600&fit=crop'}
              alt={pet.name}
              className="detail-image"
            />
            <div className="detail-status adoption">
              For Adoption
            </div>
            <button
              className="favorite-btn-detail"
              onClick={handleToggleFavorite}
            >
              <Heart
                size={24}
                fill={isFavorited ? "red" : "none"}
                color={isFavorited ? "red" : "currentColor"}
              />
            </button>
          </div>

          <div className="detail-info-section">
            <div className="detail-header">
              <div>
                <h1 className="detail-title">{pet.name}</h1>
                <p className="detail-breed">{pet.breed || pet.species} • {pet.age ? `${pet.age} year${pet.age > 1 ? 's' : ''}` : 'Age unknown'}</p>
              </div>

              {isAdmin && (
                <div className="admin-actions">
                  <button className="btn-edit-detail" onClick={handleEdit}>
                    <Edit size={20} />
                  </button>
                  <button className="btn-delete-detail" onClick={handleDelete}>
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="detail-meta">
              <div className="meta-item">
                <MapPin size={18} />
                <span>{pet.location || 'Los Angeles, CA'}</span>
              </div>
              <div className="meta-item">
                <Calendar size={18} />
                <span>Posted on {new Date(pet.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

            </div>

            <div className="detail-section">
              <h2>About {pet.name}</h2>
              <p className="detail-description">
                {pet.description || 'Sweet and playful pet. Loves to cuddle and play with toys. Indoor pet preferred.'}
              </p>
            </div>

            <div className="detail-section">
              <h2>Pet Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Species</span>
                  <span className="info-value">{pet.species || 'Cat'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Breed</span>
                  <span className="info-value">{pet.breed || 'Mixed'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Age</span>
                  <span className="info-value">{pet.age ? `${pet.age} year${pet.age > 1 ? 's' : ''}` : 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Gender</span>
                  <span className="info-value">{pet.gender || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Size</span>
                  <span className="info-value">{pet.size || 'Medium'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Color</span>
                  <span className="info-value">{pet.color || 'Orange Tabby'}</span>
                </div>
              </div>
            </div>

            {/* Admin Only Contact Info */}
            {isAdmin && (
              <div className="detail-section" style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px border #dee2e6' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#495057' }}>Contact Information (Admin Only)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Contact Name</span>
                    <span style={{ fontWeight: '500', color: '#212529' }}>{pet.contact_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Email</span>
                    <span style={{ fontWeight: '500', color: '#212529' }}>{pet.contact_email || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Phone</span>
                    <span style={{ fontWeight: '500', color: '#212529' }}>{pet.contact_phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {!isAdmin && (
              <div className="action-buttons">
                <button
                  className="btn-primary-large"
                  onClick={() => setShowModal(true)}
                  style={{ backgroundColor: '#6b9b7f', width: '100%' }}
                >
                  <Heart size={20} style={{ marginRight: '8px' }} />
                  Adopt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adoption Application Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply to Adopt {pet.name}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
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
                <label>Why do you want to adopt {pet.name}?</label>
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
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
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

export default PetDetail;