import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { RiderSidebar } from './Dashboard';
import { toast } from 'react-toastify';
import './RiderPanel.css';
import './MyBookings.css';

const MyBookings = () => {
  const { user, logout } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('riderSidebarCollapsed') === 'true';
  });
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); /* Navigation handled by AuthContext.logout */ };
  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('riderSidebarCollapsed', String(next));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/bookings/my-bookings');
      setBookings(res.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    if (filter === 'all') return bookings;
    return bookings.filter(booking => booking.status === filter);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { emoji: '⏳', class: 'pending', text: 'Pending' },
      active: { emoji: '✅', class: 'active', text: 'Active' },
      completed: { emoji: '🎉', class: 'completed', text: 'Completed' },
      cancelled: { emoji: '❌', class: 'cancelled', text: 'Cancelled' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`status-badge ${badge.class}`}>
        {badge.emoji} {badge.text}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredBookings = getFilteredBookings();

  return (
    <div className={`rider-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <RiderSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="rider-content">
        <div className="my-bookings-page" style={{ padding: 0, minHeight: 'auto' }}>
          <div className="bookings-container">
            <div className="bookings-header">
              <h1>📋 My Bookings</h1>
              <p>Track and manage all your vehicle bookings</p>
            </div>

            <div className="filter-section">
              <button
                className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('all')}
              >
                All Bookings
              </button>
              <button
                className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('pending')}
              >
                ⏳ Pending
              </button>
              <button
                className={filter === 'active' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('active')}
              >
                ✅ Active
              </button>
              <button
                className={filter === 'completed' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('completed')}
              >
                🎉 Completed
              </button>
              <button
                className={filter === 'cancelled' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('cancelled')}
              >
                ❌ Cancelled
              </button>
            </div>

            {loading ? (
              <div className="loading-spinner">🔄 Loading bookings...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="no-bookings">
                <div className="no-bookings-icon">🚗</div>
                <h3>No bookings found</h3>
                <p>Start your journey by booking a vehicle!</p>
              </div>
            ) : (
              <div className="bookings-grid">
                {filteredBookings.map(booking => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <div className="vehicle-info">
                        <h3>{booking.vehicle?.name || 'Vehicle'}</h3>
                        <p className="vehicle-type">{booking.vehicle?.type || 'N/A'}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="booking-details">
                      <div className="detail-row">
                        <span className="label">📅 Start Date:</span>
                        <span className="value">{formatDate(booking.startDate)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">📅 End Date:</span>
                        <span className="value">{formatDate(booking.endDate)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">📍 Pickup:</span>
                        <span className="value">{booking.pickupLocation || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">📍 Drop-off:</span>
                        <span className="value">{booking.dropoffLocation || 'N/A'}</span>
                      </div>
                      <div className="detail-row total">
                        <span className="label">💰 Total Amount:</span>
                        <span className="value">₹{booking.totalAmount || 0}</span>
                      </div>
                    </div>

                    {booking.status === 'pending' && (
                      <div className="booking-actions">
                        <button className="btn-cancel">Cancel Booking</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
