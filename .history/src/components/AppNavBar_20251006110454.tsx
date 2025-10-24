import React from 'react';
import './AppNavBar.css';

const AppNavBar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => (
  <nav className="app-navbar">
    <div className="app-navbar-logo">
      <img src={require('../assets/mapit-logo.svg')} alt="MapIt Logo" style={{ height: 40 }} />
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
