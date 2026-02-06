import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Sidebar } from './Dashboard';
import './OwnerPanel.css';

const MyRentals = () => {
  const { user, logout } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: 'scooter', category: 'non-electric', brand: '', model: '',
    registrationNumber: '', seatingCapacity: '', fuelType: '', mileage: '',
    year: '', hourly: '', daily: '', weekly: '', securityDeposit: '',
    city: '', state: '', area: '', pickupAddress: '', longitude: '', latitude: ''
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get('/api/owner/vehicles');
      setVehicles(res.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching vehicles');
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      name: '', type: 'scooter', category: 'non-electric', brand: '', model: '',
      registrationNumber: '', seatingCapacity: '', fuelType: '', mileage: '',
      year: '', hourly: '', daily: '', weekly: '', securityDeposit: '',
      city: '', state: '', area: '', pickupAddress: '', longitude: '', latitude: ''
    });
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name || '',
      type: vehicle.type || 'scooter',
      category: vehicle.category || 'non-electric',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      registrationNumber: vehicle.registrationNumber || '',
      seatingCapacity: vehicle.specifications?.seatingCapacity || '',
      fuelType: vehicle.specifications?.fuelType || '',
      mileage: vehicle.specifications?.mileage || '',
      year: vehicle.specifications?.year || '',
      hourly: vehicle.pricing?.hourly || '',
      daily: vehicle.pricing?.daily || '',
      weekly: vehicle.pricing?.weekly || '',
      securityDeposit: vehicle.pricing?.securityDeposit || '',
      city: vehicle.location?.city || '',
      state: vehicle.location?.state || '',
      area: vehicle.location?.area || '',
      pickupAddress: vehicle.location?.pickupPoint?.address || '',
      longitude: vehicle.location?.pickupPoint?.coordinates?.[0] || '',
      latitude: vehicle.location?.pickupPoint?.coordinates?.[1] || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vehicleData = {
      name: formData.name,
      type: formData.type,
      category: formData.category,
      brand: formData.brand,
      model: formData.model,
      registrationNumber: formData.registrationNumber,
      specifications: {
        seatingCapacity: Number(formData.seatingCapacity),
        fuelType: formData.fuelType,
        mileage: formData.mileage,
        year: Number(formData.year)
      },
      pricing: {
        hourly: Number(formData.hourly),
        daily: Number(formData.daily),
        weekly: Number(formData.weekly),
        securityDeposit: Number(formData.securityDeposit)
      },
      location: {
        city: formData.city,
        state: formData.state,
        area: formData.area,
        pickupPoint: {
          type: 'Point',
          coordinates: [Number(formData.longitude), Number(formData.latitude)],
          address: formData.pickupAddress
        }
      }
    };

    try {
      if (editingVehicle) {
        await axios.put(`/api/owner/vehicles/${editingVehicle._id}`, vehicleData);
        toast.success('Vehicle updated successfully');
      } else {
        await axios.post('/api/owner/vehicles', vehicleData);
        toast.success('Vehicle added successfully');
      }
      setShowModal(false);
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving vehicle');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await axios.delete(`/api/owner/vehicles/${id}`);
      toast.success('Vehicle removed');
      fetchVehicles();
    } catch (error) {
      toast.error('Error removing vehicle');
    }
  };

  const toggleAvailability = async (vehicle) => {
    const newStatus = vehicle.availability === 'available' ? 'inactive' : 'available';
    try {
      await axios.put(`/api/owner/vehicles/${vehicle._id}`, { availability: newStatus });
      toast.success(`Vehicle marked as ${newStatus}`);
      fetchVehicles();
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  return (
    <div className="owner-panel">
      <Sidebar user={user} currentPath={location.pathname} onLogout={handleLogout} />
      <div className="owner-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 className="page-title">My Rentals</h1>
            <p className="page-subtitle">Manage your vehicles listed for rent</p>
          </div>
          <button onClick={openAddModal} className="btn-primary-owner">+ Add Vehicle</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : vehicles.length === 0 ? (
          <div className="owner-card">
            <div className="empty-state">
              <div className="empty-icon">🚘</div>
              <h3>No vehicles listed</h3>
              <p>Start by adding your first vehicle to earn rental income</p>
              <button onClick={openAddModal} className="btn-primary-owner">+ Add Your First Vehicle</button>
            </div>
          </div>
        ) : (
          <div className="owner-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="owner-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Reg. No.</th>
                  <th>Type</th>
                  <th>City</th>
                  <th>Daily Rate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v._id}>
                    <td>
                      <strong>{v.name}</strong>
                      <br />
                      <small style={{ color: '#94a3b8' }}>{v.brand} {v.model}</small>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{v.registrationNumber}</td>
                    <td style={{ textTransform: 'capitalize' }}>{v.type}</td>
                    <td>{v.location?.city}</td>
                    <td><strong>₹{v.pricing?.daily}</strong></td>
                    <td>
                      <span className={`status-badge ${v.availability}`}>{v.availability}</span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button onClick={() => openEditModal(v)} className="btn-outline">Edit</button>
                        <button onClick={() => toggleAvailability(v)} className="btn-outline success">
                          {v.availability === 'available' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(v._id)} className="btn-outline danger">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Vehicle Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form className="owner-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Vehicle Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Honda Activa" required />
                  </div>
                  <div className="form-group">
                    <label>Registration Number</label>
                    <input name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="e.g. WB01AB1234" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                      <option value="scooter">Scooter</option>
                      <option value="scooty">Scooty</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="bicycle">Bicycle</option>
                      <option value="car">Car</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
                      <option value="non-electric">Non-Electric</option>
                      <option value="electric">Electric</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Brand</label>
                    <input name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. Honda" required />
                  </div>
                  <div className="form-group">
                    <label>Model</label>
                    <input name="model" value={formData.model} onChange={handleChange} placeholder="e.g. Activa 6G" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fuel Type</label>
                    <input name="fuelType" value={formData.fuelType} onChange={handleChange} placeholder="petrol / electric / manual" />
                  </div>
                  <div className="form-group">
                    <label>Seating Capacity</label>
                    <input name="seatingCapacity" type="number" value={formData.seatingCapacity} onChange={handleChange} placeholder="e.g. 2" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mileage</label>
                    <input name="mileage" value={formData.mileage} onChange={handleChange} placeholder="e.g. 50 km/l" />
                  </div>
                  <div className="form-group">
                    <label>Year</label>
                    <input name="year" type="number" value={formData.year} onChange={handleChange} placeholder="e.g. 2023" />
                  </div>
                </div>

                <h4 style={{ margin: '16px 0 8px', color: '#334155', fontSize: 14 }}>💰 Pricing (₹)</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Hourly</label>
                    <input name="hourly" type="number" value={formData.hourly} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Daily</label>
                    <input name="daily" type="number" value={formData.daily} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Weekly</label>
                    <input name="weekly" type="number" value={formData.weekly} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Security Deposit</label>
                    <input name="securityDeposit" type="number" value={formData.securityDeposit} onChange={handleChange} required />
                  </div>
                </div>

                <h4 style={{ margin: '16px 0 8px', color: '#334155', fontSize: 14 }}>📍 Location</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Kolkata" required />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input name="state" value={formData.state} onChange={handleChange} placeholder="e.g. West Bengal" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Area</label>
                    <input name="area" value={formData.area} onChange={handleChange} placeholder="e.g. Salt Lake" />
                  </div>
                  <div className="form-group">
                    <label>Pickup Address</label>
                    <input name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} placeholder="Pickup location" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Longitude</label>
                    <input name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} placeholder="e.g. 88.3639" required />
                  </div>
                  <div className="form-group">
                    <label>Latitude</label>
                    <input name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} placeholder="e.g. 22.5726" required />
                  </div>
                </div>

                <button type="submit" className="btn-primary-owner" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                  {editingVehicle ? '💾 Update Vehicle' : '+ Add Vehicle'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRentals;
