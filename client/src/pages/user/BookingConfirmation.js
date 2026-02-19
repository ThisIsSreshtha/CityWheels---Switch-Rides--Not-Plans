import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { animate, stagger, createTimeline } from 'animejs';
import * as THREE from 'three';
import { QRCodeSVG } from 'qrcode.react';
import './BookingConfirmation.css';

/* ------------------------------------------------------------------ */
/*  Three.js Celebration Background                                    */
/* ------------------------------------------------------------------ */
const ThreeConfirmBg = () => {
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
    camera.position.set(0, 0, 26);

    /* Warm ambient + accent lights */
    scene.add(new THREE.AmbientLight(0xfff8e1, 0.7));
    const pl = new THREE.PointLight(0xffb74d, 0.6, 80);
    pl.position.set(10, 12, 20);
    scene.add(pl);
    const pl2 = new THREE.PointLight(0x81c784, 0.35, 70);
    pl2.position.set(-10, -6, 16);
    scene.add(pl2);

    /* Confetti-like celebration particles */
    const mats = [
      new THREE.MeshStandardMaterial({ color: 0xffcc80, transparent: true, opacity: 0.14, metalness: 0.3, roughness: 0.5 }),
      new THREE.MeshStandardMaterial({ color: 0x81c784, transparent: true, opacity: 0.11, metalness: 0.3, roughness: 0.5 }),
      new THREE.MeshStandardMaterial({ color: 0xce93d8, transparent: true, opacity: 0.09, metalness: 0.2, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0x90caf9, transparent: true, opacity: 0.08, metalness: 0.2, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0xef9a9a, transparent: true, opacity: 0.10, metalness: 0.2, roughness: 0.6 }),
    ];
    const geos = [
      new THREE.TorusGeometry(0.18, 0.06, 8, 20),
      new THREE.OctahedronGeometry(0.14),
      new THREE.SphereGeometry(0.10, 10, 10),
      new THREE.RingGeometry(0.10, 0.18, 18),
      new THREE.IcosahedronGeometry(0.12, 0),
      new THREE.BoxGeometry(0.14, 0.14, 0.14),
    ];

    const meshes = [];
    const count = window.innerWidth > 768 ? 22 : 12;
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(geos[i % geos.length], mats[i % mats.length].clone());
      m.position.set(
        (Math.random() - 0.5) * 44,
        (Math.random() - 0.5) * 28,
        -8 - Math.random() * 16
      );
      const s = 0.4 + Math.random() * 0.8;
      m.scale.set(s, s, s);
      m.userData = {
        sx: (Math.random() - 0.5) * 0.002,
        sy: -(0.003 + Math.random() * 0.004), // falling confetti
        rx: (Math.random() - 0.5) * 0.008,
        ry: (Math.random() - 0.5) * 0.006,
        origY: m.position.y,
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
        m.position.y += m.userData.sy * 0.15; // slow fall
        m.position.x += Math.sin(t * 0.3 + m.position.y) * 0.003; // gentle sway
        if (m.position.y < -16) m.position.y = 16;
        if (m.position.x > 24) m.position.x = -24;
        if (m.position.x < -24) m.position.x = 24;
      });
      pl.position.x = 8 + Math.sin(t * 0.25) * 5;
      pl2.position.y = -4 + Math.cos(t * 0.3) * 3;
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

  return <div ref={mountRef} className="bkc-three-bg" />;
};

