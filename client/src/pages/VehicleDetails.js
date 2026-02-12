import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { animate, stagger, createTimeline } from 'animejs';
import { AuthContext } from '../context/AuthContext';
import './VehicleDetails.css';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const pageRef = useRef(null);

  useEffect(() => {
    fetchVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ---- anime.js entrance animation ---- */
  useEffect(() => {
    if (loading || !vehicle || !pageRef.current) return;
    const tl = createTimeline({ defaults: { ease: 'outQuart' } });
    const container = pageRef.current;

    tl.add(container.querySelector('.vd-gallery'), {
      opacity: [0, 1],
      translateX: [-40, 0],
      duration: 700,
    })
    .add(container.querySelector('.vd-info'), {
      opacity: [0, 1],
      translateX: [40, 0],
      duration: 700,
    }, '-=500')
    .add(container.querySelectorAll('.vd-price-card'), {
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.9, 1],
      duration: 500,
      delay: stagger(80),
    }, '-=400')
    .add(container.querySelector('.vd-book-btn'), {
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 500,
    }, '-=300');

    // Animate specs (bottom section) on scroll
    const specs = container.querySelectorAll('.vd-spec');
    if (specs.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animate(specs, {
                opacity: [0, 1],
                translateY: [25, 0],
                scale: [0.92, 1],
                duration: 500,
                delay: stagger(60),
                ease: 'outQuart',
              });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      const bottomGrid = container.querySelector('.vd-bottom-grid');
      if (bottomGrid) observer.observe(bottomGrid);
      return () => observer.disconnect();
    }
  }, [loading, vehicle]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/vehicles/${id}`);
      setVehicle(res.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Error loading vehicle details');
      setLoading(false);
    }
  };

  const getVehicleIcon = (type) => {
    const icons = {
      car: '🚗',
      motorcycle: '🏍️',
      bicycle: '🚲',
      scooter: '🛵',
      scooty: '🛵',
    };
    return icons[type] || '🚗';
  };

  const handleBookNow = () => {
    if (!user) {
      toast.info('Please login to book a vehicle');
      navigate('/login');
      return;
    }
    navigate(`/user/book/${id}`);
  };

  if (loading) {
    return (
      <div className="vd-page">
        <div className="vd-loading">
          <div className="vd-loading-spinner"></div>
          <p>Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="vd-page">
        <div className="vd-not-found">
          <span className="vd-not-found-icon">🚫</span>
          <h2>Vehicle Not Found</h2>
          <p>The vehicle you're looking for doesn't exist or has been removed.</p>
          <Link to="/vehicles" className="vd-back-btn">← Browse Vehicles</Link>
        </div>
      </div>
    );
  }

  const hasImages = vehicle.images && vehicle.images.length > 0;
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  return (
    <div className="vd-page" ref={pageRef}>
      <div className="vd-container">
        {/* Breadcrumb */}
        <nav className="vd-breadcrumb">
          <Link to="/">Home</Link>
          <span className="vd-breadcrumb-sep">/</span>
          <Link to="/vehicles">Vehicles</Link>
          <span className="vd-breadcrumb-sep">/</span>
          <span className="vd-breadcrumb-current">{vehicle.name}</span>
        </nav>

        {/* Main Content Grid */}
        <div className="vd-main-grid">
          {/* Left: Image Gallery */}
          <div className="vd-gallery">
            <div className="vd-gallery-main">
              {hasImages ? (
                <img
                  src={`${baseUrl}${vehicle.images[activeImage]}`}
                  alt={vehicle.name}
                  className="vd-gallery-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="vd-gallery-placeholder"
                style={hasImages ? { display: 'none' } : {}}
              >
                <span className="vd-placeholder-emoji">{getVehicleIcon(vehicle.type)}</span>
                <span className="vd-placeholder-text">{vehicle.name}</span>
              </div>

              {/* Availability Badge */}
              <div className={`vd-availability vd-availability--${vehicle.availability}`}>
                <span className="vd-availability-dot"></span>
                {vehicle.availability === 'available' ? 'Available' : vehicle.availability}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {hasImages && vehicle.images.length > 1 && (
              <div className="vd-thumbnails">
                {vehicle.images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`vd-thumb ${idx === activeImage ? 'vd-thumb--active' : ''}`}
                    onClick={() => setActiveImage(idx)}
                  >
                    <img src={`${baseUrl}${img}`} alt={`${vehicle.name} ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Vehicle Info */}
          <div className="vd-info">
            <div className="vd-info-header">
              <div>
                <h1 className="vd-title">{vehicle.name}</h1>
                <p className="vd-subtitle">
                  {vehicle.brand} {vehicle.model}
                </p>
              </div>
              <div className="vd-badges">
                <span className="vd-badge vd-badge--type">{vehicle.type}</span>
                <span className="vd-badge vd-badge--category">{vehicle.category}</span>
              </div>
            </div>

            {/* Rating */}
            {vehicle.rating && vehicle.rating.count > 0 && (
              <div className="vd-rating">
                <span className="vd-rating-stars">
                  {'★'.repeat(Math.round(vehicle.rating.average))}
                  {'☆'.repeat(5 - Math.round(vehicle.rating.average))}
                </span>
                <span className="vd-rating-text">
                  {vehicle.rating.average.toFixed(1)} ({vehicle.rating.count} reviews)
                </span>
              </div>
            )}

            {/* Location */}
            {vehicle.location && (
              <div className="vd-location">
                <span className="vd-location-icon">📍</span>
                <span>
                  {vehicle.location.area && `${vehicle.location.area}, `}
                  {vehicle.location.city}, {vehicle.location.state}
                </span>
              </div>
            )}

            {/* Pricing Cards */}
            <div className="vd-pricing">
              <h3 className="vd-section-title">Pricing</h3>
              <div className="vd-pricing-grid">
                <div className="vd-price-card">
                  <span className="vd-price-icon">⏱️</span>
                  <span className="vd-price-label">Hourly</span>
                  <span className="vd-price-value">₹{vehicle.pricing?.hourly || 0}</span>
                </div>
                <div className="vd-price-card vd-price-card--featured">
                  <span className="vd-price-icon">📅</span>
                  <span className="vd-price-label">Daily</span>
                  <span className="vd-price-value">₹{vehicle.pricing?.daily || 0}</span>
                  <span className="vd-price-badge">Popular</span>
                </div>
                <div className="vd-price-card">
                  <span className="vd-price-icon">📆</span>
                  <span className="vd-price-label">Weekly</span>
                  <span className="vd-price-value">₹{vehicle.pricing?.weekly || 0}</span>
                </div>
              </div>
              {vehicle.pricing?.securityDeposit > 0 && (
                <p className="vd-deposit">
                  🔒 Security Deposit: <strong>₹{vehicle.pricing.securityDeposit}</strong>
                </p>
              )}
            </div>

            {/* Book Now */}
            <button
              className="vd-book-btn"
              onClick={handleBookNow}
              disabled={vehicle.availability !== 'available'}
            >
              {vehicle.availability === 'available' ? (
                <>Book Now <span className="vd-book-arrow">→</span></>
              ) : (
                'Currently Unavailable'
              )}
            </button>
          </div>
        </div>

        {/* Bottom Section: Specs + Features */}
        <div className="vd-bottom-grid">
          {/* Specifications */}
          {vehicle.specifications && (
            <div className="vd-specs-card">
              <h3 className="vd-section-title">Specifications</h3>
              <div className="vd-specs-grid">
                {vehicle.specifications.seatingCapacity && (
                  <div className="vd-spec">
                    <span className="vd-spec-icon">👥</span>
                    <span className="vd-spec-label">Seating</span>
                    <span className="vd-spec-value">{vehicle.specifications.seatingCapacity} seats</span>
                  </div>
                )}
                {vehicle.specifications.fuelType && (
                  <div className="vd-spec">
                    <span className="vd-spec-icon">⛽</span>
                    <span className="vd-spec-label">Fuel Type</span>
                    <span className="vd-spec-value">{vehicle.specifications.fuelType}</span>
                  </div>
                )}
                {vehicle.specifications.mileage && (
                  <div className="vd-spec">
                    <span className="vd-spec-icon">📊</span>
                    <span className="vd-spec-label">Mileage</span>
                    <span className="vd-spec-value">{vehicle.specifications.mileage}</span>
                  </div>
                )}
                {vehicle.specifications.engineCapacity && (
                  <div className="vd-spec">
                    <span className="vd-spec-icon">🔧</span>
                    <span className="vd-spec-label">Engine</span>
                    <span className="vd-spec-value">{vehicle.specifications.engineCapacity}</span>
                  </div>
                )}
                {vehicle.specifications.color && (
                  <div className="vd-spec">
                    <span className="vd-spec-icon">🎨</span>
                    <span className="vd-spec-label">Color</span>
                    <span className="vd-spec-value">{vehicle.specifications.color}</span>
                  </div>
                )}
                {vehicle.specifications.year && (
                  <div className="vd-spec">
                    <span className="vd-spec-icon">📅</span>
                    <span className="vd-spec-label">Year</span>
                    <span className="vd-spec-value">{vehicle.specifications.year}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="vd-features-card">
              <h3 className="vd-section-title">Features</h3>
              <div className="vd-features-list">
                {vehicle.features.map((feature, idx) => (
                  <span key={idx} className="vd-feature-tag">
                    ✓ {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back to Vehicles */}
        <div className="vd-footer-nav">
          <Link to="/vehicles" className="vd-back-link">
            ← Back to All Vehicles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
