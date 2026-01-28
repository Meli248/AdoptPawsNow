import { Link } from 'react-router-dom';
import { 
  Heart, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  PawPrint, 
  Users, 
  Activity, 
  ArrowRight, 
  Search, 
  MessageSquare, 
  Home as HomeIcon 
} from 'lucide-react';
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
    { icon: <PawPrint size={32} />, number: '2,500+', label: 'Pets Adopted' },
    { icon: <Users size={32} />, number: '10,000+', label: 'Happy Families' },
    { icon: <Heart size={32} />, number: '500+', label: 'Volunteers' },
    { icon: <Activity size={32} />, number: '150+', label: 'Pets Reunited' }
  ];

  const steps = [
    {
      number: 1,
      icon: <Search size={48} />,
      title: 'Browse Pets',
      description: 'Explore our collection of adorable pets waiting for their forever homes'
    },
    {
      number: 2,
      icon: <MessageSquare size={48} />,
      title: 'Get in Touch',
      description: 'Connect with shelters and discuss adoption details'
    },
    {
      number: 3,
      icon: <HomeIcon size={48} />,
      title: 'Welcome Home',
      description: 'Complete the adoption and bring your new friend home'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="paw-pattern paw-1">
            <PawPrint size={40} />
          </div>
          <div className="paw-pattern paw-2">
            <PawPrint size={32} />
          </div>
          <div className="paw-pattern paw-3">
            <PawPrint size={36} />
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text fade-in">
            <div className="hero-badge">
              <PawPrint size={20} />
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
                <Heart size={20} />
                Adopt a Pet
              </Link>
              <Link to="/missing" className="btn btn-secondary">
                <AlertTriangle size={20} />
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
                    <Heart size={20} />
                  </button>
                </div>
                <div className="pet-info">
                  <h3 className="pet-name">{pet.name}</h3>
                  <p className="pet-breed">{pet.breed} • {pet.type}</p>
                  <div className="pet-details">
                    <div className="pet-detail">
                      <MapPin size={16} />
                      <span>{pet.location}</span>
                    </div>
                    <div className="pet-detail">
                      <Clock size={16} />
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
              <ArrowRight size={20} />
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
            {steps.map((step, index) => (
              <div key={step.number} className="step-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="step-number">{step.number}</div>
                <div className="step-icon-wrapper">
                  {step.icon}
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
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