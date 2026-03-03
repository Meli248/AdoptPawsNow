import { Link } from 'react-router-dom';
import { PawPrint, Heart, Users, Shield } from 'lucide-react';
import '../../css/About.css';

const About = () => {
  const values = [
    {
      icon: <Heart size={40} />,
      title: 'Compassion',
      description: 'We care deeply about the welfare of all animals and the families who love them.'
    },
    {
      icon: <Users size={40} />,
      title: 'Community',
      description: 'We believe in the power of community to make a difference in pets\' lives.'
    },
    {
      icon: <Shield size={40} />,
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
              animals with their owners across Nepal.
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
              Whether you're looking to adopt a new family member or want to help a pet in need,
              pet, we're here to support you every step of the way. We've created a simple,
              user-friendly platform that brings together animal lovers, shelters, and pet owners
              in one compassionate community.
            </p>
            <p className="mission-text">
              Our platform serves as a bridge between pets in need and people with big hearts.
              We provide tools for posting adoption listings and connecting
              with fellow animal lovers. Every day, we work to make a difference in the lives of
              animals and the families who care for them.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">Our Core Values</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="value-icon">{value.icon}</div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-content fade-in">
            <h2 className="section-title">Our Story</h2>
            <p className="story-text">
              AdoptPawsNow was created with a simple vision: to make pet adoption and reunion
              easier and more accessible for everyone. We saw the challenges faced by both
              pet owners looking to rehome their beloved companions and families searching
              for the perfect pet to join their household.
            </p>
            <p className="story-text">
              Through our platform, we've witnessed countless heartwarming stories of pets
              finding their forever homes and lost animals being reunited with their worried
              families. These success stories fuel our commitment to improving and expanding
              our services every day.
            </p>
            <p className="story-text">
              We're proud to serve the pet-loving community across Nepal, providing a safe,
              reliable, and easy-to-use platform for all your pet adoption needs.
              Join us in making a difference, one paw at a time.
            </p>
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
              <Link to="/post-request" className="btn btn-secondary">
                Find a New Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;