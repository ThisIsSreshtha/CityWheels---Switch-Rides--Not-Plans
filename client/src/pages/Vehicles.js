import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { animate, stagger } from 'animejs';
import ThreeBackground from '../components/ThreeBackground';
import './Vehicles.css';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    category: '',
    city: '',
    minPrice: '',
    maxPrice: ''
  });
  const [selectedPricing, setSelectedPricing] = useState({}); // Track selected pricing per vehicle
  const buttonRefs = useRef({}); // Refs for button animations

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const res = await axios.get(`/api/vehicles?${queryParams}`);
      setVehicles(res.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching vehicles');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handlePricingSelect = (vehicleId, pricingType) => {
    setSelectedPricing(prev => ({
      ...prev,
      [vehicleId]: pricingType
    }));
  };

  const getSelectedPricing = (vehicleId) => {
    return selectedPricing[vehicleId] || 'daily';
  };

  const handleButtonHover = (vehicleId, isHovering) => {
    const btn = buttonRefs.current[vehicleId];
    if (!btn) return;

    if (isHovering) {
      animate(btn, {
        scale: [1, 1.03],
        duration: 300,
        ease: 'outQuad',
      });
    } else {
      animate(btn, {
        scale: [1.03, 1],
        duration: 250,
        ease: 'outQuad',
      });
    }
  };

  const getVehicleIcon = (type) => {
    const icons = {
      'car': '🚗',
      'motorcycle': '🏍️',
      'bicycle': '🚲',
      'scooter': '🛵',
      'scooty': '🛵'
    };
    return icons[type] || '🚗';
  };

  /* ---- anime.js staggered card entry ---- */
  const animateCards = useCallback(() => {
    requestAnimationFrame(() => {
      const cards = document.querySelectorAll('.vehicle-card');
      if (!cards.length) return;
      animate(cards, {
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.95, 1],
        duration: 550,
        ease: 'outQuart',
        delay: stagger(60, { start: 100 }),
      });
    });
  }, []);

  useEffect(() => {
    if (!loading && vehicles.length > 0) animateCards();
  }, [loading, vehicles, animateCards]);

  return (
    <div className="vehicles-page">
      <ThreeBackground />
      <div className="vehicles-container">
        <div className="page-header">
          <h1>Available Vehicles</h1>
          <p>Find the perfect ride for your journey</p>
        </div>

        <div className="filters-section">
          <div className="filter-grid">
            <select name="type" value={filters.type} onChange={handleFilterChange} className="filter-select">
              <option value="">All Types</option>
              <option value="scooter">Scooter</option>
              <option value="scooty">Scooty</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="bicycle">Bicycle</option>
              <option value="car">Car</option>
            </select>

            <select name="category" value={filters.category} onChange={handleFilterChange} className="filter-select">
              <option value="">All Categories</option>
              <option value="electric">Electric</option>
              <option value="non-electric">Non-Electric</option>
            </select>

            <input
              type="text"
              name="city"
              placeholder="Enter city"
              value={filters.city}
              onChange={handleFilterChange}
              className="filter-input"
            />

            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="filter-input"
            />

            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner">🔄</div>
            <p>Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="no-vehicles-state">
            <div className="no-vehicles-icon">🚗</div>
            <h3>No vehicles found</h3>
            <p>No vehicles found matching your criteria.</p>
            <p className="suggestion">Try adjusting your filters or browse all available vehicles</p>
          </div>
        ) : (
          <>
            <div className="results-count">
              <span>Found {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="vehicles-grid">
              {vehicles.map((vehicle) => (
                <div key={vehicle._id} className="vehicle-card">
                  <div className="vehicle-image-container">
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <img
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${vehicle.images[0]}`}
                        alt={vehicle.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="placeholder-image" style={vehicle.images && vehicle.images.length > 0 ? { display: 'none' } : {}}>
                      <span className="vehicle-emoji">{getVehicleIcon(vehicle.type)}</span>
                      <span className="vehicle-type-text">{vehicle.type}</span>
                    </div>
                    <div className="availability-badge">
                      <span className="badge-dot"></span>
                      Available
                    </div>
                  </div>

                  <div className="vehicle-content">
                    <div className="vehicle-header">
                      <h3>{vehicle.name}</h3>
                      <span className="vehicle-category">{vehicle.category}</span>
                    </div>

                    <div className="vehicle-details">
                      <p className="vehicle-brand">
                        <span className="detail-icon">🏷️</span>
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="vehicle-location">
                        <span className="detail-icon">📍</span>
                        {vehicle.location?.city || 'N/A'}, {vehicle.location?.state || 'N/A'}
                      </p>

                      {vehicle.specifications && (
                        <div className="vehicle-specs">
                          {vehicle.specifications.seatingCapacity && (
                            <span className="spec-badge">
                              👥 {vehicle.specifications.seatingCapacity} seats
                            </span>
                          )}
                          {vehicle.specifications.fuelType && (
                            <span className="spec-badge">
                              ⛽ {vehicle.specifications.fuelType}
                            </span>
                          )}
                          {vehicle.specifications.mileage && (
                            <span className="spec-badge">
                              📊 {vehicle.specifications.mileage}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pricing-section">
                      <div
                        className={`price-item ${getSelectedPricing(vehicle._id) === 'hourly' ? 'selected' : ''}`}
                        onClick={() => handlePricingSelect(vehicle._id, 'hourly')}
                      >
                        <span className="price-label">Hourly</span>
                        <span className="price-value">₹{vehicle.pricing?.hourly || 0}</span>
                      </div>
                      <div
                        className={`price-item ${getSelectedPricing(vehicle._id) === 'daily' ? 'selected' : ''}`}
                        onClick={() => handlePricingSelect(vehicle._id, 'daily')}
                      >
                        <span className="price-label">Daily</span>
                        <span className="price-value">₹{vehicle.pricing?.daily || 0}</span>
                      </div>
                      <div
                        className={`price-item ${getSelectedPricing(vehicle._id) === 'weekly' ? 'selected' : ''}`}
                        onClick={() => handlePricingSelect(vehicle._id, 'weekly')}
                      >
                        <span className="price-label">Weekly</span>
                        <span className="price-value">₹{vehicle.pricing?.weekly || 0}</span>
                      </div>
                    </div>

                    <Link
                      to={`/vehicles/${vehicle._id}`}
                      className="view-details-btn"
                      ref={(el) => buttonRefs.current[vehicle._id] = el}
                      onMouseEnter={() => handleButtonHover(vehicle._id, true)}
                      onMouseLeave={() => handleButtonHover(vehicle._id, false)}
                    >
                      View Details & Book
                      <span className="btn-arrow">→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Vehicles;
