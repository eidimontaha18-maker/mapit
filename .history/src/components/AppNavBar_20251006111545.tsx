import React from 'react';
import './AppNavBar.css';
import mapitLogo from '../assets/mapit-logo.svg';

const AppNavBar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => (
  <nav className="app-navbar creative-navbar">
    <div className="app-navbar-logo creative-navbar-logo">
      <span className="app-navbar-title creative-navbar-title">MapIt</span>
    </div>
    <div className="app-navbar-actions creative-navbar-actions">
      {onLogout && (
        <button className="app-navbar-logout creative-navbar-logout" onClick={onLogout}>Logout</button>
      )}
    </div>
  </nav>
);

export default AppNavBar;
