import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [documents, setDocuments] = useState({
    aadharNumber: '',
    aadharFile: null,
    licenseNumber: '',
    licenseFile: null,
    expiryDate: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleDocumentChange = (e) => {
    if (e.target.files) {
      setDocuments({
        ...documents,
        [e.target.name]: e.target.files[0]
      });
    } else {
      setDocuments({
        ...documents,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/users/profile', {
        name: profileData.name,
        phone: profileData.phone,
        address: {
          street: profileData.street,
          city: profileData.city,
          state: profileData.state,
          pincode: profileData.pincode
        }
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  const handleAadharSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('aadharNumber', documents.aadharNumber);
    formData.append('aadhar', documents.aadharFile);

    try {
      await axios.post('/api/users/documents/aadhar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Aadhar card uploaded successfully. Pending verification.');
    } catch (error) {
      toast.error('Error uploading Aadhar card');
    }
  };

  const handleLicenseSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('licenseNumber', documents.licenseNumber);
    formData.append('expiryDate', documents.expiryDate);
    formData.append('license', documents.licenseFile);

    try {
      await axios.post('/api/users/documents/license', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Driving license uploaded successfully. Pending verification.');
    } catch (error) {
      toast.error('Error uploading driving license');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>👤 My Profile</h1>
          <p>Manage your personal information and documents</p>
        </div>

        {user?.isVerified ? (
          <div className="verification-status verified">
            <span>✅</span>
            <span>Your profile is verified and ready to book!</span>
          </div>
        ) : (
          <div className="verification-status pending">
            <span>⚠️</span>
            <span>Please upload your documents for verification to start booking</span>
          </div>
        )}

        <div className="profile-card">
          <div className="card-header">
            <div className="card-icon info">
              📋
            </div>
            <h2>Personal Information</h2>
          </div>
          <form onSubmit={handleProfileSubmit}>
            <div className="form-row">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={profileData.street}
                  onChange={handleProfileChange}
                  placeholder="Enter your street address"
                />
              </div>
              <div className="input-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleProfileChange}
                  placeholder="Enter your city"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={profileData.state}
                  onChange={handleProfileChange}
                  placeholder="Enter your state"
                />
              </div>
              <div className="input-group">
                <label>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={profileData.pincode}
                  onChange={handleProfileChange}
                  placeholder="Enter your pincode"
                />
              </div>
            </div>
            <button type="submit" className="btn-submit">💾 Update Profile</button>
          </form>
        </div>

        <div className="documents-grid">
          <div className="profile-card">
            <div className="card-header">
              <div className="card-icon aadhar">
                🪪
              </div>
              <h2>Aadhar Card</h2>
            </div>
            {user?.documents?.aadharCard?.verified && (
              <div className="verified-badge">
                <span>✅</span>
                <span>Verified</span>
              </div>
            )}
            <form onSubmit={handleAadharSubmit}>
              <div className="input-group">
                <label>Aadhar Number</label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={documents.aadharNumber}
                  onChange={handleDocumentChange}
                  placeholder="Enter 12-digit Aadhar number"
                  maxLength="12"
                  required
                />
                <p className="info-text">Enter your 12-digit Aadhar card number</p>
              </div>
              <div className="input-group">
                <label>Upload Aadhar Card</label>
                <input
                  type="file"
                  name="aadharFile"
                  onChange={handleDocumentChange}
                  required
                  accept="image/*,application/pdf"
                />
                <p className="info-text">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
              </div>
              <button type="submit" className="btn-submit">📤 Upload Aadhar</button>
            </form>
          </div>

          <div className="profile-card">
            <div className="card-header">
              <div className="card-icon license">
                🚗
              </div>
              <h2>Driving License</h2>
            </div>
            {user?.documents?.drivingLicense?.verified && (
              <div className="verified-badge">
                <span>✅</span>
                <span>Verified</span>
              </div>
            )}
            <form onSubmit={handleLicenseSubmit}>
              <div className="input-group">
                <label>License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={documents.licenseNumber}
                  onChange={handleDocumentChange}
                  placeholder="Enter your DL number"
                  required
                />
                <p className="info-text">Enter your driving license number</p>
              </div>
              <div className="input-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={documents.expiryDate}
                  onChange={handleDocumentChange}
                  required
                />
                <p className="info-text">License must be valid for booking</p>
              </div>
              <div className="input-group">
                <label>Upload License</label>
                <input
                  type="file"
                  name="licenseFile"
                  onChange={handleDocumentChange}
                  required
                  accept="image/*,application/pdf"
                />
                <p className="info-text">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
              </div>
              <button type="submit" className="btn-submit">📤 Upload License</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
