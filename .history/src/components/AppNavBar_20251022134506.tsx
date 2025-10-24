import React from 'react';
import './AppNavBar.css';
import mapitLogo from '../assets/mapit-logo.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AppNavBarProps { 
  onLogout?: () => void;
  onSaveMap?: () => Promise<void>;
  isAdminViewing?: boolean; // New prop to indicate admin is viewing a map
}

const AppNavBar: React.FC<AppNavBarProps> = ({ onLogout, onSaveMap, isAdminViewing = false }) => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current user is admin
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  // No need for local state or localStorage checks as we're using AuthContext

  const handleLogout = async () => {
    // Auto-save before logout if we're on a map creation/editing page
    const isOnMapPage = location.pathname === '/create-map' || 
                       location.pathname.startsWith('/edit-map/') ||
                       location.pathname.startsWith('/view-map/');
    
    if (isOnMapPage && onSaveMap) {
      try {
        console.log('Auto-saving before logout...');
        await onSaveMap();
        console.log('Auto-save successful before logout');
      } catch (error) {
        console.error('Failed to auto-save before logout:', error);
        // Show user a confirmation dialog
        const confirmLogout = window.confirm(
          'Failed to save your work. Do you want to logout anyway? Unsaved changes may be lost.'
        );
        if (!confirmLogout) return; // Don't logout if user cancels
      }
    }
    
    logout(); // Use the logout function from AuthContext
    if (onLogout) onLogout();
    navigate('/login');
  };

  const handleLogoClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if we're on a map creation/editing page and need to auto-save
    const isOnMapPage = location.pathname === '/create-map' || 
                       location.pathname.startsWith('/edit-map/') ||
                       location.pathname.startsWith('/view-map/');
    
    if (isOnMapPage && onSaveMap) {
      try {
        console.log('Auto-saving before navigation...');
        await onSaveMap();
        console.log('Map auto-saved before navigation');
      } catch (error) {
        console.error('Failed to auto-save map:', error);
        // Show user a warning but continue navigation
        console.warn('Navigation continuing despite save failure');
      }
    }
    
    // Navigate to dashboard if logged in, otherwise go to home/login
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="app-navbar creative-navbar">
      <div className="app-navbar-logo creative-navbar-logo">
        <div className="logo-link" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img src={mapitLogo} alt="MapIt Logo" className="modern-logo" />
        </div>
      </div>
      <div className="app-navbar-actions creative-navbar-actions">
        {isAdminViewing ? (
          // Admin viewing mode - show modern back button, no logout
          <button 
            className="admin-back-button"
            onClick={() => navigate('/admin/dashboard')}
            title="Back to Admin Dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            <span>Back to Dashboard</span>
          </button>
        ) : isLoggedIn ? (
          <button className="app-navbar-logout creative-navbar-logout" onClick={handleLogout}>Logout</button>
        ) : (
          <div className="auth-buttons">
            <button 
              className="app-navbar-login" 
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="app-navbar-signup" 
              onClick={() => navigate('/register')}
            >
              Signup
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AppNavBar;
