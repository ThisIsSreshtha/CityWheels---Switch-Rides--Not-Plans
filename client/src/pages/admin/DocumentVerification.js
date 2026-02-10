import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { AdminSidebar } from './Home';
import './AdminPanel.css';

const AdminDocumentVerification = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, verified
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('adminSidebarCollapsed') === 'true');
  const toggleSidebar = () => setSidebarCollapsed(prev => { const next = !prev; localStorage.setItem('adminSidebarCollapsed', next); return next; });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching users');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    // Navigation handled by AuthContext.logout
  };

  const handleVerify = async (userId, verifyAadhar, verifyLicense) => {
    try {
      await axios.put(`/api/admin/users/${userId}/verify`, {
        verifyAadhar,
        verifyLicense
      });
      toast.success('Verification updated successfully');
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      toast.error('Error updating verification');
    }
  };

  const getVerificationStatus = (u) => {
    const aadhar = u.documents?.aadharCard;
    const license = u.documents?.drivingLicense;

    if (aadhar?.verified && license?.verified) return 'verified';
    if (aadhar?.number || license?.number) return 'pending';
    return 'none';
  };

  const filteredUsers = users.filter(u => {
    if (u.role === 'admin') return false;
    const status = getVerificationStatus(u);
    if (filter === 'pending') return status === 'pending';
    if (filter === 'verified') return status === 'verified';
    return true;
  });

  const pendingCount = users.filter(u => u.role !== 'admin' && getVerificationStatus(u) === 'pending').length;
  const verifiedCount = users.filter(u => u.role !== 'admin' && getVerificationStatus(u) === 'verified').length;
  const totalNonAdmin = users.filter(u => u.role !== 'admin').length;

  if (loading) {
    return (
      <div className={`admin-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AdminSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="admin-content">
          <div className="admin-loading">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="admin-content">
        <h1 className="admin-page-title">Document Verification</h1>
        <p className="admin-page-subtitle">Review and verify user identity documents</p>

        {/* Stats Summary */}
        <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
          <div className="admin-stat-card">
            <div className="admin-stat-icon blue">👥</div>
            <div className="admin-stat-info">
              <h3>{totalNonAdmin}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon amber">⏳</div>
            <div className="admin-stat-info">
              <h3>{pendingCount}</h3>
              <p>Pending Review</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon green">✅</div>
            <div className="admin-stat-info">
              <h3>{verifiedCount}</h3>
              <p>Verified</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="admin-filter-tabs">
          <button
            className={`admin-filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({totalNonAdmin})
          </button>
          <button
            className={`admin-filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            ⏳ Pending ({pendingCount})
          </button>
          <button
            className={`admin-filter-tab ${filter === 'verified' ? 'active' : ''}`}
            onClick={() => setFilter('verified')}
          >
            ✅ Verified ({verifiedCount})
          </button>
        </div>

        {/* Users List */}
        <div className="admin-card">
          {filteredUsers.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">📄</div>
              <h3>No users found</h3>
              <p>No users match the current filter</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Aadhar</th>
                  <th>License</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const aadhar = u.documents?.aadharCard;
                  const license = u.documents?.drivingLicense;
                  return (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                      <td>
                        {aadhar?.verified ? (
                          <span className="admin-status-badge verified">✅ Verified</span>
                        ) : aadhar?.number ? (
                          <span className="admin-status-badge pending">⏳ Uploaded</span>
                        ) : (
                          <span className="admin-status-badge none">— None</span>
                        )}
                      </td>
                      <td>
                        {license?.verified ? (
                          <span className="admin-status-badge verified">✅ Verified</span>
                        ) : license?.number ? (
                          <span className="admin-status-badge pending">⏳ Uploaded</span>
                        ) : (
                          <span className="admin-status-badge none">— None</span>
                        )}
                      </td>
                      <td>
                        <span className={`admin-status-badge ${u.isVerified ? 'verified' : 'pending'}`}>
                          {u.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="admin-btn-outline small"
                          onClick={() => setSelectedUser(selectedUser?._id === u._id ? null : u)}
                        >
                          {selectedUser?._id === u._id ? 'Close' : '🔍 Review'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected User Document Details */}
        {selectedUser && (
          <div className="admin-doc-review">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>📋 Document Review — {selectedUser.name}</h3>
                <button className="admin-btn-outline small" onClick={() => setSelectedUser(null)}>✕ Close</button>
              </div>

              <div className="admin-doc-grid">
                {/* Aadhar Card */}
                <div className="admin-doc-item">
                  <div className="admin-doc-item-header">
                    <h4>🪪 Aadhar Card</h4>
                    <span className={`admin-doc-status ${selectedUser.documents?.aadharCard?.verified ? 'verified' : selectedUser.documents?.aadharCard?.number ? 'pending' : 'none'}`}>
                      {selectedUser.documents?.aadharCard?.verified
                        ? '✅ Verified'
                        : selectedUser.documents?.aadharCard?.number
                          ? '⏳ Pending'
                          : '— Not Uploaded'}
                    </span>
                  </div>
                  {selectedUser.documents?.aadharCard?.number ? (
                    <div className="admin-doc-details">
                      <p><strong>Number:</strong> {selectedUser.documents.aadharCard.number}</p>
                      {selectedUser.documents.aadharCard.fileUrl && (
                        <p><strong>File:</strong> <a href={selectedUser.documents.aadharCard.fileUrl} target="_blank" rel="noreferrer">View Document</a></p>
                      )}
                      {!selectedUser.documents.aadharCard.verified && (
                        <button
                          className="admin-btn-success"
                          onClick={() => handleVerify(selectedUser._id, true, false)}
                        >
                          ✅ Verify Aadhar
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="admin-doc-empty">No Aadhar card uploaded yet</p>
                  )}
                </div>

                {/* Driving License */}
                <div className="admin-doc-item">
                  <div className="admin-doc-item-header">
                    <h4>🚗 Driving License</h4>
                    <span className={`admin-doc-status ${selectedUser.documents?.drivingLicense?.verified ? 'verified' : selectedUser.documents?.drivingLicense?.number ? 'pending' : 'none'}`}>
                      {selectedUser.documents?.drivingLicense?.verified
                        ? '✅ Verified'
                        : selectedUser.documents?.drivingLicense?.number
                          ? '⏳ Pending'
                          : '— Not Uploaded'}
                    </span>
                  </div>
                  {selectedUser.documents?.drivingLicense?.number ? (
                    <div className="admin-doc-details">
                      <p><strong>Number:</strong> {selectedUser.documents.drivingLicense.number}</p>
                      {selectedUser.documents.drivingLicense.expiryDate && (
                        <p><strong>Expiry:</strong> {new Date(selectedUser.documents.drivingLicense.expiryDate).toLocaleDateString()}</p>
                      )}
                      {selectedUser.documents.drivingLicense.fileUrl && (
                        <p><strong>File:</strong> <a href={selectedUser.documents.drivingLicense.fileUrl} target="_blank" rel="noreferrer">View Document</a></p>
                      )}
                      {!selectedUser.documents.drivingLicense.verified && (
                        <button
                          className="admin-btn-success"
                          onClick={() => handleVerify(selectedUser._id, false, true)}
                        >
                          ✅ Verify License
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="admin-doc-empty">No driving license uploaded yet</p>
                  )}
                </div>
              </div>

              {/* Verify All */}
              {(selectedUser.documents?.aadharCard?.number && !selectedUser.documents?.aadharCard?.verified) &&
                (selectedUser.documents?.drivingLicense?.number && !selectedUser.documents?.drivingLicense?.verified) && (
                  <div className="admin-verify-all">
                    <button
                      className="admin-btn-primary"
                      onClick={() => handleVerify(selectedUser._id, true, true)}
                    >
                      ✅ Verify All Documents
                    </button>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentVerification;
