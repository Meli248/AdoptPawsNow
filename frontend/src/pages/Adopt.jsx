import { useState } from 'react';
import '../css/Adopt.css';

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
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, breed, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="filter-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" fill="currentColor"/>
              </svg>
            </button>
          </div>

          <div className="filter-tabs fade-in">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C10.9 2 10 2.9 10 4C10 4.7 10.4 5.4 11 5.7V7C11 8.1 10.1 9 9 9H7.2C6.9 8.4 6.3 8 5.5 8C4.7 8 4 8.7 4 9.5C4 10.3 4.7 11 5.5 11C6.3 11 6.9 10.6 7.2 10H9C10.9 10 12.5 8.7 12.9 7H14C16.2 7 18 8.8 18 11V12.3C17.4 12.6 17 13.3 17 14C17 15.1 17.9 16 19 16C20.1 16 21 15.1 21 14C21 13.3 20.6 12.6 20 12.3V11C20 7.7 17.3 5 14 5H12.9C12.5 3.3 10.9 2 12 2Z" fill="currentColor"/>
              </svg>
              All Pets
            </button>
            <button 
              className={`filter-tab ${filter === 'dogs' ? 'active' : ''}`}
              onClick={() => setFilter('dogs')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 4c-1.71 0-3.09 1.32-3 3 0 .26.09.51.16.75h-.32c-.28 0-.55.09-.78.27C13.83 7.66 13.2 7.5 12.5 7.5c-.7 0-1.33.16-1.56.52-.23-.18-.5-.27-.78-.27h-.32c.07-.24.16-.49.16-.75 0-1.68-1.29-3-3-3s-3 1.32-3 3c0 1.14.63 2.14 1.56 2.66C3.56 10.75 2.5 12.76 2.5 15c0 2.76 2.24 5 5 5 1.38 0 2.64-.56 3.54-1.46C12 19.44 13.26 20 14.5 20c2.76 0 5-2.24 5-5 0-2.24-1.06-4.25-2.56-5.34.93-.52 1.56-1.52 1.56-2.66 0-1.68-1.29-3-3-3z" fill="currentColor"/>
              </svg>
              Dogs
            </button>
            <button 
              className={`filter-tab ${filter === 'cats' ? 'active' : ''}`}
              onClick={() => setFilter('cats')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8c-2.27 0-4.44.86-6.12 2.42-.44.41-.66.97-.66 1.53 0 .13 0 .25.03.37.06.43.24.82.52 1.14.82.93 2.14 2.29 3.62 3.87C10.29 18.27 11.2 19 12 19s1.71-.73 2.61-1.67c1.48-1.58 2.8-2.94 3.62-3.87.28-.32.46-.71.52-1.14.03-.12.03-.24.03-.37 0-.56-.22-1.12-.66-1.53C16.44 8.86 14.27 8 12 8zm-4 7.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm8 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM7.3 2.5c-.23 0-.46.1-.62.27-.39.41-.37 1.06.04 1.45l2.07 2.03c.19.19.44.28.69.28.26 0 .51-.1.7-.3.38-.4.37-1.04-.03-1.43L8.08 2.76c-.2-.19-.47-.26-.78-.26zm9.4 0c-.31 0-.58.07-.78.26L13.85 4.8c-.4.39-.41 1.03-.03 1.43.19.2.44.3.7.3.25 0 .5-.09.69-.28l2.07-2.03c.41-.39.43-1.04.04-1.45-.16-.17-.39-.27-.62-.27z" fill="currentColor"/>
              </svg>
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
                <div className="pet-info">
                  <h3 className="pet-name">{pet.name}</h3>
                  <p className="pet-breed">{pet.breed} • {pet.age}</p>
                  <div className="pet-location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                    </svg>
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