import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../user/Dashboard.css';

const AdminDashboard = () => {
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

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>

        <div className="grid grid-3">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Vehicles</h3>
            <p className="stat-number">{stats.totalVehicles}</p>
          </div>
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p className="stat-number">{stats.totalBookings}</p>
          </div>
          <div className="stat-card">
            <h3>Active Bookings</h3>
            <p className="stat-number">{stats.activeBookings}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Verifications</h3>
            <p className="stat-number">{stats.pendingVerifications}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-number">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="card">
          <h2>Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <p>No recent bookings</p>
          ) : (
            <table className="bookings-table">
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
                    <td><span className={`status ${booking.status}`}>{booking.status}</span></td>
                    <td>₹{booking.pricing.totalAmount}</td>
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
