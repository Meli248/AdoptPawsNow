import { Link } from 'react-router-dom';
import '../../css/Home.css';

const Home = () => {
  const featuredPets = [
    {
      id: 1,
      name: 'Buddy',
      breed: 'Golden Retriever',
      type: 'Dog',
      age: '2 years',
      location: 'New York, NY',
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      name: 'Whiskers',
      breed: 'Tabby',
      type: 'Cat',
      age: '1 year',
      location: 'Los Angeles, CA',
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      name: 'Max',
      breed: 'Beagle',
      type: 'Dog',
      age: '6 months',
      location: 'Chicago, IL',
      status: 'Pending',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop'
    }
  ];

  const stats = [
    { icon: '🐾', number: '2,500+', label: 'Pets Adopted' },
    { icon: '👥', number: '10,000+', label: 'Happy Families' },
    { icon: '❤️', number: '500+', label: 'Volunteers' },
    { icon: '⚠️', number: '150+', label: 'Pets Reunited' }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="paw-pattern">🐾</div>
          <div className="paw-pattern">🐾</div>
          <div className="paw-pattern">🐾</div>
          <div className="hero-silhouettes">
            <div className="silhouette cat"></div>
            <div className="silhouette dog"></div>
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text fade-in">
            <div className="hero-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C10.9 2 10 2.9 10 4C10 4.7 10.4 5.4 11 5.7V7C11 8.1 10.1 9 9 9H7.2C6.9 8.4 6.3 8 5.5 8C4.7 8 4 8.7 4 9.5C4 10.3 4.7 11 5.5 11C6.3 11 6.9 10.6 7.2 10H9C10.9 10 12.5 8.7 12.9 7H14C16.2 7 18 8.8 18 11V12.3C17.4 12.6 17 13.3 17 14C17 15.1 17.9 16 19 16C20.1 16 21 15.1 21 14C21 13.3 20.6 12.6 20 12.3V11C20 7.7 17.3 5 14 5H12.9C12.5 3.3 10.9 2 12 2Z" fill="currentColor"/>
              </svg>
              Find Your Perfect Companion
            </div>
            <h1 className="hero-title">
              Every Pet Deserves a <br />
              <span className="title-highlight">Forever Home</span>
            </h1>
            <p className="hero-description">
              Connect with loving pets waiting for adoption, report missing pets, and help
              reunite families with their beloved companions.
            </p>
            <div className="hero-actions">
              <Link to="/adopt" className="btn btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                </svg>
                Adopt a Pet
              </Link>
              <Link to="/missing" className="btn btn-secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                </svg>
                Report Missing Pet
              </Link>
            </div>
          </div>

          <div className="hero-images slide-in-right">
            <div className="hero-image-main">
              <img src="https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=600&h=600&fit=crop" alt="Cats" />
            </div>
            <div className="hero-image-overlay">
              <span className="overlay-badge">Get New</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pets Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Pets</h2>
            <p className="section-subtitle">
              Meet some of our adorable pets looking for homes
            </p>
          </div>

          <div className="pets-grid">
            {featuredPets.map((pet, index) => (
              <div key={pet.id} className="pet-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="pet-image-wrapper">
                  <img src={pet.image} alt={pet.name} className="pet-image" />
                  <div className={`pet-status ${pet.status.toLowerCase()}`}>
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
                  <p className="pet-breed">{pet.breed} • {pet.type}</p>
                  <div className="pet-details">
                    <div className="pet-detail">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                      </svg>
                      <span>{pet.location}</span>
                    </div>
                    <div className="pet-detail">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
                      </svg>
                      <span>{pet.age}</span>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-adopt">
                    Adopt {pet.name}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="view-all-container">
            <Link to="/adopt" className="btn btn-secondary">
              View All Pets
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" fill="currentColor"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Our simple process makes pet adoption easy and rewarding
          </p>

          <div className="steps-grid">
            <div className="step-card fade-in">
              <div className="step-number">1</div>
              <div className="step-icon">🔍</div>
              <h3 className="step-title">Browse Pets</h3>
              <p className="step-description">
                Explore our collection of adorable pets waiting for their forever homes
              </p>
            </div>

            <div className="step-card fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="step-number">2</div>
              <div className="step-icon">💬</div>
              <h3 className="step-title">Get in Touch</h3>
              <p className="step-description">
                Connect with shelters and discuss adoption details
              </p>
            </div>

            <div className="step-card fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="step-number">3</div>
              <div className="step-icon">🏠</div>
              <h3 className="step-title">Welcome Home</h3>
              <p className="step-description">
                Complete the adoption and bring your new friend home
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background"></div>
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Make a Difference?</h2>
            <p className="cta-subtitle">
              Whether you want to adopt a pet or help reunite lost animals with their families, you
              can make a difference today.
            </p>
            <div className="cta-actions">
              <Link to="/adopt" className="btn btn-secondary">
                Adopt a Pet
              </Link>
              <Link to="/missing" className="btn btn-orange">
                Report Missing Pet
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;