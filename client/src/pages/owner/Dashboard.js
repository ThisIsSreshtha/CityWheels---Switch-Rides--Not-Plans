import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './OwnerPanel.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentVehicles, setRecentVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, vehiclesRes] = await Promise.all([
        axios.get('/api/owner/stats'),
        axios.get('/api/owner/vehicles')
      ]);
      setStats(statsRes.data.data);
      setRecentVehicles(vehiclesRes.data.data.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="owner-panel">
        <Sidebar user={user} currentPath={location.pathname} onLogout={handleLogout} />
        <div className="owner-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-panel">
      <Sidebar user={user} currentPath={location.pathname} onLogout={handleLogout} />
      <div className="owner-content">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your rental business</p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">🚗</div>
            <div className="stat-info">
              <h3>{stats?.totalVehicles || 0}</h3>
              <p>Total Vehicles</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <h3>{stats?.activeVehicles || 0}</h3>
              <p>Available</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber">📋</div>
            <div className="stat-info">
              <h3>{stats?.rentedVehicles || 0}</h3>
              <p>Rented Out</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">💰</div>
            <div className="stat-info">
              <h3>₹{stats?.totalEarnings || 0}</h3>
              <p>Total Earnings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon slate">📦</div>
            <div className="stat-info">
              <h3>{stats?.totalBookings || 0}</h3>
              <p>Total Bookings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">🔄</div>
            <div className="stat-info">
              <h3>{stats?.activeBookings || 0}</h3>
              <p>Active Rentals</p>
            </div>
          </div>
        </div>

        <div className="owner-card">
          <div className="owner-card-header">
            <h3>🚘 Recent Vehicles</h3>
            <Link to="/owner/rentals" className="btn-outline">View All</Link>
          </div>
          {recentVehicles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🚗</div>
              <h3>No vehicles yet</h3>
              <p>Add your first vehicle to start earning</p>
              <Link to="/owner/rentals" className="btn-primary-owner">+ Add Vehicle</Link>
            </div>
          ) : (
            <table className="owner-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>City</th>
                  <th>Daily Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentVehicles.map(v => (
                  <tr key={v._id}>
                    <td><strong>{v.name}</strong></td>
                    <td style={{ textTransform: 'capitalize' }}>{v.type}</td>
                    <td>{v.location?.city}</td>
                    <td>₹{v.pricing?.daily}</td>
                    <td>
                      <span className={`status-badge ${v.availability}`}>{v.availability}</span>
                    </td>
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

// ===== Shared Sidebar Component =====
export const Sidebar = ({ user, currentPath, onLogout }) => {
  const links = [
    { to: '/owner/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/owner/rentals', icon: '🚗', label: 'My Rentals' },
    { to: '/owner/documents', icon: '📄', label: 'Documents' },
    { to: '/owner/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <aside className="owner-sidebar">
      <div className="sidebar-header">
        <h2>🏢 Owner Panel</h2>
        <p>Welcome, {user?.name || 'Owner'}</p>
      </div>
      <nav className="sidebar-nav">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`sidebar-link ${currentPath === link.to ? 'active' : ''}`}
          >
            <span className="link-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-divider" />
      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-btn">
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};

export default Dashboard;
