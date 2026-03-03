import { PawPrint, Heart } from 'lucide-react';
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-center">
          <div className="footer-brand">
            <PawPrint size={28} className="footer-paw" />
            <h3>Adopt Paws</h3>
          </div>
          <p className="footer-tagline">Helping pets find safe and loving forever homes.</p>
          <p className="footer-copyright">© 2026 Adopt Paws. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;