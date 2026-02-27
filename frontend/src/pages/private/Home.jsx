import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  PawPrint,
  ArrowRight,
  Search,
  MessageSquare,
  Home as HomeIcon,
  Plus,
  Cat,
  MapPin,
  Dog
} from 'lucide-react';
import '../../css/Home.css';

const Home = () => {
  const [stats, setStats] = useState({
    totalPets: '0',
    petsAdopted: '0',
    dogs: '0',
    cats: '0'
  });
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/stats/home`);
        const data = await response.json();

        if (data.success && data.data) {
          const { totalPets, petsAdopted, dogs, cats } = data.data;
          setStats({
            totalPets: totalPets > 0 ? `${totalPets}+` : '0',
            petsAdopted: petsAdopted > 0 ? `${petsAdopted}+` : '0',
            dogs: dogs > 0 ? `${dogs}+` : '0',
            cats: cats > 0 ? `${cats}+` : '0'
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchFeaturedPets = async () => {
      try {
        setLoadingPets(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/pets?limit=3`);
        const data = await response.json();
        if (data.success) {
          setFeaturedPets(data.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching featured pets:', error);
      } finally {
        setLoadingPets(false);
      }
    };

    fetchStats();
    fetchFeaturedPets();
  }, []);

  const statsData = [
    { icon: <PawPrint size={32} />, number: stats.totalPets, label: 'Total Pets' },
    { icon: <Heart size={32} />, number: stats.petsAdopted, label: 'Adopted' },
    { icon: <Dog size={32} />, number: stats.dogs, label: 'Dogs' },
    { icon: <Cat size={32} />, number: stats.cats, label: 'Cats' }
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

  // Handle Create Post button click
  const handleCreatePostClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/post-request');
  };

  // Handle navigation to protected routes
  const handleProtectedNavigation = (path) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(path);
  };

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
              Connect with loving pets waiting for adoption and help them find their forever homes.
            </p>
            <div className="hero-actions">
              <button
                onClick={handleCreatePostClick}
                className="btn btn-hero btn-primary"
              >
                <Plus size={20} />
                Form
              </button>
              <button
                onClick={() => handleProtectedNavigation('/adopt')}
                className="btn btn-hero btn-secondary"
              >
                <Heart size={20} />
                Adopt a Pet
              </button>
            </div>
          </div>

          <div className="hero-images slide-in-right">
            <div className="hero-image-main">
              <img src="https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=600&h=600&fit=crop" alt="Cats" />
            </div>
            <div className="hero-image-overlay">
              <button
                onClick={() => handleProtectedNavigation('/adopt')}
                className="overlay-badge"
              >
                Adopt
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {statsData.map((stat, index) => (
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
      <section className="featured-pets-section">
        <div className="container">
          <div className="section-header-inline">
            <div>
              <h2 className="section-title">Featured Pets</h2>
              <p className="section-subtitle">Meet some of our adorable friends looking for a home</p>
            </div>
            <button
              onClick={() => handleProtectedNavigation('/adopt')}
              className="btn btn-secondary btn-sm"
            >
              View All <ArrowRight size={16} />
            </button>
          </div>

          {loadingPets ? (
            <div className="loading-pets">Loading featured friends...</div>
          ) : (
            <div className="pets-grid">
              {featuredPets.map((pet, index) => (
                <div
                  key={pet.pet_id || pet.id}
                  className="pet-card fade-in"
                  style={{ animationDelay: `${index * 0.1}s`, cursor: 'pointer' }}
                  onClick={() => handleProtectedNavigation(`/pet/${pet.pet_id || pet.id}`)}
                >
                  <div className="pet-image-wrapper">
                    <img
                      src={pet.image_url ? `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}${pet.image_url}` : 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop'}
                      alt={pet.name}
                      className="pet-image"
                    />
                    <div className={`pet-status ${pet.status === 'available' || !pet.status ? 'available' : 'unavailable'}`}>
                      {pet.status === 'available' || !pet.status ? 'Available' : 'Unavailable'}
                    </div>
                    {/* Basic Favorite button to match design */}
                    <button
                      className="favorite-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart size={20} />
                    </button>
                  </div>
                  <div className="pet-info">
                    <h3 className="pet-name">{pet.name}</h3>
                    <p className="pet-breed">
                      {pet.breed || pet.species} • {pet.age ? `${pet.age} years` : 'Age unknown'}
                    </p>
                    <div className="pet-location">
                      <MapPin size={16} />
                      {pet.size || 'Medium'} • {pet.gender || 'Unknown'}
                    </div>
                    <p className="pet-description">
                      {pet.description?.substring(0, 80) || 'A wonderful pet looking for a loving home.'}
                      {pet.description?.length > 80 && '...'}
                    </p>
                    <button
                      className="btn btn-primary btn-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProtectedNavigation(`/pet/${pet.pet_id || pet.id}`);
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            <div className="cta-actions" style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => handleProtectedNavigation('/adopt')}
                className="btn btn-cta"
              >
                Adopt a Pet
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;