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
  const [loading, setLoading] = useState(true);

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
      const petsResponse = await fetch(`${import.meta.env.VITE_API_URL}/pets/pets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const petsData = await petsResponse.json();
      const allPets = petsData.data || [];

      setPets(allPets);

      // Calculate stats
      const adoptionPets = allPets.filter(p => p.type === 'adoption');
      const missingPets = allPets.filter(p => p.type === 'missing');
      const dogs = allPets.filter(p => p.species?.toLowerCase() === 'dog');
      const cats = allPets.filter(p => p.species?.toLowerCase() === 'cat');
      const adopted = adoptionPets.filter(p => p.status?.toLowerCase() === 'adopted');

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
            className="btn-create-post"
            onClick={() => navigate('/admin/create-post')}
          >
            + Create New Post
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

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="action-buttons">
            <button
              className="action-btn"
              onClick={() => navigate('/adopt')}
            >
              <Grid size={20} />
              View All Pets
            </button>
            <button
              className="action-btn"
              onClick={() => navigate('/admin/surrender-requests')}
            >
              <Clock size={20} />
              Surrender Requests
            </button>
          </div>
        </div>

        {/* All Pet Posts */}
        <div className="all-pets-section">
          <h2 className="section-title">All Pet Posts</h2>
          <div className="pets-grid">
            {pets.slice(0, 8).map((pet) => (
              <div key={pet.pet_id} className="pet-card" onClick={() => handleViewPet(pet.pet_id)}>
                <div className="pet-image-wrapper">
                  <img
                    src={pet.image_url ? `http://localhost:5000${pet.image_url}` : 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop'}
                    alt={pet.name}
                    className="pet-image"
                  />
                  <div className={`pet-status ${pet.type === 'missing' ? 'missing' : 'adoption'}`}>
                    {pet.type === 'missing' ? 'Missing' : 'For Adoption'}
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