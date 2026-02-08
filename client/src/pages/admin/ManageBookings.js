import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AdminSidebar } from './Home';
import './AdminPanel.css';

const ManageBookings = () => {
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
        <h1 className="admin-page-title">Manage Bookings</h1>
        <p className="admin-page-subtitle">Verify, start, complete, and manage all bookings</p>
        <div className="admin-card">
          <div className="admin-empty-state">
            <div className="admin-empty-icon">📋</div>
            <h3>Booking Management</h3>
            <p>This page will show all bookings with options to verify, start, complete, and manage bookings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;
