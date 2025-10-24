import React, { useEffect, useState } from 'react';
import './AppNavBar.css';
import mapitLogo from '../assets/mapit-logo.svg';
import { useNavigate, Link } from 'react-router-dom';

const AppNavBar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem('mapit_logged_in') === 'true';
    setIsLoggedIn(loggedIn);
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
        <span className="app-navbar-title creative-navbar-title">MapIt</span>
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
