import React, { useEffect, useState } from 'react';
import './AppNavBar.css';
import mapitLogo from '../assets/mapit-logo.svg';
import { useNavigate, Link } from 'react-router-dom';

const AppNavBar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status on component mount and whenever localStorage changes
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('mapit_logged_in') === 'true';
      setIsLoggedIn(loggedIn);
    };
    
    checkLoginStatus();
    
    // Add event listener to detect changes in localStorage across tabs/windows
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mapit_logged_in');
    setIsLoggedIn(false);
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <nav className="app-navbar creative-navbar">
      <div className="app-navbar-logo creative-navbar-logo">
        <Link to={isLoggedIn ? "/maps" : "/"} className="logo-link">
          <img src={mapitLogo} alt="MapIt Logo" className="modern-logo" />
        </Link>
      </div>
      <div className="app-navbar-actions creative-navbar-actions">
        {isLoggedIn ? (
          <button className="app-navbar-logout creative-navbar-logout" onClick={handleLogout}>Logout</button>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="app-navbar-login">Login</Link>
            <Link to="/register" className="app-navbar-signup">Signup</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AppNavBar;
