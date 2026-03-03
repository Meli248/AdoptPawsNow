import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, CheckCircle, Dog, Cat, Users, Clock, Plus, MapPin, Search, X, Filter, PawPrint } from 'lucide-react';
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
      const petsResponse = await fetch(`${import.meta.env.VITE_API_URL}/pets?status=all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const petsData = await petsResponse.json();
      const allPets = petsData.data || [];

      setPets(allPets.filter(p => p.status?.toLowerCase() === 'available'));

      // Calculate stats
      const adopted = allPets.filter(p => p.status?.toLowerCase() === 'adopted');
      const dogs = allPets.filter(p => p.species?.toLowerCase() === 'dog' && p.status?.toLowerCase() === 'available');
      const cats = allPets.filter(p => p.species?.toLowerCase() === 'cat' && p.status?.toLowerCase() === 'available');

      setStats({
        totalPosts: allPets.length,
        adoptedPets: adopted.length,
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

  /* Search & Filter Logic */
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');

  const filteredPets = pets.filter(pet => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pet.species && pet.species.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecies =
      speciesFilter === 'all' ||
      (pet.species && pet.species.toLowerCase() === speciesFilter);
    return matchesSearch && matchesSpecies;
  });

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

        {/* All Pet Posts */}
        <div className="all-pets-section">
          <h2 className="section-title">All Pet Posts</h2>

          {/* Search bar */}
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, breed, or species..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="search-clear-btn" title="Clear">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="filter-row">
            <Filter size={18} className="filter-row-icon" />
            <div className="filter-tabs">
              <button
                className={`filter-tab ${speciesFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSpeciesFilter('all')}
              >
                <PawPrint size={16} /> All Pets
              </button>
              <button
                className={`filter-tab ${speciesFilter === 'dog' ? 'active' : ''}`}
                onClick={() => setSpeciesFilter('dog')}
              >
                <Dog size={16} /> Dogs
              </button>
              <button
                className={`filter-tab ${speciesFilter === 'cat' ? 'active' : ''}`}
                onClick={() => setSpeciesFilter('cat')}
              >
                <Cat size={16} /> Cats
              </button>
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
                    {pet.status === 'available' ? 'Available' : 'Unavailable'}
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