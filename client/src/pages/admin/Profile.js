import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { AdminSidebar } from './Home';
import './AdminPanel.css';

const AdminProfile = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [editing, setEditing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('adminSidebarCollapsed') === 'true');
  const toggleSidebar = () => setSidebarCollapsed(prev => { const next = !prev; localStorage.setItem('adminSidebarCollapsed', next); return next; });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || ''
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    // Navigation handled by AuthContext.logout
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/users/profile', {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
      });
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  return (
    <div className={`admin-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="admin-content">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">My Profile</h1>
            <p className="admin-page-subtitle">Manage your personal information</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="admin-btn-primary">✏️ Edit Profile</button>
          )}
        </div>

        {!editing ? (
          <>
            {/* View Mode */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>👤 Personal Details</h3>
              </div>
              <div className="admin-profile-info-grid">
                <div className="admin-profile-info-item">
                  <label>Full Name</label>
                  <span>{user?.name || '—'}</span>
                </div>
                <div className="admin-profile-info-item">
                  <label>Email</label>
                  <span>{user?.email || '—'}</span>
                </div>
                <div className="admin-profile-info-item">
                  <label>Phone</label>
                  <span>{user?.phone || '—'}</span>
                </div>
                <div className="admin-profile-info-item">
                  <label>Role</label>
                  <span style={{ textTransform: 'capitalize' }}>{user?.role || '—'}</span>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h3>📍 Address</h3>
              </div>
              <div className="admin-profile-info-grid">
                <div className="admin-profile-info-item">
                  <label>Street</label>
                  <span>{user?.address?.street || '—'}</span>
                </div>
                <div className="admin-profile-info-item">
                  <label>City</label>
                  <span>{user?.address?.city || '—'}</span>
                </div>
                <div className="admin-profile-info-item">
                  <label>State</label>
                  <span>{user?.address?.state || '—'}</span>
                </div>
                <div className="admin-profile-info-item">
                  <label>Pincode</label>
                  <span>{user?.address?.pincode || '—'}</span>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h3>🛡️ Account Information</h3>
              </div>
              <div className="admin-profile-info-grid">
                <div className="admin-profile-info-item">
                  <label>Account Status</label>
                  <span className="admin-badge-active">Active</span>
                </div>
                <div className="admin-profile-info-item">
                  <label>Account Type</label>
                  <span>Administrator</span>
                </div>
                <div className="admin-profile-info-item">
                  <label>Joined</label>
                  <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
                </div>
                <div className="admin-profile-info-item">
                  <label>Verified</label>
                  <span>{user?.isVerified ? '✅ Yes' : '❌ No'}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Edit Mode */
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>👤 Personal Details</h3>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Full Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
                </div>
                <div className="admin-form-group">
                  <label>Phone Number</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" required />
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h3>📍 Address</h3>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Street</label>
                  <input name="street" value={formData.street} onChange={handleChange} placeholder="Street address" />
                </div>
                <div className="admin-form-group">
                  <label>City</label>
                  <input name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>State</label>
                  <input name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                </div>
                <div className="admin-form-group">
                  <label>Pincode</label>
                  <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" />
                </div>
              </div>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-btn-primary">💾 Save Changes</button>
              <button type="button" onClick={() => setEditing(false)} className="admin-btn-outline">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
