import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/AdminLayout.css';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={sidebarOpen} onToggle={handleToggleSidebar} />
      <main className={`admin-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
