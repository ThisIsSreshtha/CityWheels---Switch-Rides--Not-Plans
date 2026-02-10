import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './RiderPanel.css';
import './Dashboard.css';

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('riderSidebarCollapsed') === 'true';
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/bookings/my-bookings');
      const bookings = res.data.data;

      setStats({
        totalBookings: bookings.length,
        activeBookings: bookings.filter(b => b.status === 'active').length,
        completedBookings: bookings.filter(b => b.status === 'completed').length
      });

      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      toast.error('Error fetching dashboard data');
    }
  };

  const handleLogout = () => {
    logout();
    // Navigation handled by AuthContext.logout
  };

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('riderSidebarCollapsed', String(next));
  };

  return (
    <div className={`rider-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <RiderSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="rider-content">
        <h1 className="rider-page-title">Welcome, {user?.name}!</h1>
        <p className="rider-page-subtitle">Your ride dashboard overview</p>

        {!user?.isVerified && (
          <div className="alert alert-warning" style={{ marginBottom: '24px', padding: '14px 20px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <strong>Action Required:</strong> Please complete your profile verification by uploading your documents.
            <Link to="/user/profile" className="btn btn-primary" style={{ marginLeft: '15px' }}>
              Complete Profile
            </Link>
          </div>
        )}

        <div className="grid grid-3">
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p className="stat-number">{stats.totalBookings}</p>
          </div>
          <div className="stat-card">
            <h3>Active Bookings</h3>
            <p className="stat-number">{stats.activeBookings}</p>
          </div>
          <div className="stat-card">
            <h3>Completed Bookings</h3>
            <p className="stat-number">{stats.completedBookings}</p>
          </div>
        </div>

        <div className="card">
          <h2>Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <p>No bookings yet. <Link to="/vehicles">Browse vehicles</Link> to make your first booking!</p>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
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
                    <td>{booking.vehicle?.name || 'N/A'}</td>
                    <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                    <td><span className={`status ${booking.status}`}>{booking.status}</span></td>
                    <td>₹{booking.pricing.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="quick-actions">
          <Link to="/vehicles" className="btn btn-primary">Browse Vehicles</Link>
          <Link to="/user/bookings" className="btn btn-secondary">View All Bookings</Link>
          <Link to="/user/profile" className="btn btn-secondary">Edit Profile</Link>
        </div>
      </div>
    </div>
  );
};

// ===== Shared Rider Sidebar Component =====
export const RiderSidebar = ({ user, currentPath, onLogout, collapsed, onToggle }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navSections = [
    {
      label: 'Overview',
      links: [
        { to: '/user/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/user/bookings', icon: '📋', label: 'My Bookings' },
      ]
    },
    {
      label: 'Account',
      links: [
        { to: '/user/profile', icon: '👤', label: 'Profile' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`rider-sidebar-overlay ${mobileOpen ? 'show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`rider-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header with three-dot toggle */}
        <div className="rider-sidebar-header">
          <div className="rider-sidebar-brand">
            <div className="rider-sidebar-avatar">
              {collapsed ? '🏍️' : user?.name?.charAt(0)?.toUpperCase() || 'R'}
            </div>
            <div className="rider-sidebar-header-text">
              <h2>Rider Panel</h2>
              <p>{user?.name || 'Rider'}</p>
            </div>
          </div>
          <button className="rider-sidebar-dots" onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="rider-sidebar-nav">
          {navSections.map((section, idx) => (
            <React.Fragment key={idx}>
              <div className="rider-sidebar-section-label">{section.label}</div>
              {section.links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rider-sidebar-link ${currentPath === link.to ? 'active' : ''}`}
                  data-tooltip={link.label}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="rider-link-icon">{link.icon}</span>
                  <span className="rider-link-text">{link.label}</span>
                </Link>
              ))}
              {idx < navSections.length - 1 && <div className="rider-sidebar-divider" />}
            </React.Fragment>
          ))}
        </nav>

        <div className="rider-sidebar-divider" />

        {/* Footer */}
        <div className="rider-sidebar-footer">
          <button onClick={onLogout} className="rider-logout-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile floating toggle */}
      <button className="rider-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? '✕' : '☰'}
      </button>
    </>
  );
};

export default UserDashboard;
