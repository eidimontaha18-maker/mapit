import React from 'react';
import './AppNavBar.css';
import mapitLogo from '../assets/mapit-logo.svg';

const AppNavBar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => (
  <nav className="app-navbar" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
    <div className="app-navbar-logo">
      <img src={mapitLogo} alt="MapIt Logo" style={{ height: 32 }} />
      <span className="app-navbar-title" style={{ color: '#222', fontWeight: 700, fontSize: '1.3em' }}>MapIt</span>
    </div>
    <div className="app-navbar-actions">
      {onLogout && (
        <button className="app-navbar-logout" style={{ background: '#fafafa', color: '#222', border: '1px solid #ccc', borderRadius: '6px', padding: '7px 18px', fontSize: '1em', fontWeight: 500, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }} onClick={onLogout}>Logout</button>
      )}
    </div>
  </nav>
);

export default AppNavBar;
