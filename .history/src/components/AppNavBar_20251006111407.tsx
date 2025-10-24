import React from 'react';
import './AppNavBar.css';
import mapitLogo from '../assets/mapit-logo.svg';

const AppNavBar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => (
  <nav className="app-navbar creative-navbar">
    <div className="app-navbar-logo creative-navbar-logo">
      <div style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #4f8cff 0%, #a1e3ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(79,140,255,0.10)',
        marginRight: 12,
      }}>
        <img src={mapitLogo} alt="MapIt Logo" style={{ height: 24, width: 24 }} />
      </div>
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
