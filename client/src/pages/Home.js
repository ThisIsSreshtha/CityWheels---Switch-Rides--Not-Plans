import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Switch Rides, Not Plans</h1>
            <p className="hero-subtitle">
              Rent scooters, motorcycles, bicycles, and cars across India. 
              Flexible hourly, daily, or weekly rentals with transparent pricing.
            </p>
            <div className="hero-buttons">
              <Link to="/vehicles" className="btn btn-primary btn-large">
                Browse Vehicles
              </Link>
              <Link to="/register" className="btn btn-secondary btn-large">
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
              <h3>🛵 Scooters & Scooty</h3>
              <p>Perfect for city commutes and short trips</p>
              <Link to="/vehicles?type=scooter" className="btn btn-primary">
                View Scooters
              </Link>
            </div>
            <div className="vehicle-type-card">
              <h3>🏍️ Motorcycles</h3>
              <p>For longer journeys and adventure rides</p>
              <Link to="/vehicles?type=motorcycle" className="btn btn-primary">
                View Motorcycles
              </Link>
            </div>
            <div className="vehicle-type-card">
              <h3>🚗 Cars</h3>
              <p>Comfortable rides for family and groups</p>
              <Link to="/vehicles?type=car" className="btn btn-primary">
                View Cars
              </Link>
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
