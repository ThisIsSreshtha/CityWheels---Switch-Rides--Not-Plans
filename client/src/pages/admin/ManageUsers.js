import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AdminSidebar } from './Home';
import './AdminPanel.css';

const ManageUsers = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('adminSidebarCollapsed') === 'true');
  const toggleSidebar = () => setSidebarCollapsed(prev => { const next = !prev; localStorage.setItem('adminSidebarCollapsed', next); return next; });
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className={`admin-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="admin-content">
        <h1 className="admin-page-title">Manage Users</h1>
        <p className="admin-page-subtitle">View all users with options to verify documents, activate/deactivate accounts</p>
        <div className="admin-card">
          <div className="admin-empty-state">
            <div className="admin-empty-icon">👥</div>
            <h3>User Management</h3>
            <p>This page will show all users with options to verify documents, activate/deactivate accounts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
