import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Bell, Menu, X } from 'lucide-react';
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C10.9 2 10 2.9 10 4C10 4.7 10.4 5.4 11 5.7V7C11 8.1 10.1 9 9 9H7.2C6.9 8.4 6.3 8 5.5 8C4.7 8 4 8.7 4 9.5C4 10.3 4.7 11 5.5 11C6.3 11 6.9 10.6 7.2 10H9C10.9 10 12.5 8.7 12.9 7H14C16.2 7 18 8.8 18 11V12.3C17.4 12.6 17 13.3 17 14C17 15.1 17.9 16 19 16C20.1 16 21 15.1 21 14C21 13.3 20.6 12.6 20 12.3V11C20 7.7 17.3 5 14 5H12.9C12.5 3.3 10.9 2 12 2Z" fill="currentColor" />
              <circle cx="8" cy="16" r="2" fill="currentColor" />
              <circle cx="16" cy="16" r="2" fill="currentColor" />
            </svg>
          </div>
          <span className="logo-text">
            Adopt<span className="logo-highlight">Paws</span>Now
          </span>
        </Link>

        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'mobile-active' : ''}`}>
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
                  to="/admin/surrender-requests"
                  onClick={closeMenu}
                  className={location.pathname === '/admin/surrender-requests' ? 'nav-link active' : 'nav-link'}
                >
                  Surrender Requests
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
                  to="/surrender-request"
                  onClick={closeMenu}
                  className={location.pathname === '/surrender-request' ? 'nav-link active' : 'nav-link'}
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

        <div className={`navbar-actions ${isMenuOpen ? 'mobile-active' : ''}`}>
          {isAuthenticated ? (
            <>
              <div style={{ position: 'relative' }}>
                {!isAdmin && (
                  <button
                    onClick={handleNotificationOpen}
                    className={`btn-icon notification-bell-wrapper ${showNotifications ? 'active' : ''}`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', position: 'relative' }}
                  >
                    <Bell size={21} />
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                  </button>
                )}
                {!isAdmin && <Notification isOpen={showNotifications} onClose={() => setShowNotifications(false)} />}
              </div>

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

        {/* Mobile Backdrop */}
        {isMenuOpen && <div className="navbar-backdrop" onClick={closeMenu}></div>}
      </div>
    </nav>
  );
};

export default Navbar;