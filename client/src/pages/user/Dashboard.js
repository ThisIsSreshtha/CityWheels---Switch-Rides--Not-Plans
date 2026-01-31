import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

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

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Welcome, {user?.name}!</h1>
        
        {!user?.isVerified && (
          <div className="alert alert-warning">
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

export default UserDashboard;
