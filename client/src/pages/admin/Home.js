import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './AdminPanel.css';

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalBookings: 0,
    activeBookings: 0,
    pendingVerifications: 0,
    totalRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('adminSidebarCollapsed') === 'true';
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, usersRes] = await Promise.all([
        axios.get('/api/admin/dashboard'),
        axios.get('/api/admin/users')
      ]);
      setStats(dashRes.data.data.stats);
      setRecentBookings(dashRes.data.data.recentBookings);
      setRecentUsers(usersRes.data.data.slice(0, 5));
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching dashboard data');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    // Navigation handled by AuthContext.logout
  };

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('adminSidebarCollapsed', String(next));
  };

  if (loading) {
    return (
      <div className={`admin-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AdminSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="admin-content">
          <div className="admin-loading">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="admin-content">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Overview of platform activity and statistics</p>

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

        {/* Recent Bookings */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>📋 Recent Bookings</h3>
            <Link to="/admin/bookings" className="admin-btn-outline">View All</Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">📋</div>
              <h3>No bookings yet</h3>
              <p>Bookings will appear here once users start booking vehicles</p>
            </div>
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
                    <td><strong>{booking.bookingId}</strong></td>
                    <td>{booking.user?.name || 'N/A'}</td>
                    <td>{booking.vehicle?.name || 'N/A'}</td>
                    <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`admin-status-badge ${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>₹{booking.pricing?.totalAmount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Users */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>👥 Recent Users</h3>
            <Link to="/admin/users" className="admin-btn-outline">View All</Link>
          </div>
          {recentUsers.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">👥</div>
              <h3>No users yet</h3>
              <p>Users will appear here once they register</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                    <td>
                      <span className={`admin-status-badge ${u.isVerified ? 'verified' : 'pending'}`}>
                        {u.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
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

// ===== Shared Admin Sidebar Component =====
export const AdminSidebar = ({ user, currentPath, onLogout, collapsed, onToggle }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navSections = [
    {
      label: 'Overview',
      links: [
        { to: '/admin/home', icon: '🏠', label: 'Home' },
        { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
      ]
    },
    {
      label: 'Management',
      links: [
        { to: '/admin/users', icon: '👥', label: 'Manage Users' },
        { to: '/admin/vehicles', icon: '🚗', label: 'Manage Vehicles' },
        { to: '/admin/bookings', icon: '📋', label: 'Manage Bookings' },
        { to: '/admin/document-verification', icon: '📄', label: 'Doc Verification' },
        { to: '/admin/owner-reports', icon: '📢', label: 'Manage Reports' },
      ]
    },
    {
      label: 'Account',
      links: [
        { to: '/admin/profile', icon: '👤', label: 'Profile' },
        { to: '/admin/reports', icon: '📈', label: 'Reports' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`admin-sidebar-overlay ${mobileOpen ? 'show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header with three-dot toggle */}
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <div className="admin-sidebar-avatar">
              {collapsed ? '⚙' : user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="admin-sidebar-header-text">
              <h2>Admin Panel</h2>
              <p>{user?.name || 'Administrator'}</p>
            </div>
          </div>
          <button className="admin-sidebar-dots" onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          {navSections.map((section, idx) => (
            <React.Fragment key={idx}>
              <div className="admin-sidebar-section-label">{section.label}</div>
              {section.links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`admin-sidebar-link ${currentPath === link.to ? 'active' : ''}`}
                  data-tooltip={link.label}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="admin-link-icon">{link.icon}</span>
                  <span className="admin-link-text">{link.label}</span>
                </Link>
              ))}
              {idx < navSections.length - 1 && <div className="admin-sidebar-divider" />}
            </React.Fragment>
          ))}
        </nav>

        <div className="admin-sidebar-divider" />

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <button onClick={onLogout} className="admin-logout-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile floating toggle */}
      <button className="admin-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? '✕' : '☰'}
      </button>
    </>
  );
};

export default Home;
