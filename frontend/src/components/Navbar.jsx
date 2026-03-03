import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Bell, Menu, X, PawPrint } from 'lucide-react';
import Notification from './Notification';
import { useAuth } from '../context/AuthContext';
import '../css/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, isAuthenticated, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (showNotifications) setShowNotifications(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    let intervalId;

    const fetchUnreadCount = async () => {
      if (!isAuthenticated || isAdmin) return;
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/unread-count`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    if (isAuthenticated && !isAdmin) {
      fetchUnreadCount();
      intervalId = setInterval(fetchUnreadCount, 30000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated, isAdmin]);

  const handleNotificationOpen = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadCount(0); // Optimistically clear badge
    }
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <PawPrint size={28} strokeWidth={2.5} />
          </div>
          <span className="logo-text">
            Adopt<span className="logo-highlight">Paws</span>Now
          </span>
        </Link>

        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          <Menu size={24} />
        </button>

        <div className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <span className="logo-text" style={{ color: 'white' }}>Adopt<span style={{ color: 'white', opacity: 0.8 }}>Paws</span>Now</span>
            <button className="mobile-menu-close" onClick={closeMenu}>
              <X size={28} color="white" />
            </button>
          </div>

          <ul className="navbar-menu">
            {isAdmin ? (
              <>
                <li>
                  <Link
                    to="/admin/dashboard"
                    onClick={closeMenu}
                    className={location.pathname === '/admin/dashboard' ? 'nav-link active' : 'nav-link'}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/post-requests"
                    onClick={closeMenu}
                    className={location.pathname === '/admin/post-requests' ? 'nav-link active' : 'nav-link'}
                  >
                    Post Requests
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/adoption-requests"
                    onClick={closeMenu}
                    className={location.pathname === '/admin/adoption-requests' ? 'nav-link active' : 'nav-link'}
                  >
                    Adoption Requests
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/home"
                    onClick={closeMenu}
                    className={location.pathname === '/' || location.pathname === '/home' ? 'nav-link active' : 'nav-link'}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/adopt"
                    onClick={closeMenu}
                    className={location.pathname === '/adopt' ? 'nav-link active' : 'nav-link'}
                  >
                    Adopt
                  </Link>
                </li>
                <li>
                  <Link
                    to="/post-request"
                    onClick={closeMenu}
                    className={location.pathname === '/post-request' ? 'nav-link active' : 'nav-link'}
                  >
                    Form
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    onClick={closeMenu}
                    className={location.pathname === '/about' ? 'nav-link active' : 'nav-link'}
                  >
                    About
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={handleNotificationOpen}
                      className={`btn-icon notification-bell-wrapper ${showNotifications ? 'active' : ''}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', position: 'relative' }}
                    >
                      <Bell size={21} />
                      {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </button>
                    <Notification isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                  </div>
                )}

                <Link to="/profile" className="user-profile" onClick={closeMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
                  </svg>
                  <span>{user}</span>
                </Link>
                <button onClick={() => { handleLogout(); closeMenu(); }} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-text" onClick={closeMenu}>Login</Link>
                <Link to="/register" className="btn btn-primary" onClick={closeMenu}>Get Started</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Backdrop */}
        {isMenuOpen && <div className="navbar-backdrop" onClick={closeMenu}></div>}
      </div>
    </nav>
  );
};

export default Navbar;