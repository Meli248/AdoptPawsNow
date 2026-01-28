import { Link } from 'react-router-dom';
import { PawPrint, Heart, Users, Shield, Target } from 'lucide-react';
import '../../css/About.css';

const About = () => {
  const stats = [
    { icon: <Heart size={32} />, value: '1000+', label: 'Happy Adoptions' },
    { icon: <Users size={32} />, value: '500+', label: 'Active Users' },
    { icon: <Shield size={32} />, value: '50+', label: 'Pets Reunited' },
    { icon: <Target size={32} />, value: '100%', label: 'Dedicated Support' }
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
              <PawPrint size={80} />
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