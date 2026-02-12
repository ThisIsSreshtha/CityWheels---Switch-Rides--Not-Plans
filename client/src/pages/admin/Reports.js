import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AdminSidebar } from './Home';
import './AdminPanel.css';

const Reports = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('adminSidebarCollapsed') === 'true');
  const toggleSidebar = () => setSidebarCollapsed(prev => { const next = !prev; localStorage.setItem('adminSidebarCollapsed', next); return next; });
  const handleLogout = () => { logout(); /* Navigation handled by AuthContext.logout */ };

  return (
    <div className={`admin-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="admin-content">
        <h1 className="admin-page-title">Reports & Analytics</h1>
        <p className="admin-page-subtitle">Revenue reports, booking analytics, and business metrics</p>
        <div className="admin-card">
          <div className="admin-empty-state">
            <div className="admin-empty-icon">📈</div>
            <h3>Reports & Analytics</h3>
            <p>This page will show revenue reports, booking analytics, and other business metrics.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
