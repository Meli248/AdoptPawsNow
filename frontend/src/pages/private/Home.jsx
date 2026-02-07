import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  AlertTriangle,
  MapPin,
  Clock,
  PawPrint,
  Activity,
  ArrowRight,
  Search,
  MessageSquare,
  Home as HomeIcon,
  Plus,
  Dog,
  Cat
} from 'lucide-react';
import CreatePostModal from '../../components/Createpost';
import '../../css/Home.css';

const Home = () => {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [featuredPets, setFeaturedPets] = useState([]);
  const [stats, setStats] = useState({
    petsAdopted: '0',
    petsReunited: '0',
    dogs: '0',
    cats: '0'
  });
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('access_token');
  const observerRef = useRef(null);

  // Lazy loading intersection observer
  const imageObserver = useCallback((node) => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observerRef.current.unobserve(img);
          }
        }
      });
    });

    if (node) observerRef.current.observe(node);
  }, []);

  // Fetch featured pets and stats from API
  useEffect(() => {
    const fetchFeaturedPets = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/pets/pets?status=available`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
          // Get first 3 pets for featured section
          setFeaturedPets(data.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching featured pets:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        // ✅ FIXED: Use dedicated stats endpoint for better performance
        const response = await fetch(`${import.meta.env.VITE_API_URL}/stats/home`);
        const data = await response.json();

        if (data.success && data.data) {
          const { petsAdopted, dogs, cats } = data.data;
          setStats({
            petsAdopted: petsAdopted > 0 ? `${petsAdopted}+` : '0',
            dogs: dogs > 0 ? `${dogs}+` : '0',
            cats: cats > 0 ? `${cats}+` : '0'
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default stats on error
      }
    };

    fetchFeaturedPets();
    fetchStats();
  }, []);

  const statsData = [
    { icon: <PawPrint size={32} />, number: stats.petsAdopted, label: 'Pets Adopted' },
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
    navigate('/surrender-request');
  };

  // Handle navigation to protected routes
  const handleProtectedNavigation = (path) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(path);
  };

  const handleCreatePost = (postData) => {
    console.log('Post created:', postData);
    // Here you would typically make an API call to save the post
  };

  const [favorites, setFavorites] = useState(new Set());

  // Helper function to get image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=400&fit=crop';
    if (imageUrl.startsWith('http')) return imageUrl;

    // Strip '/api' from the end of VITE_API_URL if it exists
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');

    // Ensure imageUrl starts with / if it doesn't
    const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

    return `${baseUrl}${cleanPath}`;
  };

  // Fetch favorites on load
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // favorites from API returns pet objects joined with favorites
        const favSet = new Set(data.data.map(pet => pet.pet_id));
        setFavorites(favSet);
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  const toggleFavorite = async (e, petId) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please login to favorite pets');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const isFavorited = favorites.has(petId);
      const method = isFavorited ? 'DELETE' : 'POST';
      const url = isFavorited
        ? `${import.meta.env.VITE_API_URL}/users/favorites/${petId}`
        : `${import.meta.env.VITE_API_URL}/users/favorites`;

      const body = isFavorited ? undefined : JSON.stringify({ pet_id: petId });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      });

      if (response.ok) {
        setFavorites(prev => {
          const newFavs = new Set(prev);
          if (isFavorited) newFavs.delete(petId);
          else newFavs.add(petId);
          return newFavs;
        });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  // Handle image load
  const handleImageLoad = (petId) => {
    setImagesLoaded(prev => ({ ...prev, [petId]: true }));
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
              Connect with loving pets waiting for adoption, report missing pets, and help
              reunite families with their beloved companions.
            </p>
            <div className="hero-actions">
              <button
                onClick={handleCreatePostClick}
                className="btn btn-primary btn-hero-large"
              >
                <Plus size={20} />
                Form
              </button>
              <div className="hero-actions-secondary">
                <button
                  onClick={() => handleProtectedNavigation('/adopt')}
                  className="btn btn-secondary"
                >
                  <Heart size={20} />
                  Adopt a Pet
                </button>

              </div>
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
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Pets</h2>
            <p className="section-subtitle">
              Meet some of our adorable pets looking for homes
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading pets...</p>
            </div>
          ) : featuredPets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No pets available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="pets-grid">
              {featuredPets.map((pet, index) => {
                const imgUrl = getImageUrl(pet.image_url);
                console.log(`Pet ${pet.name} (${pet.pet_id}):`, pet, 'URL:', imgUrl);
                return (
                  <div key={pet.pet_id} className="pet-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="pet-image-wrapper">
                      <img
                        src={imgUrl}
                        alt={pet.name}
                        className="pet-image"
                        onError={(e) => {
                          console.log('Image failed to load:', getImageUrl(pet.image_url));
                          e.target.src = 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=400&fit=crop';
                        }}
                      />
                      <div className={`pet-status ${pet.status?.toLowerCase() || 'available'}`}>
                        {pet.status || 'Available'}
                      </div>
                      <button
                        className="favorite-btn"
                        onClick={(e) => toggleFavorite(e, pet.pet_id)}
                      >
                        <Heart
                          size={20}
                          fill={favorites.has(pet.pet_id) ? "red" : "none"}
                          color={favorites.has(pet.pet_id) ? "red" : "currentColor"}
                        />
                      </button>
                    </div>
                    <div className="pet-info">
                      <h3 className="pet-name">{pet.name}</h3>
                      <p className="pet-breed">{pet.breed || 'Mixed'} • {pet.species || 'Pet'}</p>
                      <div className="pet-details">
                        <div className="pet-detail">
                          <MapPin size={16} />
                          <span>{pet.location || 'Location N/A'}</span>
                        </div>
                        <div className="pet-detail">
                          <Clock size={16} />
                          <span>{pet.age ? `${pet.age} yrs` : 'Age Unknown'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleProtectedNavigation('/adopt')}
                        className="btn btn-primary btn-adopt"
                      >
                        Adopt {pet.name}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="view-all-container">
            <button
              onClick={() => handleProtectedNavigation('/adopt')}
              className="btn btn-secondary"
            >
              View All Pets
              <ArrowRight size={20} />
            </button>
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
              <button
                onClick={() => handleProtectedNavigation('/adopt')}
                className="btn btn-secondary"
              >
                Adopt a Pet
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* Create Post Modal - Only shown if authenticated */}
      {isAuthenticated && (
        <CreatePostModal
          isOpen={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </div>
  );
};

export default Home;