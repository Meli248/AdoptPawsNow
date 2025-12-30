import { Link } from "react-router-dom";
import "../css/navBar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">
        🐾 Adopt Paws
      </div>

      {/* Links */}
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/adopt">Adopt</Link></li>
        <li><Link to="/missing">Missing</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
