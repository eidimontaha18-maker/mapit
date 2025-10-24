import React from 'react';
import './AppNavBar.css';
import mapitLogo from '../assets/mapit-logo.svg';

const AppNavBar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => (
  <nav className="app-navbar">
    <div className="app-navbar-logo">
      <img src={mapitLogo} alt="MapIt Logo" style={{ height: 40 }} />
      <span className="app-navbar-title">MapIt</span>
    </div>
    <div className="app-navbar-actions">
      {onLogout && (
        <button className="app-navbar-logout" onClick={onLogout}>Logout</button>
      )}
    </div>
  </nav>
);

export default AppNavBar;
