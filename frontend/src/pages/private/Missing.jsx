import { useState } from 'react';
import { Search, Filter, PawPrint, Dog, Cat, MapPin, AlertTriangle } from 'lucide-react';
import '../../css/Missing.css';

const Missing = () => {
  const [filter, setFilter] = useState('all');

  const missingPets = [
    {
      id: 1,
      name: 'Max',
      breed: 'Black Labrador',
      type: 'Dog',
      age: '3 years',
      location: 'New York, NY',
      lastSeen: 'Missing since January 25th. Last seen near Central Park. Has a blue collar with name...',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop'
    }
  ];

  return (
    <div className="missing-page">
      {/* Hero Section */}
      <section className="missing-hero">
        <div className="container">
          <h1 className="page-title fade-in">Help Find Missing Pets</h1>
          <p className="page-subtitle fade-in">
            Help reunite these lost pets with their families. If you've seen any of them, please reach out!
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="search-section">
        <div className="container">
          <div className="search-bar fade-in">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by name, breed, or location..."
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

      {/* Missing Pets Grid */}
      <section className="pets-section">
        <div className="container">
          <div className="pets-info">
            <p>Showing <strong>1</strong> missing pet</p>
          </div>

          <div className="pets-grid">
            {missingPets.map((pet, index) => (
              <div key={pet.id} className="pet-card missing-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="pet-image-wrapper">
                  <img src={pet.image} alt={pet.name} className="pet-image" />
                  <div className="pet-status missing">
                    Missing
                  </div>
                  <div className="urgent-badge">
                    <AlertTriangle size={16} />
                  </div>
                </div>
                <div className="pet-info">
                  <h3 className="pet-name">{pet.name}</h3>
                  <p className="pet-breed">{pet.breed} • {pet.age}</p>
                  <div className="pet-location">
                    <MapPin size={16} />
                    {pet.location}
                  </div>
                  <p className="pet-description">{pet.lastSeen}</p>
                  <button className="btn btn-orange btn-contact">
                    Report Sighting
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Missing;