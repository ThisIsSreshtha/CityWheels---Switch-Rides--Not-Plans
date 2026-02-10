import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Sidebar } from './Dashboard';
import './OwnerPanel.css';

const OwnerProfile = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('ownerSidebarCollapsed') === 'true';
  });
  const [formData, setFormData] = useState({
    name: '', phone: '', businessName: '', businessAddress: '',
    street: '', city: '', state: '', pincode: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        businessName: user.businessName || '',
        businessAddress: user.businessAddress || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || ''
      });
    }
  }, [user]);

  const handleLogout = () => { logout(); /* Navigation handled by AuthContext.logout */ };

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('ownerSidebarCollapsed', String(next));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/owner/profile', {
        name: formData.name,
        phone: formData.phone,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
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
    <div className={`owner-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="owner-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Manage your personal and business information</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-primary-owner">✏️ Edit Profile</button>
          )}
        </div>

        {!editing ? (
          <>
            {/* View Mode */}
            <div className="owner-card">
              <div className="owner-card-header">
                <h3>👤 Personal Details</h3>
              </div>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <label>Full Name</label>
                  <span>{user?.name || '—'}</span>
                </div>
                <div className="profile-info-item">
                  <label>Email</label>
                  <span>{user?.email || '—'}</span>
                </div>
                <div className="profile-info-item">
                  <label>Phone</label>
                  <span>{user?.phone || '—'}</span>
                </div>
                <div className="profile-info-item">
                  <label>Role</label>
                  <span style={{ textTransform: 'capitalize' }}>{user?.role || '—'}</span>
                </div>
              </div>
            </div>

            <div className="owner-card">
              <div className="owner-card-header">
                <h3>🏢 Business Details</h3>
              </div>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <label>Business Name</label>
                  <span>{user?.businessName || '—'}</span>
                </div>
                <div className="profile-info-item">
                  <label>Business Address</label>
                  <span>{user?.businessAddress || '—'}</span>
                </div>
              </div>
            </div>

            <div className="owner-card">
              <div className="owner-card-header">
                <h3>📍 Address</h3>
              </div>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <label>Street</label>
                  <span>{user?.address?.street || '—'}</span>
                </div>
                <div className="profile-info-item">
                  <label>City</label>
                  <span>{user?.address?.city || '—'}</span>
                </div>
                <div className="profile-info-item">
                  <label>State</label>
                  <span>{user?.address?.state || '—'}</span>
                </div>
                <div className="profile-info-item">
                  <label>Pincode</label>
                  <span>{user?.address?.pincode || '—'}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Edit Mode */
          <form className="owner-form" onSubmit={handleSubmit}>
            <div className="owner-card">
              <div className="owner-card-header">
                <h3>👤 Personal Details</h3>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="owner-card">
              <div className="owner-card-header">
                <h3>🏢 Business Details</h3>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Business Name</label>
                  <input name="businessName" value={formData.businessName} onChange={handleChange} placeholder="Your business name" />
                </div>
                <div className="form-group">
                  <label>Business Address</label>
                  <input name="businessAddress" value={formData.businessAddress} onChange={handleChange} placeholder="Business address" />
                </div>
              </div>
            </div>

            <div className="owner-card">
              <div className="owner-card-header">
                <h3>📍 Address</h3>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Street</label>
                  <input name="street" value={formData.street} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input name="city" value={formData.city} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>State</label>
                  <input name="state" value={formData.state} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input name="pincode" value={formData.pincode} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-primary-owner">💾 Save Changes</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OwnerProfile;