/* ------------------------------------------------------------------ */
/*  Helper: generate UPI payment string for QR                         */
/* ------------------------------------------------------------------ */
const generateUPIString = (booking) => {
  const amount = booking.pricing?.totalAmount || 0;
  const bookingId = booking.bookingId || booking._id;
  const name = 'CityWheels';
  // UPI deep link format: upi://pay?pa=<VPA>&pn=<Name>&am=<Amount>&cu=INR&tn=<Note>
  return `upi://pay?pa=citywheels@upi&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Booking ${bookingId}`)}`;
};

/* ------------------------------------------------------------------ */
/*  Main BookingConfirmation Component                                 */
/* ------------------------------------------------------------------ */
const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const pageRef = useRef(null);

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [vehicle, setVehicle] = useState(location.state?.vehicle || null);
  const [loading, setLoading] = useState(!booking);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 min QR expiry

  /* ---- Fetch booking if not passed via state ---- */
  useEffect(() => {
    if (booking) { setLoading(false); return; }
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`/api/bookings/${bookingId}`);
        setBooking(res.data.data);
        if (res.data.data.vehicle) {
          if (typeof res.data.data.vehicle === 'object') {
            setVehicle(res.data.data.vehicle);
          } else {
            const vRes = await axios.get(`/api/vehicles/${res.data.data.vehicle}`);
            setVehicle(vRes.data.data);
          }
        }
        if (res.data.data.payment?.status === 'paid') {
          setPaymentStatus('paid');
        }
      } catch (err) {
        toast.error('Could not load booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, booking]);

  /* ---- Countdown timer ---- */
  useEffect(() => {
    if (paymentStatus === 'paid' || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [paymentStatus, countdown]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  /* ---- Anime.js entrance ---- */
  useEffect(() => {
    if (loading || !booking || !pageRef.current) return;
    const tl = createTimeline({ defaults: { ease: 'outQuart' } });
    tl.add(pageRef.current.querySelector('.bkc-header'), {
      opacity: [0, 1], translateY: [-30, 0], duration: 700,
    })
    .add(pageRef.current.querySelector('.bkc-qr-section'), {
      opacity: [0, 1], scale: [0.85, 1], duration: 800, ease: 'outBack(1.3)',
    }, '-=400')
    .add(pageRef.current.querySelectorAll('.bkc-detail-card'), {
      opacity: [0, 1], translateY: [25, 0], duration: 550, delay: stagger(100),
    }, '-=500')
    .add(pageRef.current.querySelector('.bkc-actions'), {
      opacity: [0, 1], translateY: [20, 0], duration: 500,
    }, '-=300');

    // Pulse the QR code continuously
    const qrEl = pageRef.current.querySelector('.bkc-qr-glow');
    if (qrEl) {
      animate(qrEl, {
        boxShadow: [
          '0 0 20px rgba(230,126,34,0.15)',
          '0 0 40px rgba(230,126,34,0.30)',
          '0 0 20px rgba(230,126,34,0.15)',
        ],
        duration: 2500,
        loop: true,
        ease: 'inOutSine',
      });
    }
  }, [loading, booking]);

  /* ---- Simulate payment (demo) ---- */
  const simulatePayment = useCallback(() => {
    if (paymentStatus === 'paid') return;
    setPaymentStatus('processing');

    // Animate processing state
    if (pageRef.current) {
      const btn = pageRef.current.querySelector('.bkc-pay-btn');
      if (btn) animate(btn, { scale: [1, 0.96, 1], duration: 300, ease: 'outQuad' });
    }

    setTimeout(() => {
      setPaymentStatus('paid');
      setShowPaymentSuccess(true);

      // Success animation
      setTimeout(() => {
        if (!pageRef.current) return;
        const successEl = pageRef.current.querySelector('.bkc-payment-success');
        if (successEl) {
          animate(successEl, { opacity: [0, 1], scale: [0.8, 1], duration: 700, ease: 'outBack(1.5)' });
          const checkEl = successEl.querySelector('.bkc-check-icon');
          if (checkEl) {
            animate(checkEl, { rotate: [0, 360], scale: [0, 1], duration: 900, ease: 'outExpo' });
          }
        }
        // Animate confetti burst on detail cards
        const cards = pageRef.current.querySelectorAll('.bkc-detail-card');
        if (cards.length) {
          animate(cards, {
            scale: [1, 1.02, 1],
            duration: 500,
            delay: stagger(80),
            ease: 'outQuad',
          });
        }
      }, 50);
    }, 2200);
  }, [paymentStatus]);

  /* ---- Render helpers ---- */
  const getPeriodLabel = (p) => {
    if (p === 'hourly') return 'Hour(s)';
    if (p === 'daily') return 'Day(s)';
    return 'Week(s)';
  };

  const getVehicleIcon = (type) => {
    const icons = { car: '🚗', motorcycle: '🏍️', bicycle: '🚲', scooter: '🛵', scooty: '🛵' };
    return icons[type] || '🚗';
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="bkc-page">
        <ThreeConfirmBg />
        <div className="bkc-loading">
          <div className="bkc-spinner"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bkc-page">
        <ThreeConfirmBg />
        <div className="bkc-not-found">
          <span className="bkc-nf-icon">🔍</span>
          <h2>Booking Not Found</h2>
          <p>We couldn't find this booking. It may have been cancelled.</p>
          <Link to="/user/bookings" className="bkc-back-btn">← My Bookings</Link>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const hasImage = vehicle?.images && vehicle.images.length > 0;
  const upiString = generateUPIString(booking);
  const isExpired = countdown <= 0 && paymentStatus !== 'paid';

  return (
    <div className="bkc-page" ref={pageRef}>
      <ThreeConfirmBg />

      <div className="bkc-container">
        {/* Breadcrumb */}
        <nav className="bkc-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/user/bookings">My Bookings</Link>
          <span>/</span>
          <span className="bkc-bc-current">Payment</span>
        </nav>

        {/* Header */}
        <div className="bkc-header" style={{ opacity: 0 }}>
          <div className="bkc-header-icon">🎉</div>
          <h1>Booking Confirmed!</h1>
          <p className="bkc-header-sub">
            Complete your payment to secure your ride.
            Booking ID: <strong>{booking.bookingId || booking._id?.slice(-8)}</strong>
          </p>
        </div>

        {/* Main Layout */}
        <div className="bkc-main-grid">
          {/* Left Column: QR Payment */}
          <div className="bkc-qr-section" style={{ opacity: 0 }}>
            {!showPaymentSuccess ? (
              <div className="bkc-qr-card">
                <h3 className="bkc-qr-title">
                  <span className="bkc-qr-title-icon">📱</span>
                  Scan & Pay
                </h3>
                <p className="bkc-qr-subtitle">Scan the QR code with any UPI app to complete payment</p>

                <div className={`bkc-qr-wrapper ${isExpired ? 'expired' : ''}`}>
                  <div className="bkc-qr-glow">
                    <div className="bkc-qr-inner">
                      <QRCodeSVG
                        value={upiString}
                        size={200}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#2c1f0e"
                        imageSettings={{
                          src: '',
                          height: 0,
                          width: 0,
                        }}
                      />
                    </div>
                  </div>
                  {isExpired && (
                    <div className="bkc-qr-expired-overlay">
                      <span>⏰</span>
                      <p>QR Code Expired</p>
                      <button
                        onClick={() => setCountdown(900)}
                        className="bkc-refresh-btn"
                      >
                        Refresh QR
                      </button>
                    </div>
                  )}
                </div>

                <div className="bkc-qr-amount">
                  <span className="bkc-qr-amount-label">Amount to Pay</span>
                  <span className="bkc-qr-amount-value">₹{booking.pricing?.totalAmount?.toLocaleString()}</span>
                </div>

                {!isExpired && (
                  <div className="bkc-qr-timer">
                    <span className="bkc-timer-icon">⏱️</span>
                    <span>Expires in <strong>{formatTime(countdown)}</strong></span>
                  </div>
                )}

                <div className="bkc-upi-apps">
                  <span className="bkc-upi-label">Pay with</span>
                  <div className="bkc-upi-icons">
                    <span className="bkc-upi-app" title="Google Pay">G Pay</span>
                    <span className="bkc-upi-app" title="PhonePe">PhonePe</span>
                    <span className="bkc-upi-app" title="Paytm">Paytm</span>
                    <span className="bkc-upi-app" title="BHIM">BHIM</span>
                  </div>
                </div>

                <div className="bkc-divider">
                  <span>or</span>
                </div>

                <button
                  className="bkc-pay-btn"
                  onClick={simulatePayment}
                  disabled={paymentStatus === 'processing'}
                >
                  {paymentStatus === 'processing' ? (
                    <><span className="bkc-btn-spinner"></span> Processing...</>
                  ) : (
                    <>💳 Simulate Payment</>
                  )}
                </button>
                <p className="bkc-demo-note">* Demo mode — click to simulate successful payment</p>
              </div>
            ) : (
              <div className="bkc-payment-success">
                <div className="bkc-check-icon">✅</div>
                <h2>Payment Successful!</h2>
                <p className="bkc-ps-amount">₹{booking.pricing?.totalAmount?.toLocaleString()} paid</p>
                <div className="bkc-ps-details">
                  <div className="bkc-ps-row">
                    <span>Transaction ID</span>
                    <span>TXN{Date.now().toString().slice(-10)}</span>
                  </div>
                  <div className="bkc-ps-row">
                    <span>Payment Method</span>
                    <span>UPI</span>
                  </div>
                  <div className="bkc-ps-row">
                    <span>Status</span>
                    <span className="bkc-ps-status-paid">Paid ✓</span>
                  </div>
                </div>
                <div className="bkc-ps-receipt">
                  <span>🧾</span>
                  <span>Receipt has been sent to your email</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Booking Details */}
          <div className="bkc-details-col">
            {/* Vehicle Card */}
            <div className="bkc-detail-card bkc-vehicle-card" style={{ opacity: 0 }}>
              <h4 className="bkc-card-title">🚗 Vehicle</h4>
              <div className="bkc-vehicle-row">
                <div className="bkc-v-image">
                  {hasImage ? (
                    <img
                      src={`${baseUrl}${vehicle.images[0]}`}
                      alt={vehicle.name}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div className="bkc-v-placeholder" style={hasImage ? { display: 'none' } : {}}>
                    <span>{getVehicleIcon(vehicle?.type)}</span>
                  </div>
                </div>
                <div className="bkc-v-info">
                  <h5>{vehicle?.name || 'Vehicle'}</h5>
                  <p>{vehicle?.brand} {vehicle?.model}</p>
                  <p className="bkc-v-type">{vehicle?.type} • {vehicle?.category}</p>
                </div>
              </div>
            </div>

            {/* Rental Details Card */}
            <div className="bkc-detail-card" style={{ opacity: 0 }}>
              <h4 className="bkc-card-title">📅 Rental Details</h4>
              <div className="bkc-info-grid">
                <div className="bkc-info-item">
                  <span className="bkc-info-label">Duration</span>
                  <span className="bkc-info-value">
                    {booking.duration} {getPeriodLabel(booking.rentalPeriod)}
                  </span>
                </div>
                <div className="bkc-info-item">
                  <span className="bkc-info-label">Start</span>
                  <span className="bkc-info-value">
                    {new Date(booking.startDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="bkc-info-item">
                  <span className="bkc-info-label">Return By</span>
                  <span className="bkc-info-value">
                    {new Date(booking.endDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="bkc-info-item">
                  <span className="bkc-info-label">Purpose</span>
                  <span className="bkc-info-value" style={{ textTransform: 'capitalize' }}>
                    {booking.travelPurpose}
                  </span>
                </div>
                {booking.pickupLocation?.address && (
                  <div className="bkc-info-item bkc-full-width">
                    <span className="bkc-info-label">Pickup</span>
                    <span className="bkc-info-value">{booking.pickupLocation.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="bkc-detail-card bkc-price-card" style={{ opacity: 0 }}>
              <h4 className="bkc-card-title">💰 Price Breakdown</h4>
              <div className="bkc-price-rows">
                <div className="bkc-price-row">
                  <span>Base Price ({booking.duration} {getPeriodLabel(booking.rentalPeriod).toLowerCase()})</span>
                  <span>₹{booking.pricing?.basePrice?.toLocaleString()}</span>
                </div>
                <div className="bkc-price-row">
                  <span>GST (18%)</span>
                  <span>₹{booking.pricing?.taxes?.toLocaleString()}</span>
                </div>
                <div className="bkc-price-row">
                  <span>Security Deposit</span>
                  <span>₹{booking.pricing?.securityDeposit?.toLocaleString()}</span>
                </div>
                <div className="bkc-price-row bkc-price-total">
                  <span>Total Amount</span>
                  <span>₹{booking.pricing?.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
              <p className="bkc-deposit-note">🔒 Security deposit is refundable upon safe return</p>
            </div>

            {/* Status Card */}
            <div className="bkc-detail-card bkc-status-card" style={{ opacity: 0 }}>
              <div className="bkc-status-row">
                <span className="bkc-status-label">Booking Status</span>
                <span className={`bkc-status-badge ${booking.status}`}>
                  {booking.status === 'pending' ? '⏳ Pending' : booking.status === 'confirmed' ? '✅ Confirmed' : booking.status}
                </span>
              </div>
              <div className="bkc-status-row">
                <span className="bkc-status-label">Payment</span>
                <span className={`bkc-status-badge ${paymentStatus}`}>
                  {paymentStatus === 'paid' ? '✅ Paid' : paymentStatus === 'processing' ? '⏳ Processing' : '🔴 Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="bkc-actions" style={{ opacity: 0 }}>
          <Link to="/user/bookings" className="bkc-action-btn secondary">
            📋 My Bookings
          </Link>
          <Link to="/vehicles" className="bkc-action-btn tertiary">
            🔍 Browse More Vehicles
          </Link>
          {paymentStatus === 'paid' && (
            <button
              className="bkc-action-btn primary"
              onClick={() => window.print()}
            >
              🖨️ Print Receipt
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
