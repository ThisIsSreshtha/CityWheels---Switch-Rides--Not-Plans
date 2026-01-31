import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
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

  useEffect(() => {
    fetchVehicles();
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

  return (
    <div className="vehicles-page">
      <div className="container">
        <h1>Available Vehicles</h1>

        <div className="filters-section">
          <div className="filters">
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="scooter">Scooter</option>
              <option value="scooty">Scooty</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="bicycle">Bicycle</option>
              <option value="car">Car</option>
            </select>

            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              <option value="electric">Electric</option>
              <option value="non-electric">Non-Electric</option>
            </select>

            <input
              type="text"
              name="city"
              placeholder="City"
              value={filters.city}
              onChange={handleFilterChange}
            />

            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />

            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {loading ? (
          <p className="loading">Loading vehicles...</p>
        ) : vehicles.length === 0 ? (
          <p className="no-vehicles">No vehicles found matching your criteria.</p>
        ) : (
          <div className="grid grid-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="vehicle-card">
                <div className="vehicle-image">
                  {vehicle.images && vehicle.images[0] ? (
                    <img src={vehicle.images[0]} alt={vehicle.name} />
                  ) : (
                    <div className="placeholder-image">
                      {vehicle.type === 'car' ? '🚗' : 
                       vehicle.type === 'motorcycle' ? '🏍️' : 
                       vehicle.type === 'bicycle' ? '🚲' : '🛵'}
                    </div>
                  )}
                </div>
                <div className="vehicle-info">
                  <h3>{vehicle.name}</h3>
                  <p className="vehicle-meta">
                    {vehicle.brand} {vehicle.model} | {vehicle.category}
                  </p>
                  <p className="vehicle-location">📍 {vehicle.location.city}, {vehicle.location.state}</p>
                  
                  <div className="pricing">
                    <div>
                      <span className="price-label">Hourly:</span>
                      <span className="price">₹{vehicle.pricing.hourly}</span>
                    </div>
                    <div>
                      <span className="price-label">Daily:</span>
                      <span className="price">₹{vehicle.pricing.daily}</span>
                    </div>
                    <div>
                      <span className="price-label">Weekly:</span>
                      <span className="price">₹{vehicle.pricing.weekly}</span>
                    </div>
                  </div>

                  <div className="vehicle-actions">
                    <Link to={`/vehicles/${vehicle._id}`} className="btn btn-primary">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;
