import { useState } from 'react';
import { Search, Filter, PawPrint, Dog, Cat, MapPin, Heart } from 'lucide-react';
import '../../css/Adopt.css';

const Adopt = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const pets = [
    {
      id: 1,
      name: 'Buddy',
      breed: 'Golden Retriever',
      type: 'Dog',
      age: '2 years',
      location: 'New York, NY',
      status: 'Available',
      description: 'Friendly and energetic golden retriever looking for a loving home. Great with kids and other...',
      image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      name: 'Whiskers',
      breed: 'Orange Tabby',
      type: 'Cat',
      age: '1 year',
      location: 'Los Angeles, CA',
      status: 'Available',
      description: 'Sweet and playful tabby cat. Loves to cuddle and play with toys. Indoor cat preferred.',
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      name: 'Luna',
      breed: 'Gray Tabby',
      type: 'Cat',
      age: '6 months',
      location: 'Chicago, IL',
      status: 'Available',
      description: 'Adorable kitten looking for her forever home. Very playful and curious. Litter trained.',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop'
    }
  ];

  return (
    <div className="adopt-page">
      {/* Hero Section */}
      <section className="adopt-hero">
        <div className="container">
          <h1 className="page-title fade-in">Find Your Perfect Companion</h1>
          <p className="page-subtitle fade-in">
            Give a loving pet their forever home. Browse our adorable dogs and cats waiting for families.
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

      {/* Pets Grid */}
      <section className="pets-section">
        <div className="container">
          <div className="pets-info">
            <p>Showing <strong>3</strong> pets for adoption</p>
          </div>

          <div className="pets-grid">
            {pets.map((pet, index) => (
              <div key={pet.id} className="pet-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="pet-image-wrapper">
                  <img src={pet.image} alt={pet.name} className="pet-image" />
                  <div className="pet-status available">
                    {pet.status}
                  </div>
                  <button className="favorite-btn">
                    <Heart size={20} />
                  </button>
                </div>
                <div className="pet-info">
                  <h3 className="pet-name">{pet.name}</h3>
                  <p className="pet-breed">{pet.breed} • {pet.age}</p>
                  <div className="pet-location">
                    <MapPin size={16} />
                    {pet.location}
                  </div>
                  <p className="pet-description">{pet.description}</p>
                  <button className="btn btn-primary btn-adopt">
                    Adopt {pet.name}
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

export default Adopt;