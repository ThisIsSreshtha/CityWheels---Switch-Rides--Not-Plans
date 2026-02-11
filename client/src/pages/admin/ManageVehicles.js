import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { AdminSidebar } from './Home';
import { toast } from 'react-toastify';
import './AdminPanel.css';

const ManageVehicles = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('adminSidebarCollapsed') === 'true');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const toggleSidebar = () => setSidebarCollapsed(prev => { const next = !prev; localStorage.setItem('adminSidebarCollapsed', next); return next; });
  const handleLogout = () => { logout(); };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/vehicles?availability=all');
      setVehicles(res.data.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Error loading vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    try {
      await axios.delete(`/api/vehicles/${vehicleId}`);
      toast.success('Vehicle deleted successfully');
      fetchVehicles();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Error deleting vehicle');
      console.error(error);
    }
  };

  const handleToggleAvailability = async (vehicleId, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'inactive' : 'available';
    try {
      await axios.put(`/api/vehicles/${vehicleId}`, { availability: newStatus });
      toast.success(`Vehicle ${newStatus === 'available' ? 'activated' : 'deactivated'}`);
      fetchVehicles();
    } catch (error) {
      toast.error('Error updating vehicle status');
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      available: { label: 'Available', class: 'status-available' },
      rented: { label: 'Rented', class: 'status-rented' },
      maintenance: { label: 'Maintenance', class: 'status-maintenance' },
      inactive: { label: 'Inactive', class: 'status-inactive' }
    };
    const statusData = statusMap[status] || statusMap.inactive;
    return <span className={`admin-badge ${statusData.class}`}>{statusData.label}</span>;
  };

  if (loading) {
    return (
      <div className={`admin-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AdminSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="admin-content">
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <h1 className="admin-page-title">🚗 Manage Vehicles</h1>
            <p className="admin-page-subtitle">Add, edit, delete, and manage vehicle availability</p>
          </div>
          <button className="admin-btn-primary" onClick={() => navigate('/admin/vehicles/add')}>
            ➕ Add Vehicle
          </button>
        </div>

        <div className="admin-card">
          {vehicles.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">🚗</div>
              <h3>No Vehicles Found</h3>
              <p>No vehicles have been added yet. Click "Add Vehicle" to get started.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Vehicle Details</th>
                    <th>Type & Category</th>
                    <th>Registration</th>
                    <th>Location</th>
                    <th>Pricing</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle._id}>
                      <td>
                        <div className="vehicle-image-cell">
                          {vehicle.images && vehicle.images[0] ? (
                            <img src={vehicle.images[0]} alt={vehicle.name} className="vehicle-thumbnail" />
                          ) : (
                            <div className="vehicle-thumbnail-placeholder">🚗</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="vehicle-details">
                          <strong>{vehicle.name}</strong>
                          <small>{vehicle.brand} {vehicle.model}</small>
                        </div>
                      </td>
                      <td>
                        <div className="vehicle-type">
                          <span className="type-badge">{vehicle.type}</span>
                          <span className="category-badge">{vehicle.category}</span>
                        </div>
                      </td>
                      <td>
                        <code className="reg-number">{vehicle.registrationNumber}</code>
                      </td>
                      <td>
                        <div className="location-cell">
                          {vehicle.location?.city}, {vehicle.location?.state}
                        </div>
                      </td>
                      <td>
                        <div className="pricing-cell">
                          <strong>₹{vehicle.pricing?.daily}</strong>/day
                        </div>
                      </td>
                      <td>{getStatusBadge(vehicle.availability)}</td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="admin-btn-icon"
                            onClick={() => navigate(`/admin/vehicles/edit/${vehicle._id}`)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className={`admin-btn-icon ${vehicle.availability === 'available' ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleAvailability(vehicle._id, vehicle.availability)}
                            title={vehicle.availability === 'available' ? 'Deactivate' : 'Activate'}
                          >
                            {vehicle.availability === 'available' ? '⏸️' : '▶️'}
                          </button>
                          <button
                            className="admin-btn-icon btn-danger"
                            onClick={() => setDeleteConfirm(vehicle._id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <h3>⚠️ Confirm Delete</h3>
              <p>Are you sure you want to delete this vehicle? This action cannot be undone.</p>
              <div className="admin-modal-actions">
                <button className="admin-btn-secondary" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button className="admin-btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="admin-stats-footer">
          <p>Total Vehicles: <strong>{vehicles.length}</strong></p>
          <p>Available: <strong>{vehicles.filter(v => v.availability === 'available').length}</strong></p>
          <p>Rented: <strong>{vehicles.filter(v => v.availability === 'rented').length}</strong></p>
        </div>
      </div>
    </div>
  );
};

export default ManageVehicles;
