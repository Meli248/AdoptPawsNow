import { Link } from 'react-router-dom';
import '../css/About.css';

const About = () => {
  const stats = [
    { icon: '❤️', value: '1000+', label: 'Happy Adoptions' },
    { icon: '👥', value: '500+', label: 'Active Users' },
    { icon: '🛡️', value: '50+', label: 'Pets Reunited' },
    { icon: '🎯', value: '100%', label: 'Dedicated Support' }
  ];

  const values = [
    {
      title: 'Compassion',
      description: 'We care deeply about the welfare of all animals and the families who love them.'
    },
    {
      title: 'Community',
      description: 'We believe in the power of community to make a difference in pets\' lives.'
    },
    {
      title: 'Transparency',
      description: 'We maintain honest and open communication throughout the adoption process.'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content fade-in">
            <div className="hero-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C10.9 2 10 2.9 10 4C10 4.7 10.4 5.4 11 5.7V7C11 8.1 10.1 9 9 9H7.2C6.9 8.4 6.3 8 5.5 8C4.7 8 4 8.7 4 9.5C4 10.3 4.7 11 5.5 11C6.3 11 6.9 10.6 7.2 10H9C10.9 10 12.5 8.7 12.9 7H14C16.2 7 18 8.8 18 11V12.3C17.4 12.6 17 13.3 17 14C17 15.1 17.9 16 19 16C20.1 16 21 15.1 21 14C21 13.3 20.6 12.6 20 12.3V11C20 7.7 17.3 5 14 5H12.9C12.5 3.3 10.9 2 12 2Z" fill="currentColor"/>
                <circle cx="8" cy="16" r="2" fill="currentColor"/>
                <circle cx="16" cy="16" r="2" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="about-title">About AdoptPawsNow</h1>
            <p className="about-subtitle">
              We're on a mission to connect loving pets with caring families, and help reunite lost
              animals with their owners.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content fade-in">
            <h2 className="section-title">Our Mission</h2>
            <p className="mission-text">
              At AdoptPawsNow, we believe every pet deserves a loving home. Our platform makes it
              easy for pet lovers to find their perfect companion and for owners to find their lost
              furry friends.
            </p>
            <p className="mission-text">
              Whether you're looking to adopt a new family member or need help locating a missing
              pet, we're here to support you every step of the way.
            </p>
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
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <div className="container">
          <div className="cta-content fade-in">
            <h2 className="cta-title">Ready to Make a Difference?</h2>
            <p className="cta-subtitle">
              Join our community today and help pets find their forever homes.
            </p>
            <div className="cta-actions">
              <Link to="/adopt" className="btn btn-primary">
                Browse Pets
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;