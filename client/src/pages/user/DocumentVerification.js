import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { animate, stagger, createTimeline } from 'animejs';
import * as THREE from 'three';
import './DocumentVerification.css';

/* ------------------------------------------------------------------ */
/*  Three.js Background – floating document-themed shapes              */
/* ------------------------------------------------------------------ */
const ThreeDocBg = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 24);

    scene.add(new THREE.AmbientLight(0xfff8e1, 0.65));
    const pl = new THREE.PointLight(0x90caf9, 0.45, 70);
    pl.position.set(8, 10, 18);
    scene.add(pl);
    const pl2 = new THREE.PointLight(0xffb74d, 0.35, 70);
    pl2.position.set(-8, -5, 14);
    scene.add(pl2);

    const mats = [
      new THREE.MeshStandardMaterial({ color: 0x90caf9, transparent: true, opacity: 0.10, metalness: 0.2, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xffcc80, transparent: true, opacity: 0.09, metalness: 0.2, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xa5d6a7, transparent: true, opacity: 0.08, metalness: 0.2, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xce93d8, transparent: true, opacity: 0.07, metalness: 0.2, roughness: 0.7 }),
    ];
    const geos = [
      new THREE.BoxGeometry(0.28, 0.36, 0.02),   // document shape
      new THREE.RingGeometry(0.12, 0.20, 20),     // stamp ring
      new THREE.OctahedronGeometry(0.14),
      new THREE.SphereGeometry(0.10, 10, 10),
      new THREE.TorusGeometry(0.16, 0.05, 8, 20),
    ];

    const meshes = [];
    const count = window.innerWidth > 768 ? 16 : 10;
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(geos[i % geos.length], mats[i % mats.length].clone());
      m.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 24, -10 - Math.random() * 14);
      const s = 0.5 + Math.random() * 0.7;
      m.scale.set(s, s, s);
      m.userData = {
        sx: (Math.random() - 0.5) * 0.0012,
        sy: (Math.random() - 0.5) * 0.001,
        rx: (Math.random() - 0.5) * 0.002,
        ry: (Math.random() - 0.5) * 0.002,
      };
      scene.add(m);
      meshes.push(m);
    }

    const handleResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    let fid;
    const clock = new THREE.Clock();
    const tick = () => {
      fid = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      meshes.forEach((m) => {
        m.rotation.x += m.userData.rx;
        m.rotation.y += m.userData.ry;
        m.position.x += m.userData.sx;
        m.position.y += m.userData.sy + Math.sin(t * 0.35 + m.position.x) * 0.0002;
        if (m.position.x > 22) m.position.x = -22;
        if (m.position.x < -22) m.position.x = 22;
        if (m.position.y > 14) m.position.y = -14;
        if (m.position.y < -14) m.position.y = 14;
      });
      pl.position.x = 6 + Math.sin(t * 0.25) * 4;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(fid);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      meshes.forEach((m) => { m.geometry.dispose(); m.material.dispose(); });
    };
  }, []);

  return <div ref={mountRef} className="dv-three-bg" />;
};

