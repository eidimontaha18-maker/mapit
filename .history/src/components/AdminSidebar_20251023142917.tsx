import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/AdminSidebar.css';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'maps',
      label: "User's Maps",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      ),
      path: '/admin/dashboard'
    },
    {
      id: 'packages',
      label: 'Packages',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      ),
      path: '/admin/packages'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="admin-sidebar-overlay"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              <path d="M2 12h20"></path>
            </svg>
            {isOpen && <span className="admin-sidebar-title">Admin Panel</span>}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`admin-sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              title={!isOpen ? item.label : undefined}
            >
              <span className="admin-sidebar-icon">{item.icon}</span>
              {isOpen && <span className="admin-sidebar-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer - Toggle Button */}
        <div className="admin-sidebar-footer">
          <button 
            className="admin-sidebar-toggle"
            onClick={onToggle}
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s ease' }}
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            {isOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
