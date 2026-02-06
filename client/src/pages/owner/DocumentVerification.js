import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Sidebar } from './Dashboard';
import './OwnerPanel.css';

const DocumentVerification = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [aadharData, setAadharData] = useState({ aadharNumber: '', aadharFile: null });
  const [licenseData, setLicenseData] = useState({ licenseNumber: '', expiryDate: '', licenseFile: null });
  const [businessData, setBusinessData] = useState({ gstNumber: '', businessDoc: null });

  const handleLogout = () => { logout(); navigate('/'); };

  const aadharStatus = user?.documents?.aadharCard?.verified
    ? 'verified'
    : user?.documents?.aadharCard?.number
      ? 'pending'
      : 'not-uploaded';

  const licenseStatus = user?.documents?.drivingLicense?.verified
    ? 'verified'
    : user?.documents?.drivingLicense?.number
      ? 'pending'
      : 'not-uploaded';

  const businessStatus = user?.documents?.businessRegistration?.verified
    ? 'verified'
    : user?.documents?.businessRegistration?.number
      ? 'pending'
      : 'not-uploaded';

  const allVerified = aadharStatus === 'verified' && licenseStatus === 'verified';
  const someUploaded = aadharStatus !== 'not-uploaded' || licenseStatus !== 'not-uploaded';

  const handleAadharSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('aadharNumber', aadharData.aadharNumber);
    formData.append('aadhar', aadharData.aadharFile);
    try {
      await axios.post('/api/owner/documents/aadhar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Aadhar uploaded. Pending verification.');
    } catch (error) {
      toast.error('Error uploading Aadhar');
    }
  };

  const handleLicenseSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('licenseNumber', licenseData.licenseNumber);
    formData.append('expiryDate', licenseData.expiryDate);
    formData.append('license', licenseData.licenseFile);
    try {
      await axios.post('/api/owner/documents/license', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('License uploaded. Pending verification.');
    } catch (error) {
      toast.error('Error uploading license');
    }
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('gstNumber', businessData.gstNumber);
    formData.append('businessDoc', businessData.businessDoc);
    try {
      await axios.post('/api/owner/documents/business', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Business document uploaded. Pending verification.');
    } catch (error) {
      toast.error('Error uploading document');
    }
  };

  const statusLabel = (status) => {
    const labels = {
      'verified': '✅ Verified',
      'pending': '⏳ Pending Review',
      'not-uploaded': '— Not Uploaded'
    };
    return labels[status];
  };

  return (
    <div className="owner-panel">
      <Sidebar user={user} currentPath={location.pathname} onLogout={handleLogout} />
      <div className="owner-content">
        <h1 className="page-title">Document Verification</h1>
        <p className="page-subtitle">Upload and verify your identity & business documents</p>

        {/* Verification Summary */}
        <div className={`verification-summary ${allVerified ? 'all-verified' : someUploaded ? 'partial' : 'none'}`}>
          <span>{allVerified ? '✅' : someUploaded ? '⏳' : '⚠️'}</span>
          <span>
            {allVerified
              ? 'All documents verified. You are ready to list vehicles!'
              : someUploaded
                ? 'Documents under review. Verification usually takes 24-48 hours.'
                : 'Please upload your documents to start listing vehicles for rent.'}
          </span>
        </div>

        <div className="documents-grid">
          {/* Aadhar Card */}
          <div className="doc-card">
            <div className="doc-card-header">
              <h3>🪪 Aadhar Card</h3>
              <span className={`doc-status ${aadharStatus}`}>{statusLabel(aadharStatus)}</span>
            </div>
            {aadharStatus === 'verified' ? (
              <div style={{ padding: '16px 0', color: '#64748b', fontSize: 13 }}>
                <p>Number: <strong>{user?.documents?.aadharCard?.number}</strong></p>
                <p style={{ color: '#16a34a', fontWeight: 600 }}>Document verified successfully</p>
              </div>
            ) : (
              <form className="owner-form" onSubmit={handleAadharSubmit}>
                <div className="form-group">
                  <label>Aadhar Number</label>
                  <input
                    type="text" maxLength="12"
                    value={aadharData.aadharNumber}
                    onChange={e => setAadharData({ ...aadharData, aadharNumber: e.target.value })}
                    placeholder="Enter 12-digit Aadhar number"
                    required
                  />
                  <p className="info-text">12-digit unique identification number</p>
                </div>
                <div className="form-group">
                  <label>Upload Aadhar</label>
                  <input
                    type="file" accept="image/*,application/pdf"
                    onChange={e => setAadharData({ ...aadharData, aadharFile: e.target.files[0] })}
                    required
                  />
                  <p className="info-text">JPG, PNG or PDF (Max 5MB)</p>
                </div>
                <button type="submit" className="btn-primary-owner">📤 Upload Aadhar</button>
              </form>
            )}
          </div>

          {/* Driving License */}
          <div className="doc-card">
            <div className="doc-card-header">
              <h3>🚗 Driving License</h3>
              <span className={`doc-status ${licenseStatus}`}>{statusLabel(licenseStatus)}</span>
            </div>
            {licenseStatus === 'verified' ? (
              <div style={{ padding: '16px 0', color: '#64748b', fontSize: 13 }}>
                <p>Number: <strong>{user?.documents?.drivingLicense?.number}</strong></p>
                <p style={{ color: '#16a34a', fontWeight: 600 }}>Document verified successfully</p>
              </div>
            ) : (
              <form className="owner-form" onSubmit={handleLicenseSubmit}>
                <div className="form-group">
                  <label>License Number</label>
                  <input
                    type="text"
                    value={licenseData.licenseNumber}
                    onChange={e => setLicenseData({ ...licenseData, licenseNumber: e.target.value })}
                    placeholder="Enter DL number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={licenseData.expiryDate}
                    onChange={e => setLicenseData({ ...licenseData, expiryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Upload License</label>
                  <input
                    type="file" accept="image/*,application/pdf"
                    onChange={e => setLicenseData({ ...licenseData, licenseFile: e.target.files[0] })}
                    required
                  />
                  <p className="info-text">JPG, PNG or PDF (Max 5MB)</p>
                </div>
                <button type="submit" className="btn-primary-owner">📤 Upload License</button>
              </form>
            )}
          </div>

          {/* Business Registration */}
          <div className="doc-card">
            <div className="doc-card-header">
              <h3>🏢 Business / GST</h3>
              <span className={`doc-status ${businessStatus}`}>{statusLabel(businessStatus)}</span>
            </div>
            {businessStatus === 'verified' ? (
              <div style={{ padding: '16px 0', color: '#64748b', fontSize: 13 }}>
                <p>GST: <strong>{user?.documents?.businessRegistration?.number}</strong></p>
                <p style={{ color: '#16a34a', fontWeight: 600 }}>Document verified successfully</p>
              </div>
            ) : (
              <form className="owner-form" onSubmit={handleBusinessSubmit}>
                <div className="form-group">
                  <label>GST / Registration Number</label>
                  <input
                    type="text"
                    value={businessData.gstNumber}
                    onChange={e => setBusinessData({ ...businessData, gstNumber: e.target.value })}
                    placeholder="Enter GST or registration number"
                    required
                  />
                  <p className="info-text">Optional but recommended for business owners</p>
                </div>
                <div className="form-group">
                  <label>Upload Document</label>
                  <input
                    type="file" accept="image/*,application/pdf"
                    onChange={e => setBusinessData({ ...businessData, businessDoc: e.target.files[0] })}
                    required
                  />
                  <p className="info-text">Business registration certificate or GST document</p>
                </div>
                <button type="submit" className="btn-primary-owner">📤 Upload Document</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerification;
