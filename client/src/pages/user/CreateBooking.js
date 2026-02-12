import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { animate, stagger, createTimeline } from 'animejs';
import * as THREE from 'three';
import { AuthContext } from '../../context/AuthContext';
import './CreateBooking.css';

/* ------------------------------------------------------------------ */
/*  Mini Three.js background (floating wheels / road particles)       */
/* ------------------------------------------------------------------ */
const ThreeBookingBg = () => {
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

    /* Warm ambient + subtle colored lights for cream theme */
    scene.add(new THREE.AmbientLight(0xfff8e1, 0.6));
    const pl = new THREE.PointLight(0xffb74d, 0.5, 70);
    pl.position.set(8, 10, 18);
    scene.add(pl);
    const pl2 = new THREE.PointLight(0xce93d8, 0.3, 70);
    pl2.position.set(-8, -5, 14);
    scene.add(pl2);

    /* Soft warm-toned materials */
    const mats = [
      new THREE.MeshStandardMaterial({ color: 0xffcc80, transparent: true, opacity: 0.12, metalness: 0.2, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xf48fb1, transparent: true, opacity: 0.09, metalness: 0.2, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xce93d8, transparent: true, opacity: 0.08, metalness: 0.2, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xa5d6a7, transparent: true, opacity: 0.07, metalness: 0.2, roughness: 0.7 }),
    ];
    const geos = [
      new THREE.TorusGeometry(0.22, 0.07, 10, 24),
      new THREE.OctahedronGeometry(0.16),
      new THREE.SphereGeometry(0.12, 12, 12),
      new THREE.RingGeometry(0.12, 0.22, 20),
      new THREE.IcosahedronGeometry(0.14, 0),
    ];

    const meshes = [];
    const count = window.innerWidth > 768 ? 18 : 10;
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(geos[i % geos.length], mats[i % mats.length].clone());
      m.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 24, -10 - Math.random() * 14);
      const s = 0.5 + Math.random() * 0.7;
      m.scale.set(s, s, s);
      m.userData = {
        sx: (Math.random() - 0.5) * 0.0015,
        sy: (Math.random() - 0.5) * 0.0015,
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
        m.position.y += m.userData.sy + Math.sin(t * 0.4 + m.position.x) * 0.0002;
        if (m.position.x > 22) m.position.x = -22;
        if (m.position.x < -22) m.position.x = 22;
        if (m.position.y > 14) m.position.y = -14;
        if (m.position.y < -14) m.position.y = 14;
      });
      pl.position.x = 6 + Math.sin(t * 0.3) * 4;
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

  return <div ref={mountRef} className="cb-three-bg" />;
};

