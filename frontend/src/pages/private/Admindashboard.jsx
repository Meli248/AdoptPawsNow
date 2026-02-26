import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, CheckCircle, AlertTriangle, Dog, Cat, Users, Clock, Plus, MapPin, Search } from 'lucide-react';
import { getImageUrl } from '../../utils/imageHelper';
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
          <div className="loading-state">
            <Clock className="animate-spin" size={48} />
            <p>Loading dashboard data...</p>
          </div>
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
            <Plus size={20} />
            Surrender Form
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Grid size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-value">{stats.totalPosts}</p>
              <p className="stat-label">Total Posts</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-success">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-value">{stats.adoptedPets}</p>
              <p className="stat-label">Adopted</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-dog">
              <Dog size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-value">{stats.dogs}</p>
              <p className="stat-label">Dogs</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-cat">
              <Cat size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-value">{stats.cats}</p>
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
                    src={getImageUrl(selectedItem.image_url)}
                    alt={selectedItem.pet_name || selectedItem.name}
                    className="modal-image"
                  />
                </div>

                <div className="modal-info">
                  <p><strong>Type:</strong> {selectedItem.pet_type || selectedItem.species}</p>
                  <p><strong>Breed:</strong> {selectedItem.breed || 'Unknown'}</p>
                  <p><strong>Age:</strong> {selectedItem.age || 'Unknown'}</p>
                  <p><strong>Gender:</strong> {selectedItem.gender || 'Unknown'}</p>
                  <p><strong>Reason/Description:</strong> {selectedItem.reason || selectedItem.description}</p>
                  <p><strong>Location:</strong> {selectedItem.location || 'N/A'}</p>
                  <p><strong>Contact:</strong> {selectedItem.contact_phone || selectedItem.contact_email || 'N/A'}</p>
                  <p><strong>Status:</strong> <span className={`status-badge ${selectedItem.status}`}>{selectedItem.status}</span></p>
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
                      src={getImageUrl(request.image_url)}
                      alt={request.pet_name}
                      className="request-image"
                    />
                    <div className="request-badge">Pending</div>
                  </div>
                  <div className="request-content">
                    <h3>{request.pet_name} ({request.pet_type})</h3>
                    <p className="request-detail"><strong>Breed:</strong> {request.breed || 'Unknown'}</p>
                    <p className="request-detail"><strong>Age:</strong> {request.age} years</p>
                    <p className="request-detail"><strong>Location:</strong> {request.location}</p>

                    <div className="request-actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSurrenderAction(request.application_id, 'approved');
                        }}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-secondary"
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
          <div className="section-header">
            <h2 className="section-title">All Pet Posts</h2>
            <div className="search-bar-wrapper">
              <div className="search-bar">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search pets by name, breed, or species..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>

          <div className="pets-grid">
            {filteredPets.slice(0, 12).map((pet) => (
              <div key={pet.pet_id} className="pet-card" onClick={() => handleViewPet(pet.pet_id)}>
                <div className="pet-image-wrapper">
                  <img
                    src={getImageUrl(pet.image_url)}
                    alt={pet.name}
                    className="pet-image"
                  />
                  <div className={`pet-status ${pet.status}`}>
                    {pet.status === 'available' ? 'For Adoption' : pet.status}
                  </div>
                </div>
                <div className="pet-info">
                  <h3 className="pet-name">{pet.name}</h3>
                  <p className="pet-breed">
                    {pet.breed || pet.species} • {pet.age ? `${pet.age} years` : 'Age unknown'}
                  </p>
                  <div className="pet-location">
                    <MapPin size={16} />
                    {pet.location || 'Location not specified'}
                  </div>
                  <p className="pet-description">
                    {pet.description?.substring(0, 80) || 'No description available'}...
                  </p>
                  <p className="pet-posted-by">
                    <Users size={14} />
                    Posted by {pet.username || 'Admin User'}
                  </p>

                  <div className="pet-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEditPet(pet.pet_id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
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