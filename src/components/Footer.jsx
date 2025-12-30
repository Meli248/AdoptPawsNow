import { Link } from 'react-router-dom';
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C10.9 2 10 2.9 10 4C10 4.7 10.4 5.4 11 5.7V7C11 8.1 10.1 9 9 9H7.2C6.9 8.4 6.3 8 5.5 8C4.7 8 4 8.7 4 9.5C4 10.3 4.7 11 5.5 11C6.3 11 6.9 10.6 7.2 10H9C10.9 10 12.5 8.7 12.9 7H14C16.2 7 18 8.8 18 11V12.3C17.4 12.6 17 13.3 17 14C17 15.1 17.9 16 19 16C20.1 16 21 15.1 21 14C21 13.3 20.6 12.6 20 12.3V11C20 7.7 17.3 5 14 5H12.9C12.5 3.3 10.9 2 12 2Z" fill="currentColor"/>
                <circle cx="8" cy="16" r="2" fill="currentColor"/>
                <circle cx="16" cy="16" r="2" fill="currentColor"/>
              </svg>
            </div>
            <span className="logo-text">
              Adopt<span className="logo-highlight">Paws</span>Now
            </span>
          </div>
        </div>

        <div className="footer-links">
          <Link to="/adopt" className="footer-link">Adopt</Link>
          <Link to="/missing" className="footer-link">Missing</Link>
          <Link to="/about" className="footer-link">About</Link>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2024 AdoptPawsNow • Made with{' '}
            <span className="heart">❤</span> for pets
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;