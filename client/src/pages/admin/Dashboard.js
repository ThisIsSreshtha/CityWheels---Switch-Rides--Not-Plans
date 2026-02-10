import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { AdminSidebar } from './Home';
import './AdminPanel.css';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('adminSidebarCollapsed') === 'true');
  const toggleSidebar = () => setSidebarCollapsed(prev => { const next = !prev; localStorage.setItem('adminSidebarCollapsed', next); return next; });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalBookings: 0,
    activeBookings: 0,
    pendingVerifications: 0,
    totalRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/admin/dashboard');
      setStats(res.data.data.stats);
      setRecentBookings(res.data.data.recentBookings);
    } catch (error) {
      toast.error('Error fetching dashboard data');
    }
  };

  const handleLogout = () => { logout(); /* Navigation handled by AuthContext.logout */ };

  return (
    <div className={`admin-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="admin-content">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Platform statistics overview</p>

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon blue">👥</div>
            <div className="admin-stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon green">🚗</div>
            <div className="admin-stat-info">
              <h3>{stats.totalVehicles}</h3>
              <p>Total Vehicles</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon amber">📋</div>
            <div className="admin-stat-info">
              <h3>{stats.totalBookings}</h3>
              <p>Total Bookings</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon purple">🔄</div>
            <div className="admin-stat-info">
              <h3>{stats.activeBookings}</h3>
              <p>Active Bookings</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon red">⏳</div>
            <div className="admin-stat-info">
              <h3>{stats.pendingVerifications}</h3>
              <p>Pending Verifications</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon teal">💰</div>
            <div className="admin-stat-info">
              <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3>📋 Recent Bookings</h3>
          </div>
          {recentBookings.length === 0 ? (
            <p>No recent bookings</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>User</th>
                  <th>Vehicle</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(booking => (
                  <tr key={booking._id}>
                    <td>{booking.bookingId}</td>
                    <td>{booking.user?.name || 'N/A'}</td>
                    <td>{booking.vehicle?.name || 'N/A'}</td>
                    <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                    <td><span className={`admin-status-badge ${booking.status}`}>{booking.status}</span></td>
                    <td>₹{booking.pricing?.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
