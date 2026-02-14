import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { RiderSidebar } from './Dashboard';
import { toast } from 'react-toastify';
import { createTimeline, stagger } from 'animejs';
import ThreeBackground from '../../components/ThreeBackground';
import './RiderPanel.css';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('riderSidebarCollapsed') === 'true';
  });
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };
  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('riderSidebarCollapsed', String(next));
  };
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

  const containerRef = useRef(null);

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

  // Anime.js entrance animations
  useEffect(() => {
    if (!containerRef.current) return;
    const tl = createTimeline({ defaults: { ease: 'outExpo' } });

    tl.add(containerRef.current.querySelector('.profile-hero'), {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
    })
      .add(containerRef.current.querySelectorAll('.profile-card-item'), {
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.95, 1],
        duration: 700,
        delay: stagger(100),
      }, '-=500');
  }, []);

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
    <div className={`rider-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <RiderSidebar user={user} currentPath={location.pathname} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="rider-content">
        <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
          {/* Three.js Background */}
          <ThreeBackground />
          <div ref={containerRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4">
            {/* Hero Section */}
            <div className="profile-hero mb-4" style={{ opacity: 0 }}>
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-xl flex items-center justify-center text-3xl">
                    👤
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold mb-0.5">Welcome, {user?.name || 'User'}!</h1>
                    <p className="text-white/90 text-xs sm:text-sm">Manage your profile and documents</p>
                  </div>
                  {user?.isVerified && (
                    <div className="bg-green-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 font-semibold text-xs">
                      <span>✅</span>
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Banner */}
              {!user?.isVerified && (
                <div className="mt-3 bg-amber-100 border-2 border-amber-400 rounded-xl p-3 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <p className="text-amber-900 text-xs sm:text-sm flex-1">
                    <span className="font-bold">Action Required:</span> Upload your documents below to get verified!
                  </p>
                </div>
              )}
            </div>

            {/* Personal Information Card */}
            <div className="profile-card-item mb-4" style={{ opacity: 0 }}>
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center text-xl">
                      📋
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Personal Information</h2>
                  </div>
                </div>
                <form onSubmit={handleProfileSubmit} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">👤</span>
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          placeholder="Enter your full name"
                          required
                          className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📱</span>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          placeholder="Enter your phone number"
                          required
                          className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Street Address</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🏠</span>
                        <input
                          type="text"
                          name="street"
                          value={profileData.street}
                          onChange={handleProfileChange}
                          placeholder="Enter your street address"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">City</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🏙️</span>
                        <input
                          type="text"
                          name="city"
                          value={profileData.city}
                          onChange={handleProfileChange}
                          placeholder="Enter your city"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">State</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🗺️</span>
                        <input
                          type="text"
                          name="state"
                          value={profileData.state}
                          onChange={handleProfileChange}
                          placeholder="Enter your state"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pincode</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📮</span>
                        <input
                          type="text"
                          name="pincode"
                          value={profileData.pincode}
                          onChange={handleProfileChange}
                          placeholder="Enter your pincode"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="mt-4 w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
                  >
                    💾 Update Profile
                  </button>
                </form>
              </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Aadhar Card */}
              <div className="profile-card-item" style={{ opacity: 0 }}>
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden h-full">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center text-xl">
                          🪪
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-white">Aadhar Card</h2>
                      </div>
                      {user?.documents?.aadharCard?.verified && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          ✅ Verified
                        </div>
                      )}
                    </div>
                  </div>
                  <form onSubmit={handleAadharSubmit} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Aadhar Number</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔢</span>
                          <input
                            type="text"
                            name="aadharNumber"
                            value={documents.aadharNumber}
                            onChange={handleDocumentChange}
                            placeholder="12-digit Aadhar number"
                            maxLength="12"
                            required
                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all outline-none"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enter your 12-digit Aadhar card number</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Upload Aadhar Card</label>
                        <input
                          type="file"
                          name="aadharFile"
                          onChange={handleDocumentChange}
                          required
                          accept="image/*,application/pdf"
                          className="w-full px-3 py-2 text-xs bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all outline-none file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
                    >
                      📤 Upload Aadhar
                    </button>
                  </form>
                </div>
              </div>

              {/* Driving License */}
              <div className="profile-card-item" style={{ opacity: 0 }}>
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden h-full">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center text-xl">
                          🚗
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-white">Driving License</h2>
                      </div>
                      {user?.documents?.drivingLicense?.verified && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          ✅ Verified
                        </div>
                      )}
                    </div>
                  </div>
                  <form onSubmit={handleLicenseSubmit} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">License Number</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔢</span>
                          <input
                            type="text"
                            name="licenseNumber"
                            value={documents.licenseNumber}
                            onChange={handleDocumentChange}
                            placeholder="Enter your DL number"
                            required
                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enter your driving license number</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Expiry Date</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📅</span>
                          <input
                            type="date"
                            name="expiryDate"
                            value={documents.expiryDate}
                            onChange={handleDocumentChange}
                            required
                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">License must be valid for booking</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Upload License</label>
                        <input
                          type="file"
                          name="licenseFile"
                          onChange={handleDocumentChange}
                          required
                          accept="image/*,application/pdf"
                          className="w-full px-3 py-2 text-xs bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
                    >
                      📤 Upload License
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
