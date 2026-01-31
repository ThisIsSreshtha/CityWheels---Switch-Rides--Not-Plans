import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

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
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1>My Profile</h1>

      {user?.isVerified ? (
        <div className="alert alert-success">✅ Your profile is verified</div>
      ) : (
        <div className="alert alert-warning">⚠️ Please upload your documents for verification</div>
      )}

      <div className="card">
        <h2>Personal Information</h2>
        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Street</label>
              <input
                type="text"
                name="street"
                value={profileData.street}
                onChange={handleProfileChange}
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={profileData.city}
                onChange={handleProfileChange}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={profileData.state}
                onChange={handleProfileChange}
              />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={profileData.pincode}
                onChange={handleProfileChange}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Update Profile</button>
        </form>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Aadhar Card</h2>
          {user?.documents?.aadharCard?.verified && (
            <p className="alert alert-success">✅ Verified</p>
          )}
          <form onSubmit={handleAadharSubmit}>
            <div className="form-group">
              <label>Aadhar Number</label>
              <input
                type="text"
                name="aadharNumber"
                value={documents.aadharNumber}
                onChange={handleDocumentChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Upload Aadhar</label>
              <input
                type="file"
                name="aadharFile"
                onChange={handleDocumentChange}
                required
                accept="image/*,application/pdf"
              />
            </div>
            <button type="submit" className="btn btn-primary">Upload Aadhar</button>
          </form>
        </div>

        <div className="card">
          <h2>Driving License</h2>
          {user?.documents?.drivingLicense?.verified && (
            <p className="alert alert-success">✅ Verified</p>
          )}
          <form onSubmit={handleLicenseSubmit}>
            <div className="form-group">
              <label>License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={documents.licenseNumber}
                onChange={handleDocumentChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={documents.expiryDate}
                onChange={handleDocumentChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Upload License</label>
              <input
                type="file"
                name="licenseFile"
                onChange={handleDocumentChange}
                required
                accept="image/*,application/pdf"
              />
            </div>
            <button type="submit" className="btn btn-primary">Upload License</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
