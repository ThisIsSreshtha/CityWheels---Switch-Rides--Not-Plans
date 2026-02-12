import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger, createTimeline } from 'animejs';
import ThreeHero from '../components/ThreeHero';
import useAnimeOnScroll from '../hooks/useAnimeOnScroll';
import './Home.css';

const Home = () => {
  const heroContentRef = useRef(null);
  const statsRef = useRef(null);

  /* ---- Hero entrance animation (anime.js) ---- */
  useEffect(() => {
    if (!heroContentRef.current) return;

    const tl = createTimeline({ defaults: { ease: 'outExpo' } });

    tl.add(heroContentRef.current.querySelector('h1'), {
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 900,
    })
    .add(heroContentRef.current.querySelector('.hero-subtitle'), {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
    }, '-=600')
    .add(heroContentRef.current.querySelectorAll('.hero-buttons .btn'), {
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.9, 1],
      duration: 600,
      delay: stagger(120),
    }, '-=500');
  }, []);

  /* ---- Scroll-triggered section animations ---- */
  useAnimeOnScroll('.feature-card', { translateY: [40, 0], scale: [0.95, 1], duration: 650 }, { staggerDelay: 100 });
  useAnimeOnScroll('.vehicle-type-card', { translateY: [50, 0], scale: [0.9, 1], duration: 700 }, { staggerDelay: 120 });
  useAnimeOnScroll('.step', { translateY: [40, 0], duration: 600 }, { staggerDelay: 100 });
  useAnimeOnScroll('.section-title', { translateY: [30, 0], duration: 800 }, { staggerDelay: 0 });

  /* ---- Animated counter for stats ---- */
  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat-number');
            counters.forEach((el) => {
              const target = parseInt(el.dataset.target, 10);
              const obj = { val: 0 };
              animate(obj, {
                val: target,
                duration: 2000,
                ease: 'outExpo',
                onUpdate: () => {
                  el.textContent = Math.round(obj.val).toLocaleString() + (el.dataset.suffix || '');
                },
              });
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home">
      <section className="hero">
        {/* Three.js 3D Background */}
        <ThreeHero />
        {/* Animated Background Elements */}
        <div className="animated-road">
          <div className="road-surface"></div>
          <div className="road-line"></div>
          <div className="road-edge road-edge-top"></div>
          <div className="road-edge road-edge-bottom"></div>
        </div>
        
        {/* Traffic Signals */}
        <div className="traffic-signal signal-1">
          <div className="signal-light red"></div>
          <div className="signal-light yellow"></div>
          <div className="signal-light green active"></div>
        </div>
        <div className="traffic-signal signal-2">
          <div className="signal-light red"></div>
          <div className="signal-light yellow"></div>
          <div className="signal-light green active"></div>
        </div>
        
        {/* Location Markers */}
        <div className="location-marker pickup-location">
          <div className="marker-pin"></div>
          <div className="marker-label">📍 Pickup Point</div>
          <div className="marker-time">🕐 10:00 AM</div>
        </div>
        <div className="location-marker dropoff-location">
          <div className="marker-pin"></div>
          <div className="marker-label">📍 Drop-off Point</div>
          <div className="marker-time">🕐 10:45 AM</div>
        </div>
        
        {/* Fare Display */}
        <div className="fare-display">
          <div className="fare-icon">💵</div>
          <div className="fare-amount">₹250</div>
          <div className="fare-label">Total Fare</div>
        </div>
        
        {/* Car Animation */}
        <div className="vehicle-container">
          <div className="rider-in-car">
            <span className="car">🚗</span>
            <span className="passenger-in-car">🧑‍💼</span>
          </div>
        </div>
        
        {/* Passenger waiting at pickup */}
        <div className="waiting-passenger">🧑‍💼</div>
        
        {/* Verified Badge at Pickup */}
        <div className="verified-badge-pickup">
          <span className="verified-icon">✅</span>
        </div>
        
        {/* Passenger at drop-off */}
        <div className="dropped-passenger">🧑‍💼</div>
        
        {/* Thought Cloud with Satisfaction */}
        <div className="thought-cloud-container">
          <div className="thought-cloud large">
            <span className="satisfaction-emoji">😊</span>
          </div>
          <div className="thought-cloud small"></div>
          <div className="thought-cloud tiny"></div>
        </div>
        
        <div className="dust-trail"></div>
        
        {/* Clouds */}
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="cloud cloud3"></div>
        
        <div className="container">
          <div className="hero-content" ref={heroContentRef}>
            <h1 style={{ opacity: 0 }}>Switch Rides, Not Plans</h1>
            <p className="hero-subtitle" style={{ opacity: 0 }}>
              Rent scooters, motorcycles, bicycles, and cars across India. 
              Flexible hourly, daily, or weekly rentals with transparent pricing.
            </p>
            <div className="hero-buttons">
              <Link to="/vehicles" className="btn btn-primary btn-large" style={{ opacity: 0 }}>
                Browse Vehicles
              </Link>
              <Link to="/register" className="btn btn-secondary btn-large" style={{ opacity: 0 }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose CityWheels?</h2>
          <div className="grid grid-4">
            <div className="feature-card">
              <div className="feature-icon">🚴</div>
              <h3>Wide Selection</h3>
              <p>Choose from scooters, motorcycles, bicycles, and cars - both electric and non-electric</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Flexible Pricing</h3>
              <p>Rent by the hour, day, or week. Location-based pricing ensures you get the best rates</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Easy Navigation</h3>
              <p>Professional maps and navigation to help you reach your destination</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Verified & Safe</h3>
              <p>Document verification and safety checks ensure a secure rental experience</p>
            </div>
          </div>
        </div>
      </section>

      <section className="vehicle-types">
        <div className="container">
          <h2 className="section-title">Vehicle Types</h2>
          <div className="grid grid-3">
            <div className="vehicle-type-card">
              <div className="vehicle-icon scooter-icon">🛵</div>
              <h3>Scooters & Scooty</h3>
              <p>Perfect for city commutes and short trips</p>
              <div className="button-wrapper">
                <Link to="/vehicles?type=scooter" className="btn btn-primary">
                  View Scooters
                </Link>
              </div>
            </div>
            <div className="vehicle-type-card">
              <div className="vehicle-icon motorcycle-icon">🏍️</div>
              <h3>Motorcycles</h3>
              <p>For longer journeys and adventure rides</p>
              <div className="button-wrapper">
                <Link to="/vehicles?type=motorcycle" className="btn btn-primary">
                  View Motorcycles
                </Link>
              </div>
            </div>
            <div className="vehicle-type-card">
              <div className="vehicle-icon car-icon">🚗</div>
              <h3>Cars</h3>
              <p>Comfortable rides for family and groups</p>
              <div className="button-wrapper">
                <Link to="/vehicles?type=car" className="btn btn-primary">
                  View Cars
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Register & Verify</h3>
              <p>Create an account and upload your documents (Aadhar & Driving License)</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Browse & Select</h3>
              <p>Choose your preferred vehicle based on location and requirements</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Book & Pay</h3>
              <p>Select rental period, pay securely, and confirm your booking</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Ride & Return</h3>
              <p>Pick up your vehicle, enjoy your ride, and return to the same location</p>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Counter Section */}
      <section className="stats-section" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number" data-target="5000" data-suffix="+">0</span>
              <span className="stat-label">Happy Riders</span>
            </div>
            <div className="stat-card">
              <span className="stat-number" data-target="200" data-suffix="+">0</span>
              <span className="stat-label">Vehicles Available</span>
            </div>
            <div className="stat-card">
              <span className="stat-number" data-target="50" data-suffix="+">0</span>
              <span className="stat-label">Cities Covered</span>
            </div>
            <div className="stat-card">
              <span className="stat-number" data-target="99" data-suffix="%">0</span>
              <span className="stat-label">Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 CityWheels. All rights reserved.</p>
          <p>Switch Rides, Not Plans</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
