import { Link } from 'react-router-dom';
import { PawPrint, Heart } from 'lucide-react';
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container footer-new-layout">
        <div className="footer-brand-info">
          <h3>Adopt Paws</h3>
          <p>Helping pets find safe and loving forever homes.</p>
        </div>

        <div className="footer-contact-info">
          <p>Contact: <a href="mailto:support@adoptpaws.com">support@adoptpaws.com</a></p>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">© 2026 Adopt Paws. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;