/* ------------------------------------------------------------------ */
/*  Main CreateBooking Component                                       */
/* ------------------------------------------------------------------ */
const CreateBooking = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const { user } = useContext(AuthContext);

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1 = details, 2 = review, 3 = success

  const [formData, setFormData] = useState({
    rentalPeriod: 'daily',
    duration: 1,
    startDate: '',
    travelPurpose: 'personal',
    purposeDetails: '',
    pickupAddress: '',
    dropoffAddress: '',
  });

  /* ---- Calculated pricing ---- */
  const calcPricing = useCallback(() => {
    if (!vehicle) return { base: 0, tax: 0, deposit: 0, total: 0 };
    let base = 0;
    if (formData.rentalPeriod === 'hourly') base = (vehicle.pricing?.hourly || 0) * formData.duration;
    else if (formData.rentalPeriod === 'daily') base = (vehicle.pricing?.daily || 0) * formData.duration;
    else if (formData.rentalPeriod === 'weekly') base = (vehicle.pricing?.weekly || 0) * formData.duration;
    const tax = Math.round(base * 0.18);
    const deposit = vehicle.pricing?.securityDeposit || 0;
    return { base, tax, deposit, total: base + tax + deposit };
  }, [vehicle, formData.rentalPeriod, formData.duration]);

  const pricing = calcPricing();

  /* ---- Fetch vehicle ---- */
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await axios.get(`/api/vehicles/${vehicleId}`);
        setVehicle(res.data.data);

        // Pre-fill pickup from vehicle location
        const loc = res.data.data?.location;
        if (loc?.pickupPoint?.address) {
          setFormData((prev) => ({ ...prev, pickupAddress: loc.pickupPoint.address }));
        }
      } catch (err) {
        toast.error('Failed to load vehicle details');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [vehicleId]);

  /* ---- Anime.js entrance ---- */
  useEffect(() => {
    if (loading || !vehicle || !formRef.current) return;
    const tl = createTimeline({ defaults: { ease: 'outQuart' } });
    tl.add(formRef.current.querySelector('.cb-vehicle-summary'), {
      opacity: [0, 1], translateY: [-25, 0], duration: 600,
    })
    .add(formRef.current.querySelectorAll('.cb-form-section'), {
      opacity: [0, 1], translateY: [30, 0], duration: 550, delay: stagger(80),
    }, '-=350')
    .add(formRef.current.querySelector('.cb-pricing-panel'), {
      opacity: [0, 1], translateX: [30, 0], duration: 600,
    }, '-=500');
  }, [loading, vehicle]);

  /* ---- Step transition animation ---- */
  useEffect(() => {
    if (!formRef.current) return;
    const panels = formRef.current.querySelectorAll('.cb-step-panel');
    if (panels.length) {
      animate(panels, { opacity: [0, 1], translateY: [20, 0], duration: 500, ease: 'outQuart' });
    }
  }, [step]);

  /* ---- Handlers ---- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' ? Math.max(1, parseInt(value, 10) || 1) : value,
    }));
  };

  const getVehicleIcon = (type) => {
    const icons = { car: '🚗', motorcycle: '🏍️', bicycle: '🚲', scooter: '🛵', scooty: '🛵' };
    return icons[type] || '🚗';
  };

  const getPeriodLabel = (p) => {
    if (p === 'hourly') return 'Hour(s)';
    if (p === 'daily') return 'Day(s)';
    return 'Week(s)';
  };

  const getEndDate = () => {
    if (!formData.startDate) return '—';
    const start = new Date(formData.startDate);
    if (formData.rentalPeriod === 'hourly') start.setHours(start.getHours() + formData.duration);
    else if (formData.rentalPeriod === 'daily') start.setDate(start.getDate() + formData.duration);
    else start.setDate(start.getDate() + formData.duration * 7);
    return start.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const validateStep1 = () => {
    if (!formData.startDate) { toast.error('Please select a start date'); return false; }
    if (new Date(formData.startDate) < new Date()) { toast.error('Start date cannot be in the past'); return false; }
    if (!formData.travelPurpose) { toast.error('Please select travel purpose'); return false; }
    if (!formData.pickupAddress.trim()) { toast.error('Please enter pickup address'); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    /* ---- Redirect unverified users to document verification ---- */
    if (!user?.isVerified) {
      toast.info('Please verify your documents before booking.');
      navigate('/user/verify-documents', {
        state: {
          returnTo: `/user/book/${vehicleId}`,
          vehicleName: vehicle?.name || 'your vehicle',
        },
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        vehicleId,
        rentalPeriod: formData.rentalPeriod,
        duration: formData.duration,
        startDate: formData.startDate,
        travelPurpose: formData.travelPurpose,
        purposeDetails: formData.purposeDetails,
        pickupLocation: { address: formData.pickupAddress },
        dropoffLocation: { address: formData.dropoffAddress || formData.pickupAddress },
      };
      const res = await axios.post('/api/bookings', payload);
      const createdBooking = res.data.data;
      toast.success('Booking confirmed! Redirecting to payment...');
      // Navigate to confirmation/payment page
      navigate(`/user/booking-confirmation/${createdBooking._id}`, {
        state: { booking: createdBooking, vehicle },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- Render ---- */
  if (loading) {
    return (
      <div className="cb-page">
        <ThreeBookingBg />
        <div className="cb-loading">
          <div className="cb-spinner"></div>
          <p>Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="cb-page">
        <ThreeBookingBg />
        <div className="cb-not-found">
          <span className="cb-nf-icon">🚫</span>
          <h2>Vehicle Not Found</h2>
          <p>This vehicle is no longer available.</p>
          <Link to="/vehicles" className="cb-back-btn">← Browse Vehicles</Link>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const hasImage = vehicle.images && vehicle.images.length > 0;

  return (
    <div className="cb-page" ref={formRef}>
      <ThreeBookingBg />

      <div className="cb-container">
        {/* Breadcrumb */}
        <nav className="cb-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/vehicles">Vehicles</Link>
          <span>/</span>
          <Link to={`/vehicles/${vehicleId}`}>{vehicle.name}</Link>
          <span>/</span>
          <span className="cb-bc-current">Book</span>
        </nav>

        {/* Progress Steps */}
        <div className="cb-progress">
          <div className={`cb-prog-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            <div className="cb-prog-circle">1</div>
            <span>Details</span>
          </div>
          <div className="cb-prog-line"></div>
          <div className={`cb-prog-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
            <div className="cb-prog-circle">2</div>
            <span>Review</span>
          </div>
          <div className="cb-prog-line"></div>
          <div className={`cb-prog-step ${step >= 3 ? 'active' : ''}`}>
            <div className="cb-prog-circle">3</div>
            <span>Confirmed</span>
          </div>
        </div>

        {/* Vehicle Summary */}
        <div className="cb-vehicle-summary" style={{ opacity: 0 }}>
          <div className="cb-vs-image">
            {hasImage ? (
              <img src={`${baseUrl}${vehicle.images[0]}`} alt={vehicle.name}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
            ) : null}
            <div className="cb-vs-placeholder" style={hasImage ? { display: 'none' } : {}}>
              <span>{getVehicleIcon(vehicle.type)}</span>
            </div>
          </div>
          <div className="cb-vs-info">
            <h2>{vehicle.name}</h2>
            <p className="cb-vs-meta">{vehicle.brand} {vehicle.model} &bull; {vehicle.type} &bull; {vehicle.category}</p>
            {vehicle.location && (
              <p className="cb-vs-loc">📍 {vehicle.location.area ? `${vehicle.location.area}, ` : ''}{vehicle.location.city}, {vehicle.location.state}</p>
            )}
            <div className="cb-vs-prices">
              <span>₹{vehicle.pricing?.hourly}/hr</span>
              <span className="cb-vs-featured">₹{vehicle.pricing?.daily}/day</span>
              <span>₹{vehicle.pricing?.weekly}/wk</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="cb-main-grid">
          {/* Left: Form Steps */}
          <div className="cb-form-area">
            {step === 1 && (
              <div className="cb-step-panel">
                {/* Rental Period */}
                <div className="cb-form-section" style={{ opacity: 0 }}>
                  <h3 className="cb-section-title">📅 Rental Period</h3>
                  <div className="cb-period-toggle">
                    {['hourly', 'daily', 'weekly'].map((p) => (
                      <button key={p} type="button"
                        className={`cb-period-btn ${formData.rentalPeriod === p ? 'active' : ''}`}
                        onClick={() => setFormData((prev) => ({ ...prev, rentalPeriod: p }))}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="cb-duration-row">
                    <label>Duration ({getPeriodLabel(formData.rentalPeriod)})</label>
                    <div className="cb-duration-ctrl">
                      <button type="button" className="cb-dur-btn"
                        onClick={() => setFormData((prev) => ({ ...prev, duration: Math.max(1, prev.duration - 1) }))}>−</button>
                      <input type="number" name="duration" value={formData.duration} onChange={handleChange} min="1" max="99" />
                      <button type="button" className="cb-dur-btn"
                        onClick={() => setFormData((prev) => ({ ...prev, duration: prev.duration + 1 }))}>+</button>
                    </div>
                  </div>
                  <div className="cb-field">
                    <label>Start Date & Time</label>
                    <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange}
                      min={new Date().toISOString().slice(0, 16)} />
                  </div>
                  {formData.startDate && (
                    <p className="cb-end-display">
                      Estimated return: <strong>{getEndDate()}</strong>
                    </p>
                  )}
                </div>

                {/* Travel Purpose */}
                <div className="cb-form-section" style={{ opacity: 0 }}>
                  <h3 className="cb-section-title">🎯 Travel Purpose</h3>
                  <div className="cb-purpose-grid">
                    {[
                      { value: 'personal', icon: '🏠', label: 'Personal' },
                      { value: 'business', icon: '💼', label: 'Business' },
                      { value: 'tourism', icon: '🏖️', label: 'Tourism' },
                      { value: 'emergency', icon: '🚨', label: 'Emergency' },
                      { value: 'other', icon: '📋', label: 'Other' },
                    ].map((p) => (
                      <button key={p.value} type="button"
                        className={`cb-purpose-btn ${formData.travelPurpose === p.value ? 'active' : ''}`}
                        onClick={() => setFormData((prev) => ({ ...prev, travelPurpose: p.value }))}>
                        <span className="cb-purpose-icon">{p.icon}</span>
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                  {(formData.travelPurpose === 'other' || formData.travelPurpose === 'business') && (
                    <div className="cb-field" style={{ marginTop: '12px' }}>
                      <label>Details (optional)</label>
                      <input type="text" name="purposeDetails" value={formData.purposeDetails}
                        onChange={handleChange} placeholder="Brief description..." />
                    </div>
                  )}
                </div>

                {/* Pickup / Dropoff */}
                <div className="cb-form-section" style={{ opacity: 0 }}>
                  <h3 className="cb-section-title">📍 Location</h3>
                  <div className="cb-field">
                    <label>Pickup Address *</label>
                    <input type="text" name="pickupAddress" value={formData.pickupAddress}
                      onChange={handleChange} placeholder="Enter pickup location" />
                  </div>
                  <div className="cb-field">
                    <label>Drop-off Address <span className="cb-opt">(same as pickup if empty)</span></label>
                    <input type="text" name="dropoffAddress" value={formData.dropoffAddress}
                      onChange={handleChange} placeholder="Enter drop-off location (optional)" />
                  </div>
                </div>

                <button type="button" className="cb-next-btn" onClick={handleNext}>
                  Review Booking <span className="cb-arr">→</span>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="cb-step-panel">
                <div className="cb-review-card">
                  <h3 className="cb-section-title">📋 Booking Summary</h3>
                  <div className="cb-review-grid">
                    <div className="cb-rv-item">
                      <span className="cb-rv-label">Vehicle</span>
                      <span className="cb-rv-value">{vehicle.name}</span>
                    </div>
                    <div className="cb-rv-item">
                      <span className="cb-rv-label">Rental</span>
                      <span className="cb-rv-value">{formData.duration} {getPeriodLabel(formData.rentalPeriod)}</span>
                    </div>
                    <div className="cb-rv-item">
                      <span className="cb-rv-label">Start</span>
                      <span className="cb-rv-value">{new Date(formData.startDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    <div className="cb-rv-item">
                      <span className="cb-rv-label">Return By</span>
                      <span className="cb-rv-value">{getEndDate()}</span>
                    </div>
                    <div className="cb-rv-item">
                      <span className="cb-rv-label">Purpose</span>
                      <span className="cb-rv-value" style={{ textTransform: 'capitalize' }}>{formData.travelPurpose}</span>
                    </div>
                    <div className="cb-rv-item">
                      <span className="cb-rv-label">Pickup</span>
                      <span className="cb-rv-value">{formData.pickupAddress}</span>
                    </div>
                    {formData.dropoffAddress && (
                      <div className="cb-rv-item">
                        <span className="cb-rv-label">Drop-off</span>
                        <span className="cb-rv-value">{formData.dropoffAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="cb-review-actions">
                  <button type="button" className="cb-back-link" onClick={handleBack}>← Edit Details</button>
                  <button type="button" className="cb-confirm-btn" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                      <><span className="cb-btn-spinner"></span> Booking...</>
                    ) : (
                      <>Confirm & Book <span className="cb-arr">✓</span></>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right: Pricing Panel */}
          {step < 3 && (
            <div className="cb-pricing-panel" style={{ opacity: 0 }}>
              <h3 className="cb-pp-title">💰 Price Breakdown</h3>
              <div className="cb-pp-rows">
                <div className="cb-pp-row">
                  <span>Base ({formData.duration} {getPeriodLabel(formData.rentalPeriod).toLowerCase()})</span>
                  <span>₹{pricing.base.toLocaleString()}</span>
                </div>
                <div className="cb-pp-row">
                  <span>GST (18%)</span>
                  <span>₹{pricing.tax.toLocaleString()}</span>
                </div>
                <div className="cb-pp-row">
                  <span>Security Deposit</span>
                  <span>₹{pricing.deposit.toLocaleString()}</span>
                </div>
                <div className="cb-pp-row cb-pp-total">
                  <span>Total Amount</span>
                  <span>₹{pricing.total.toLocaleString()}</span>
                </div>
              </div>
              <p className="cb-pp-note">🔒 Security deposit is refundable upon safe return</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;
