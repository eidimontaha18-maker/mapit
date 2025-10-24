import React, { useEffect, useState } from 'react';
import './AppNavBar.css';
import mapitLogo from '../assets/mapit-logo.svg';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AppNavBar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  // No need for local state or localStorage checks as we're using AuthContext

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
