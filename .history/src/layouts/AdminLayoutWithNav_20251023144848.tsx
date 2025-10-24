import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavBar';
import '../styles/AdminLayout.css';

const AdminLayoutWithNav: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      <AdminNavBar />
      <AdminSidebar isOpen={sidebarOpen} onToggle={handleToggleSidebar} />
      <main className={`admin-content admin-content-with-navbar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayoutWithNav;
