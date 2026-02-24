import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, CheckCircle, AlertTriangle, Dog, Cat, Users, Clock } from 'lucide-react';
import '../../css/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPosts: 0,
    adoptedPets: 0,
    missingPets: 0,
    dogs: 0,
    cats: 0
  });
  const [pets, setPets] = useState([]);
  const [surrenderRequests, setSurrenderRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); // For modal

  useEffect(() => {
    // Check if user is admin
    const userRole = localStorage.getItem('user_role');
    if (userRole !== 'admin') {
      navigate('/home');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');

      // Fetch all pets
      const petsResponse = await fetch(`${import.meta.env.VITE_API_URL}/pets?status=all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const petsData = await petsResponse.json();
      const allPets = petsData.data || [];

      setPets(allPets);

      // Fetch Surrender Requests (Pending)
      const surrenderResponse = await fetch(`${import.meta.env.VITE_API_URL}/surrender?status=pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const surrenderData = await surrenderResponse.json();
      setSurrenderRequests(surrenderData.data || []);

      // Calculate stats
      const adoptionPets = allPets.filter(p => !['missing', 'found', 'closed'].includes(p.status?.toLowerCase()));
      const missingPets = allPets.filter(p => p.status?.toLowerCase() === 'missing');

      const dogs = allPets.filter(p => p.species?.toLowerCase() === 'dog');
      const cats = allPets.filter(p => p.species?.toLowerCase() === 'cat');
      const adopted = allPets.filter(p => p.status?.toLowerCase() === 'adopted');

      setStats({
        totalPosts: allPets.length,
        adoptedPets: adopted.length,
        missingPets: missingPets.length,
        dogs: dogs.length,
        cats: cats.length
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleDeletePet = async (petId) => {
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
        fetchDashboardData();
      } else {
        alert('Failed to delete pet');
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
      alert('Error deleting pet');
    }
  };

  const handleEditPet = (petId) => {
    navigate(`/admin/edit-pet/${petId}`);
  };

  const handleViewPet = (petId) => {
    navigate(`/pet/${petId}`);
  };

  const handleSurrenderAction = async (id, status) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/surrender/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        alert(`Request ${status === 'approved' ? 'accepted' : 'declined'} successfully`);
        fetchDashboardData(); // Refresh data
      } else {
        alert('Failed to update request status');
      }
    } catch (error) {
      console.error('Error updating surrender status:', error);
      alert('Error updating status');
    }
  };

  /* Search Logic */
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (pet.species && pet.species.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-container">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome, Admin User!</h1>
            <p className="dashboard-subtitle">Manage all pets and users from your admin dashboard.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/surrender-request')}
          >
            + Surrender Form
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Grid size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-value">{stats.totalPosts}+</p>
              <p className="stat-label">Total Posts</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-success">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-value">{stats.adoptedPets}+</p>
              <p className="stat-label">Adopted</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-dog">
              <Dog size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-value">{stats.dogs}+</p>
              <p className="stat-label">Dogs</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-cat">
              <Cat size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-value">{stats.cats}+</p>
              <p className="stat-label">Cats</p>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedItem && (
          <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>

              <div className="modal-header">
                <h2>{selectedItem.pet_name || selectedItem.name} Details</h2>
              </div>

              <div className="modal-body">
                <div className="modal-image-container">
                  <img
                    src={selectedItem.image_url ? `http://localhost:5000${selectedItem.image_url}` : 'https://via.placeholder.com/400'}
                    alt={selectedItem.pet_name || selectedItem.name}
                    className="modal-image"
                  />
                </div>

                <div className="modal-info">
                  <p><strong>Type:</strong> {selectedItem.pet_type || selectedItem.species}</p>
                  <p><strong>Breed:</strong> {selectedItem.breed || 'Unknown'}</p>
                  <p><strong>Age:</strong> {selectedItem.age || 'Unknown'} years</p>
                  <p><strong>Gender:</strong> {selectedItem.gender || 'Unknown'}</p>
                  <p><strong>Reason/Description:</strong> {selectedItem.reason || selectedItem.description}</p>
                  <p><strong>Location:</strong> {selectedItem.location}</p>
                  <p><strong>Contact:</strong> {selectedItem.contact_phone || selectedItem.contact_email || 'N/A'}</p>
                  <p><strong>Status:</strong> {selectedItem.status}</p>
                  {selectedItem.user_name && <p><strong>Submitted by:</strong> {selectedItem.user_name} ({selectedItem.user_email})</p>}
                </div>
              </div>

              <div className="modal-actions">
                {selectedItem.application_id && selectedItem.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        handleSurrenderAction(selectedItem.application_id, 'approved');
                        setSelectedItem(null);
                      }}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        handleSurrenderAction(selectedItem.application_id, 'rejected');
                        setSelectedItem(null);
                      }}
                    >
                      Decline
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Surrender Requests Section */}
        {surrenderRequests.length > 0 && (
          <div className="surrender-section">
            <h2 className="section-title">Pending Surrender Requests</h2>
            <div className="requests-grid">
              {surrenderRequests.map((request) => (
                <div
                  key={request.application_id}
                  className="request-card"
                  onClick={() => setSelectedItem(request)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="request-image-wrapper">
                    <img
                      src={request.image_url ? `http://localhost:5000${request.image_url}` : 'https://via.placeholder.com/300'}
                      alt={request.pet_name}
                      className="request-image"
                    />
                    <div className="request-badge">Pending</div>
                  </div>
                  <div className="request-content">
                    <h3>{request.pet_name} ({request.pet_type})</h3>
                    <p className="request-detail"><strong>Breed:</strong> {request.breed || 'Unknown'}</p>
                    <p className="request-detail"><strong>Age:</strong> {request.age} years</p>
                    <p className="request-detail"><strong>Reason:</strong> {request.reason}</p>
                    <p className="request-detail"><strong>Location:</strong> {request.location}</p>

                    <div className="request-actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="btn-accept"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSurrenderAction(request.application_id, 'approved');
                        }}
                      >
                        Accept
                      </button>
                      <button
                        className="btn-decline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSurrenderAction(request.application_id, 'rejected');
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Pet Posts */}
        <div className="all-pets-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>All Pet Posts</h2>
            <div className="search-bar" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search pets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '20px',
                  border: '1px solid #ddd',
                  width: '300px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div className="pets-grid">
            {filteredPets.slice(0, 8).map((pet) => (
              <div key={pet.pet_id} className="pet-card" onClick={() => handleViewPet(pet.pet_id)}>
                <div className="pet-image-wrapper">
                  <img
                    src={pet.image_url ? `http://localhost:5000${pet.image_url}` : 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop'}
                    alt={pet.name}
                    className="pet-image"
                  />
                  <div className="pet-status adoption">
                    For Adoption
                  </div>
                  <button
                    className="favorite-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
                <div className="pet-info">
                  <h3 className="pet-name">{pet.name}</h3>
                  <p className="pet-breed">
                    {pet.breed || pet.species} • {pet.age ? `${pet.age} years` : 'Age unknown'}
                  </p>
                  <div className="pet-location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor" />
                    </svg>
                    {pet.location || 'Location not specified'}
                  </div>
                  <p className="pet-description">
                    {pet.description?.substring(0, 80) || 'No description available'}...
                  </p>
                  <p className="pet-posted-by">Posted by {pet.username || 'Admin User'}</p>

                  <div className="pet-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-edit"
                      onClick={() => handleEditPet(pet.pet_id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeletePet(pet.pet_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;