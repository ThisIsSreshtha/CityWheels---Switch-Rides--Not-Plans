import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { animate } from 'animejs';
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
        sy: -(0.003 + Math.random() * 0.004),
        rx: (Math.random() - 0.5) * 0.008,
        ry: (Math.random() - 0.5) * 0.006,
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
        m.position.y += m.userData.sy * 0.15;
        m.position.x += Math.sin(t * 0.3 + m.position.y) * 0.003;
        if (m.position.y < -16) m.position.y = 16;
        if (m.position.x > 24) m.position.x = -24;
        if (m.position.x < -24) m.position.x = 24;
      });
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(fid);
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
  return `upi://pay?pa=citywheels@upi&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Booking ${bookingId}`)}`;
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */
const BookingConfirmation = () => {
  const { id: bookingId } = useParams();
  const location = useLocation();
  const pageRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [vehicle, setVehicle] = useState(location.state?.vehicle || null);
  const [loading, setLoading] = useState(!booking);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [countdown, setCountdown] = useState(900);
  const [isPolling, setIsPolling] = useState(false);

  /* ---- Fetch booking if not passed via state ---- */
  useEffect(() => {
    if (booking) {
      setLoading(false);
      setPaymentStatus(booking.payment?.status || 'pending');
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await axios.get(`/api/bookings/${bookingId}`);
        setBooking(res.data.data);
        setPaymentStatus(res.data.data.payment?.status || 'pending');

        if (res.data.data.vehicle) {
          const vRes = await axios.get(`/api/vehicles/${res.data.data.vehicle}`);
          setVehicle(vRes.data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Failed to load booking details');
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, booking]);

  /* ---- QR countdown timer ---- */
  useEffect(() => {
    if (paymentStatus === 'paid' || countdown <= 0) return;
    const interval = setInterval(() => setCountdown((c) => Math.max(c - 1, 0)), 1000);
    return () => clearInterval(interval);
  }, [paymentStatus, countdown]);

  /* ---- Cleanup polling on unmount ---- */
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  /* ---- Page load animations ---- */
  useEffect(() => {
    if (loading || !booking || !pageRef.current) return;

    // Sequential animations without timeline
    animate({
      targets: '.bkc-header',
      opacity: [0, 1],
      translateY: [-30, 0],
      duration: 700,
      easing: 'easeOutQuart',
    });

    setTimeout(() => {
      animate({
        targets: '.bkc-qr-section',
        opacity: [0, 1],
        scale: [0.85, 1],
        duration: 800,
        easing: 'easeOutQuart',
      });
    }, 300);

    setTimeout(() => {
      animate({
        targets: '.bkc-detail-card',
        opacity: [0, 1],
        translateY: [25, 0],
        duration: 600,
        delay: function (el, i) { return i * 100; },
        easing: 'easeOutQuart',
      });
    }, 500);

    setTimeout(() => {
      animate({
        targets: '.bkc-actions',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: 'easeOutQuart',
      });
    }, 800);

    // Pulse QR code
    const qrEl = pageRef.current.querySelector('.bkc-qr-glow');
    if (qrEl) {
      animate({
        targets: qrEl,
        boxShadow: [
          '0 0 20px rgba(230,126,34,0.15)',
          '0 0 40px rgba(230,126,34,0.30)',
          '0 0 20px rgba(230,126,34,0.15)',
        ],
        duration: 2500,
        loop: true,
        easing: 'easeInOutSine',
      });
    }
  }, [loading, booking]);

  /* ---- Handle UPI payment deep links ---- */
  const handleUPIPayment = (app) => {
    const amount = booking.pricing?.totalAmount || 0;
    const bid = booking.bookingId || booking._id;

    const deepLinks = {
      gpay: `tez://upi/pay?pa=citywheels@upi&pn=CityWheels&am=${amount}&cu=INR&tn=Booking%20${bid}`,
      phonepe: `phonepe://pay?pa=citywheels@upi&pn=CityWheels&am=${amount}&cu=INR&tn=Booking%20${bid}`,
      paytm: `paytmmp://pay?pa=citywheels@upi&pn=CityWheels&am=${amount}&cu=INR&tn=Booking%20${bid}`,
      bhim: generateUPIString(booking)
    };

    // Animate button
    const buttons = document.querySelectorAll('.upi-app-btn');
    buttons.forEach(btn => {
      if (btn.dataset.app === app) {
        animate({
          targets: btn,
          scale: [1, 1.15, 1],
          duration: 400,
          easing: 'easeOutQuad'
        });
      }
    });

    // Try to open UPI app
    window.location.href = deepLinks[app];

    // Start polling after short delay
    setTimeout(() => {
      startPaymentPolling();
    }, 1000);

    toast.success(`Opening ${app.toUpperCase()}...`);
  };

  /* ---- Payment polling ---- */
  const startPaymentPolling = useCallback(() => {
    if (pollIntervalRef.current) return;

    setIsPolling(true);
    toast.info('🔄 Waiting for payment confirmation...', { autoClose: 3000 });

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`/api/bookings/${bookingId}`);
        if (res.data.data.payment?.status === 'paid') {
          setPaymentStatus('paid');
          setShowPaymentSuccess(true);
          setIsPolling(false);
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          toast.success('✅ Payment confirmed!');

          // Success animation
          setTimeout(() => {
            const checkEl = document.querySelector('.bkc-check-icon');
            if (checkEl) {
              animate({
                targets: checkEl,
                rotate: [0, 360],
                scale: [0, 1],
                duration: 900,
                easing: 'easeOutExpo'
              });
            }
            const cards = document.querySelectorAll('.bkc-detail-card');
            if (cards.length) {
              animate({
                targets: cards,
                scale: [1, 1.02, 1],
                duration: 500,
                delay: function (el, i) { return i * 80; },
                easing: 'easeOutQuad',
              });
            }
          }, 100);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);

    // Stop polling after 15 minutes
    setTimeout(() => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setIsPolling(false);
        toast.warning('Payment polling stopped. Please refresh if payment was completed.');
      }
    }, 900000);
  }, [bookingId]);

  /* ---- Simulate payment (for demo/testing) ---- */
  const simulatePayment = useCallback(() => {
    if (paymentStatus === 'paid') return;
    setPaymentStatus('processing');

    setTimeout(() => {
      setPaymentStatus('paid');
      setShowPaymentSuccess(true);

      setTimeout(() => {
        const checkEl = document.querySelector('.bkc-check-icon');
        if (checkEl) {
          animate({
            targets: checkEl,
            rotate: [0, 360],
            scale: [0, 1],
            duration: 900,
            easing: 'easeOutExpo'
          });
        }
        const cards = document.querySelectorAll('.bkc-detail-card');
        if (cards.length) {
          animate({
            targets: cards,
            scale: [1, 1.02, 1],
            duration: 500,
            delay: anime.stagger(80),
            easing: 'easeOutQuad',
          });
        }
      }, 100);
    }, 2000);
  }, [paymentStatus]);

  /* ---- Helpers ---- */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPeriodLabel = (p) => {
    if (p === 'hourly') return 'Hour(s)';
    if (p === 'daily') return 'Day(s)';
    return 'Week(s)';
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
        <ThreeConfirmBg />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 text-lg">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
        <ThreeConfirmBg />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center bg-white rounded-2xl shadow-2xl p-8 max-w-md">
            <span className="text-6xl block mb-4">🔍</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find this booking. It may have been cancelled.</p>
            <Link to="/user/bookings" className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
              ← My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const hasImage = vehicle?.images && vehicle.images.length > 0;
  const upiString = generateUPIString(booking);
  const isExpired = countdown <= 0 && paymentStatus !== 'paid';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 relative overflow-hidden" ref={pageRef}>
      <ThreeConfirmBg />

      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="bkc-header mb-6" style={{ opacity: 0 }}>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-4">
            <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/user/bookings" className="hover:text-orange-600 transition-colors">My Bookings</Link>
            <span>/</span>
            <span className="text-orange-600 font-semibold">Payment</span>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">🎉 Booking Confirmed!</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              Complete your payment to secure your ride. Booking ID: <span className="font-mono font-bold text-orange-600">{booking.bookingId || booking._id}</span>
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left: Payment Section */}
          <div className="bkc-qr-section" style={{ opacity: 0 }}>
            {paymentStatus !== 'paid' ? (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📱</span> Scan & Pay
                </h3>

                {/* QR Code */}
                <div className="relative mb-6">
                  <div className="bkc-qr-glow bg-gradient-to-br from-orange-100 to-amber-100 p-6 rounded-2xl flex justify-center items-center mx-auto" style={{ maxWidth: '240px' }}>
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                      <QRCodeSVG value={upiString} size={180} level="H" />
                    </div>
                  </div>
                  {isExpired && (
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
                      <span className="text-5xl mb-2">⏰</span>
                      <p className="text-white font-semibold mb-3">QR Code Expired</p>
                      <button onClick={() => setCountdown(900)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-all">
                        Refresh QR
                      </button>
                    </div>
                  )}
                </div>

                {/* Amount & Timer */}
                <div className="text-center mb-6">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Amount to Pay</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600">₹{booking.pricing?.totalAmount?.toLocaleString()}</p>
                  {!isExpired && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      ⏱️ Expires in <strong>{formatTime(countdown)}</strong>
                    </p>
                  )}
                </div>

                {/* Polling Indicator */}
                {isPolling && (
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs sm:text-sm text-blue-700 font-medium">Waiting for payment confirmation...</span>
                  </div>
                )}

                {/* UPI Apps */}
                <div className="mb-6">
                  <p className="text-xs sm:text-sm text-gray-600 text-center mb-3">Pay with your favorite UPI app</p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => handleUPIPayment('gpay')}
                      data-app="gpay"
                      className="upi-app-btn flex flex-col items-center justify-center p-3 sm:p-4 bg-white border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                      <div className="text-3xl sm:text-4xl mb-2">💳</div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Google Pay</span>
                    </button>
                    <button
                      onClick={() => handleUPIPayment('phonepe')}
                      data-app="phonepe"
                      className="upi-app-btn flex flex-col items-center justify-center p-3 sm:p-4 bg-white border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                      <div className="text-3xl sm:text-4xl mb-2">📱</div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">PhonePe</span>
                    </button>
                    <button
                      onClick={() => handleUPIPayment('paytm')}
                      data-app="paytm"
                      className="upi-app-btn flex flex-col items-center justify-center p-3 sm:p-4 bg-white border-2 border-gray-200 hover:border-blue-600 hover:shadow-lg rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                      <div className="text-3xl sm:text-4xl mb-2">💰</div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Paytm</span>
                    </button>
                    <button
                      onClick={() => handleUPIPayment('bhim')}
                      data-app="bhim"
                      className="upi-app-btn flex flex-col items-center justify-center p-3 sm:p-4 bg-white border-2 border-gray-200 hover:border-orange-500 hover:shadow-lg rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                      <div className="text-3xl sm:text-4xl mb-2">🏦</div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">BHIM UPI</span>
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-xs text-gray-500">or</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* Demo Button */}
                <button
                  onClick={simulatePayment}
                  disabled={paymentStatus === 'processing'}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {paymentStatus === 'processing' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing...
                    </span>
                  ) : (
                    <span>💳 Simulate Payment</span>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">* Demo mode — click to simulate successful payment</p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
                <div className="bkc-check-icon text-6xl sm:text-7xl mb-4">✅</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                <p className="text-xl sm:text-2xl font-bold text-green-600 mb-6">₹{booking.pricing?.totalAmount?.toLocaleString()} paid</p>
                <div className="bg-white rounded-xl p-4 space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-mono font-semibold">TXN{Date.now().toString().slice(-10)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-semibold">UPI</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className="font-semibold text-green-600">Paid ✓</span>
                  </div>
                </div>
                <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 flex items-center justify-center gap-2">
                  <span>🧾</span>
                  <span className="text-sm text-green-800">Receipt has been sent to your email</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Details */}
          <div className="space-y-4 sm:space-y-6">
            {/* Vehicle Card */}
            <div className="bkc-detail-card bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6" style={{ opacity: 0 }}>
              <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>🚗</span> Vehicle
              </h4>
              <div className="flex gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {hasImage ? (
                    <img
                      src={`${baseUrl}${vehicle.images[0]}`}
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div className={`w-full h-full items-center justify-center text-4xl ${hasImage ? 'hidden' : 'flex'}`}>
                    🚗
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="text-sm sm:text-base font-bold text-gray-800">{vehicle?.name || 'Vehicle'} ({vehicle?.location || 'N/A'})</h5>
                  <p className="text-xs sm:text-sm text-gray-600">{vehicle?.model || 'Model not specified'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {vehicle?.type || 'car'} • {vehicle?.isElectric ? 'Electric' : 'Non-Electric'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rental Details */}
            <div className="bkc-detail-card bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6" style={{ opacity: 0 }}>
              <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>📅</span> Rental Period
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{booking.duration} {getPeriodLabel(booking.rentalPeriod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-semibold">{new Date(booking.startDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Return Date</span>
                  <span className="font-semibold">{new Date(booking.returnDate).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown  */}
            <div className="bkc-detail-card bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6" style={{ opacity: 0 }}>
              <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>💰</span> Price Breakdown
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price ({booking.duration} {getPeriodLabel(booking.rentalPeriod).toLowerCase()})</span>
                  <span className="font-semibold">₹{booking.pricing?.basePrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-semibold">₹{booking.pricing?.taxes?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="font-semibold">₹{booking.pricing?.securityDeposit?.toLocaleString()}</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-2 mt-2"></div>
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span className="text-gray-800">Total Amount</span>
                  <span className="text-orange-600">₹{booking.pricing?.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                <span>🔒</span> Security deposit is refundable upon safe return
              </p>
            </div>

            {/* Status Card */}
            <div className="bkc-detail-card bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6" style={{ opacity: 0 }}>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Booking Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {booking.status === 'pending' ? '⏳ Pending' : booking.status === 'confirmed' ? '✅ Confirmed' : booking.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                    paymentStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                    {paymentStatus === 'paid' ? '✅ Paid' : paymentStatus === 'processing' ? '⏳ Processing' : '🔴 Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="bkc-actions mt-6 flex flex-wrap gap-3 justify-center" style={{ opacity: 0 }}>
          <Link to="/user/bookings" className="bg-white hover:bg-gray-50 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm">
            📋 My Bookings
          </Link>
          <Link to="/vehicles" className="bg-white hover:bg-gray-50 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm">
            🔍 Browse More Vehicles
          </Link>
          {paymentStatus === 'paid' && (
            <button
              onClick={() => window.print()}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm no-print"
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
