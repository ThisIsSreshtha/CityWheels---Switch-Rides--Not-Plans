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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('ownerSidebarCollapsed') === 'true';
  });
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

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('ownerSidebarCollapsed', String(next));
  };

  if (loading) {
    return (
      <div className={`owner-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="owner-content">
          <div className="owner-loading">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`owner-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
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
export const Sidebar = ({ user, currentPath, onLogout, collapsed, onToggle }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navSections = [
    {
      label: 'Overview',
      links: [
        { to: '/owner/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/owner/rentals', icon: '🚗', label: 'My Rentals' },
      ]
    },
    {
      label: 'Account',
      links: [
        { to: '/owner/documents', icon: '📄', label: 'Documents' },
        { to: '/owner/profile', icon: '👤', label: 'Profile' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`owner-sidebar-overlay ${mobileOpen ? 'show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`owner-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header with three-dot toggle */}
        <div className="owner-sidebar-header">
          <div className="owner-sidebar-brand">
            <div className="owner-sidebar-avatar">
              {collapsed ? '🏢' : user?.name?.charAt(0)?.toUpperCase() || 'O'}
            </div>
            <div className="owner-sidebar-header-text">
              <h2>Owner Panel</h2>
              <p>{user?.name || 'Owner'}</p>
            </div>
          </div>
          <button className="owner-sidebar-dots" onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="owner-sidebar-nav">
          {navSections.map((section, idx) => (
            <React.Fragment key={idx}>
              <div className="owner-sidebar-section-label">{section.label}</div>
              {section.links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`owner-sidebar-link ${currentPath === link.to ? 'active' : ''}`}
                  data-tooltip={link.label}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="owner-link-icon">{link.icon}</span>
                  <span className="owner-link-text">{link.label}</span>
                </Link>
              ))}
              {idx < navSections.length - 1 && <div className="owner-sidebar-divider" />}
            </React.Fragment>
          ))}
        </nav>

        <div className="owner-sidebar-divider" />

        {/* Footer */}
        <div className="owner-sidebar-footer">
          <button onClick={onLogout} className="owner-logout-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile floating toggle */}
      <button className="owner-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? '✕' : '☰'}
      </button>
    </>
  );
};

export default Dashboard;