/* ------------------------------------------------------------------ */
/*  Main DocumentVerification Component                                */
/* ------------------------------------------------------------------ */
const DocumentVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageRef = useRef(null);

  // Get redirect info from navigation state
  const returnTo = location.state?.returnTo || null;
  const vehicleName = location.state?.vehicleName || null;

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAadhar, setUploadingAadhar] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);

  const [aadharData, setAadharData] = useState({
    number: '',
    file: null,
  });
  const [licenseData, setLicenseData] = useState({
    number: '',
    file: null,
    expiryDate: '',
  });

  /* ---- Fetch user profile ---- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/users/profile');
        setProfileData(res.data.data);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  /* ---- Anime.js entrance ---- */
  useEffect(() => {
    if (loading || !pageRef.current) return;
    const tl = createTimeline({ defaults: { ease: 'outQuart' } });
    tl.add(pageRef.current.querySelector('.dv-header'), {
      opacity: [0, 1], translateY: [-25, 0], duration: 600,
    });
    const alert = pageRef.current.querySelector('.dv-alert');
    if (alert) {
      tl.add(alert, {
        opacity: [0, 1], translateX: [-20, 0], duration: 500,
      }, '-=300');
    }
    tl.add(pageRef.current.querySelectorAll('.dv-doc-card'), {
      opacity: [0, 1], translateY: [30, 0], duration: 550, delay: stagger(120),
    }, '-=300');
    const statusEl = pageRef.current.querySelector('.dv-status-panel');
    if (statusEl) {
      tl.add(statusEl, {
        opacity: [0, 1], translateX: [25, 0], duration: 500,
      }, '-=400');
    }
  }, [loading]);

  /* ---- Handlers ---- */
  const handleAadharSubmit = async (e) => {
    e.preventDefault();
    if (!aadharData.number.trim() || aadharData.number.length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhar number');
      return;
    }
    if (!aadharData.file) {
      toast.error('Please upload your Aadhar card image');
      return;
    }

    setUploadingAadhar(true);
    try {
      const fd = new FormData();
      fd.append('aadharNumber', aadharData.number);
      fd.append('aadhar', aadharData.file);
      await axios.post('/api/users/documents/aadhar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Aadhar card uploaded! Pending admin verification.');
      // Refresh profile
      const res = await axios.get('/api/users/profile');
      setProfileData(res.data.data);
      // Animate success
      if (pageRef.current) {
        const card = pageRef.current.querySelector('.dv-aadhar-card');
        if (card) animate(card, { scale: [1, 1.02, 1], duration: 400, ease: 'outQuad' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload Aadhar');
    } finally {
      setUploadingAadhar(false);
    }
  };

  const handleLicenseSubmit = async (e) => {
    e.preventDefault();
    if (!licenseData.number.trim()) {
      toast.error('Please enter your driving license number');
      return;
    }
    if (!licenseData.expiryDate) {
      toast.error('Please select license expiry date');
      return;
    }
    if (!licenseData.file) {
      toast.error('Please upload your driving license image');
      return;
    }

    setUploadingLicense(true);
    try {
      const fd = new FormData();
      fd.append('licenseNumber', licenseData.number);
      fd.append('expiryDate', licenseData.expiryDate);
      fd.append('license', licenseData.file);
      await axios.post('/api/users/documents/license', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Driving license uploaded! Pending admin verification.');
      const res = await axios.get('/api/users/profile');
      setProfileData(res.data.data);
      if (pageRef.current) {
        const card = pageRef.current.querySelector('.dv-license-card');
        if (card) animate(card, { scale: [1, 1.02, 1], duration: 400, ease: 'outQuad' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload license');
    } finally {
      setUploadingLicense(false);
    }
  };

  /* ---- Status helpers ---- */
  const aadhar = profileData?.documents?.aadharCard;
  const license = profileData?.documents?.drivingLicense;
  const isFullyVerified = profileData?.isVerified;
  const aadharUploaded = !!aadhar?.number;
  const licenseUploaded = !!license?.number;
  const aadharVerified = !!aadhar?.verified;
  const licenseVerified = !!license?.verified;
  const bothUploaded = aadharUploaded && licenseUploaded;
  const pendingVerification = bothUploaded && !isFullyVerified;

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="dv-page">
        <ThreeDocBg />
        <div className="dv-loading">
          <div className="dv-spinner"></div>
          <p>Loading your verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dv-page" ref={pageRef}>
      <ThreeDocBg />

      <div className="dv-container">
        {/* Breadcrumb */}
        <nav className="dv-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/user/dashboard">Dashboard</Link>
          <span>/</span>
          <span className="dv-bc-current">Document Verification</span>
        </nav>

        {/* Header */}
        <div className="dv-header" style={{ opacity: 0 }}>
          <div className="dv-header-icon">🪪</div>
          <h1>Document Verification</h1>
          <p className="dv-header-sub">
            Upload your documents to verify your identity and start booking vehicles.
          </p>
        </div>

        {/* Alert Banner */}
        {returnTo && !isFullyVerified && (
          <div className="dv-alert" style={{ opacity: 0 }}>
            <span className="dv-alert-icon">🔒</span>
            <div className="dv-alert-text">
              <strong>Verification Required</strong>
              <p>
                {vehicleName
                  ? `To book "${vehicleName}", please verify your documents first.`
                  : 'Please complete document verification to proceed with booking.'}
              </p>
            </div>
          </div>
        )}

        {/* Already verified — success banner */}
        {isFullyVerified && (
          <div className="dv-verified-banner">
            <span>✅</span>
            <div>
              <strong>You're Verified!</strong>
              <p>Your documents have been verified. You can book any vehicle.</p>
            </div>
            {returnTo && (
              <button className="dv-continue-btn" onClick={() => navigate(returnTo)}>
                Continue to Booking →
              </button>
            )}
          </div>
        )}

        {/* Main Grid */}
        <div className="dv-main-grid">
          {/* Left: Document Cards */}
          <div className="dv-docs-col">
            {/* Aadhar Card */}
            <div className={`dv-doc-card dv-aadhar-card ${aadharVerified ? 'verified' : aadharUploaded ? 'uploaded' : ''}`} style={{ opacity: 0 }}>
              <div className="dv-doc-header">
                <div className="dv-doc-icon">🪪</div>
                <div>
                  <h3>Aadhar Card</h3>
                  <p className="dv-doc-desc">Government-issued identity proof</p>
                </div>
                {aadharVerified ? (
                  <span className="dv-badge verified">✅ Verified</span>
                ) : aadharUploaded ? (
                  <span className="dv-badge pending">⏳ Pending</span>
                ) : (
                  <span className="dv-badge required">Required</span>
                )}
              </div>

              {aadharVerified ? (
                <div className="dv-doc-verified-info">
                  <div className="dv-verified-check">
                    <span className="dv-verified-icon">✓</span>
                    <span>Aadhar number: •••• •••• {aadhar.number?.slice(-4)}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAadharSubmit} className="dv-doc-form">
                  <div className="dv-form-field">
                    <label>Aadhar Number</label>
                    <input
                      type="text"
                      placeholder="Enter 12-digit Aadhar number"
                      maxLength="12"
                      value={aadharData.number}
                      onChange={(e) => setAadharData((p) => ({ ...p, number: e.target.value.replace(/\D/g, '') }))}
                      disabled={aadharUploaded}
                    />
                    <span className="dv-field-hint">12-digit unique identification number</span>
                  </div>
                  <div className="dv-form-field">
                    <label>Upload Aadhar Image</label>
                    <div className="dv-file-upload">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setAadharData((p) => ({ ...p, file: e.target.files[0] }))}
                        disabled={aadharUploaded}
                        id="aadhar-file"
                      />
                      <label htmlFor="aadhar-file" className={`dv-file-label ${aadharData.file ? 'has-file' : ''}`}>
                        {aadharData.file ? (
                          <><span>📎</span> {aadharData.file.name}</>
                        ) : aadharUploaded ? (
                          <><span>📎</span> Already uploaded</>
                        ) : (
                          <><span>📤</span> Choose file (JPG, PNG, PDF)</>
                        )}
                      </label>
                    </div>
                  </div>
                  {!aadharUploaded && (
                    <button type="submit" className="dv-submit-btn" disabled={uploadingAadhar}>
                      {uploadingAadhar ? (
                        <><span className="dv-btn-spinner"></span> Uploading...</>
                      ) : (
                        <>📤 Upload Aadhar</>
                      )}
                    </button>
                  )}
                  {aadharUploaded && !aadharVerified && (
                    <p className="dv-waiting-text">⏳ Waiting for admin verification...</p>
                  )}
                </form>
              )}
            </div>

            {/* Driving License */}
            <div className={`dv-doc-card dv-license-card ${licenseVerified ? 'verified' : licenseUploaded ? 'uploaded' : ''}`} style={{ opacity: 0 }}>
              <div className="dv-doc-header">
                <div className="dv-doc-icon">🚗</div>
                <div>
                  <h3>Driving License</h3>
                  <p className="dv-doc-desc">Valid driving permit</p>
                </div>
                {licenseVerified ? (
                  <span className="dv-badge verified">✅ Verified</span>
                ) : licenseUploaded ? (
                  <span className="dv-badge pending">⏳ Pending</span>
                ) : (
                  <span className="dv-badge required">Required</span>
                )}
              </div>

              {licenseVerified ? (
                <div className="dv-doc-verified-info">
                  <div className="dv-verified-check">
                    <span className="dv-verified-icon">✓</span>
                    <span>License: {license.number}</span>
                  </div>
                  {license.expiryDate && (
                    <p className="dv-expiry-text">
                      Expires: {new Date(license.expiryDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleLicenseSubmit} className="dv-doc-form">
                  <div className="dv-form-row">
                    <div className="dv-form-field">
                      <label>License Number</label>
                      <input
                        type="text"
                        placeholder="e.g. KA01-2020-0012345"
                        value={licenseData.number}
                        onChange={(e) => setLicenseData((p) => ({ ...p, number: e.target.value }))}
                        disabled={licenseUploaded}
                      />
                    </div>
                    <div className="dv-form-field">
                      <label>Expiry Date</label>
                      <input
                        type="date"
                        value={licenseData.expiryDate}
                        onChange={(e) => setLicenseData((p) => ({ ...p, expiryDate: e.target.value }))}
                        disabled={licenseUploaded}
                        min={new Date().toISOString().slice(0, 10)}
                      />
                    </div>
                  </div>
                  <div className="dv-form-field">
                    <label>Upload License Image</label>
                    <div className="dv-file-upload">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setLicenseData((p) => ({ ...p, file: e.target.files[0] }))}
                        disabled={licenseUploaded}
                        id="license-file"
                      />
                      <label htmlFor="license-file" className={`dv-file-label ${licenseData.file ? 'has-file' : ''}`}>
                        {licenseData.file ? (
                          <><span>📎</span> {licenseData.file.name}</>
                        ) : licenseUploaded ? (
                          <><span>📎</span> Already uploaded</>
                        ) : (
                          <><span>📤</span> Choose file (JPG, PNG, PDF)</>
                        )}
                      </label>
                    </div>
                  </div>
                  {!licenseUploaded && (
                    <button type="submit" className="dv-submit-btn" disabled={uploadingLicense}>
                      {uploadingLicense ? (
                        <><span className="dv-btn-spinner"></span> Uploading...</>
                      ) : (
                        <>📤 Upload License</>
                      )}
                    </button>
                  )}
                  {licenseUploaded && !licenseVerified && (
                    <p className="dv-waiting-text">⏳ Waiting for admin verification...</p>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Right: Status Panel */}
          <div className="dv-status-panel" style={{ opacity: 0 }}>
            <h3 className="dv-sp-title">📊 Verification Status</h3>

            <div className="dv-checklist">
              <div className={`dv-check-item ${aadharUploaded ? 'done' : ''}`}>
                <div className="dv-check-circle">{aadharUploaded ? '✓' : '1'}</div>
                <div>
                  <span className="dv-check-label">Upload Aadhar Card</span>
                  <span className="dv-check-status">
                    {aadharVerified ? 'Verified ✅' : aadharUploaded ? 'Uploaded — awaiting review' : 'Not uploaded'}
                  </span>
                </div>
              </div>
              <div className={`dv-check-item ${licenseUploaded ? 'done' : ''}`}>
                <div className="dv-check-circle">{licenseUploaded ? '✓' : '2'}</div>
                <div>
                  <span className="dv-check-label">Upload Driving License</span>
                  <span className="dv-check-status">
                    {licenseVerified ? 'Verified ✅' : licenseUploaded ? 'Uploaded — awaiting review' : 'Not uploaded'}
                  </span>
                </div>
              </div>
              <div className={`dv-check-item ${isFullyVerified ? 'done' : ''}`}>
                <div className="dv-check-circle">{isFullyVerified ? '✓' : '3'}</div>
                <div>
                  <span className="dv-check-label">Admin Approval</span>
                  <span className="dv-check-status">
                    {isFullyVerified ? 'Approved ✅' : pendingVerification ? 'Under review' : 'Waiting for documents'}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="dv-progress-bar">
              <div
                className="dv-progress-fill"
                style={{
                  width: isFullyVerified ? '100%' : pendingVerification ? '66%' : (aadharUploaded || licenseUploaded) ? '33%' : '0%',
                }}
              ></div>
            </div>
            <p className="dv-progress-text">
              {isFullyVerified
                ? '✅ All documents verified!'
                : pendingVerification
                  ? '⏳ Documents under admin review'
                  : `${[aadharUploaded, licenseUploaded].filter(Boolean).length}/2 documents uploaded`}
            </p>

            {/* Info Section */}
            <div className="dv-info-box">
              <h4>ℹ️ How it works</h4>
              <ol>
                <li>Upload your Aadhar Card and Driving License</li>
                <li>Our admin team reviews your documents</li>
                <li>Once verified, you can book any vehicle</li>
              </ol>
              <p className="dv-info-note">Verification usually takes 1-2 hours during business hours.</p>
            </div>

            {isFullyVerified && returnTo && (
              <button
                className="dv-continue-booking-btn"
                onClick={() => navigate(returnTo)}
              >
                🚗 Continue to Booking →
              </button>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="dv-bottom-actions">
          <Link to="/user/dashboard" className="dv-action-link secondary">
            ← Back to Dashboard
          </Link>
          {isFullyVerified && !returnTo && (
            <Link to="/vehicles" className="dv-action-link primary">
              🚗 Browse Vehicles →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentVerification;
