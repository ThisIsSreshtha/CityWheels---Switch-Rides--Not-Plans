import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './NearbyVehiclesMap.css';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

/* ---------- tiny inner map component ---------- */
function MapView({ center, zoom, vehicles, onMarkerClick, selectedVehicle, userLocation }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const infoWindowRef = useRef(null);

  /* initialise map once */
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: mapStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        scrollwheel: true,
        gestureHandling: 'greedy',
        draggable: true,
        draggableCursor: 'grab',
        draggingCursor: 'grabbing',
        keyboardShortcuts: false,
      });
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* re‑centre when center changes */
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.panTo(center);
    }
  }, [center]);

  /* user location blue dot */
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    if (userMarkerRef.current) userMarkerRef.current.setMap(null);

    userMarkerRef.current = new window.google.maps.Marker({
      position: userLocation,
      map: mapInstanceRef.current,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="64" viewBox="0 0 48 64">
            <defs>
              <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
              </filter>
              <radialGradient id="pinGrad" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stop-color="#FF4D4D"/>
                <stop offset="100%" stop-color="#CC0000"/>
              </radialGradient>
            </defs>
            <ellipse cx="24" cy="60" rx="8" ry="3" fill="rgba(0,0,0,0.25)"/>
            <path d="M24 2 C12.954 2 4 10.954 4 22 C4 36 24 58 24 58 C24 58 44 36 44 22 C44 10.954 35.046 2 24 2Z" fill="url(#pinGrad)" stroke="#fff" stroke-width="2.5" filter="url(#shadow)"/>
            <circle cx="24" cy="21" r="8" fill="#fff"/>
            <circle cx="24" cy="18" r="3.5" fill="#CC0000"/>
            <path d="M17.5 25.5 Q17.5 21 24 21 Q30.5 21 30.5 25.5" fill="#CC0000"/>
          </svg>`
        )}`,
        scaledSize: new window.google.maps.Size(48, 64),
        anchor: new window.google.maps.Point(24, 58),
      },
      title: 'Your Location',
      zIndex: 999,
    });

    /* pulsing circle around user location */
    if (window._userCircle) window._userCircle.setMap(null);
    window._userCircle = new window.google.maps.Circle({
      center: userLocation,
      radius: 80,
      map: mapInstanceRef.current,
      fillColor: '#FF0000',
      fillOpacity: 0.12,
      strokeColor: '#FF0000',
      strokeOpacity: 0.35,
      strokeWeight: 1.5,
      zIndex: 998,
    });
  }, [userLocation]);

  /* vehicle markers */
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // clear previous
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    vehicles.forEach((v) => {
      const coords = v.location?.pickupPoint?.coordinates;
      if (!coords || coords.length < 2) return;

      const position = { lat: coords[1], lng: coords[0] };
      const icon = vehicleTypeIcon(v.type);

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: v.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="#1e293b" stroke="#fff" stroke-width="2"/>
              <text x="18" y="24" text-anchor="middle" font-size="16">${icon}</text>
            </svg>`
          )}`,
          scaledSize: new window.google.maps.Size(36, 36),
        },
        animation: window.google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        onMarkerClick(v);
        const content = `
          <div style="padding:8px;max-width:220px;font-family:system-ui,sans-serif">
            <strong style="font-size:14px;color:#1e293b">${v.name}</strong>
            <p style="margin:4px 0;font-size:12px;color:#64748b">${v.brand} ${v.model}</p>
            <p style="margin:2px 0;font-size:12px;color:#64748b">📍 ${v.location?.area || v.location?.city}</p>
            <p style="margin:4px 0;font-size:13px;font-weight:600;color:#2563eb">₹${v.pricing?.daily}/day</p>
          </div>`;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    /* fit bounds if vehicles exist */
    if (vehicles.length && markersRef.current.length) {
      const bounds = new window.google.maps.LatLngBounds();
      if (userLocation) bounds.extend(userLocation);
      markersRef.current.forEach((m) => bounds.extend(m.getPosition()));
      mapInstanceRef.current.fitBounds(bounds, 60);
    }
  }, [vehicles, userLocation, onMarkerClick]);

  /* highlight selected */
  useEffect(() => {
    markersRef.current.forEach((m) => {
      const isSelected = selectedVehicle && m.getTitle() === selectedVehicle.name;
      m.setAnimation(isSelected ? window.google.maps.Animation.BOUNCE : null);
    });
  }, [selectedVehicle]);

  return <div ref={mapRef} className="google-map" />;
}

/* ========== main exported component ========== */
const NearbyVehiclesMap = ({ city, place }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [nearbyVehicles, setNearbyVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [radius, setRadius] = useState(10000); // metres
  const [mapVisible, setMapVisible] = useState(false);
  const [locationSource, setLocationSource] = useState(''); // 'gps' or 'city'
  const geocodeTimerRef = useRef(null);

  /* get user location */
  const getUserLocation = useCallback(() => {
    setLoading(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setSearchLocation(null);
        setLocationSource('gps');
        setMapVisible(true);
        fetchNearby(loc.lng, loc.lat, radius);
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? 'Location access denied. Please enable location permissions.'
            : 'Unable to retrieve your location. Please try again.'
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [radius]); // eslint-disable-line react-hooks/exhaustive-deps

  /* fetch nearby vehicles from backend */
  const fetchNearby = async (lng, lat, rad) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/vehicles/nearby/${lng}/${lat}?radius=${rad}`);
      setNearbyVehicles(res.data.data || []);
    } catch (err) {
      console.error('Error fetching nearby vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  /* refresh when radius changes */
  useEffect(() => {
    const loc = searchLocation || userLocation;
    if (loc) {
      fetchNearby(loc.lng, loc.lat, radius);
    }
  }, [radius]); // eslint-disable-line react-hooks/exhaustive-deps

  /* geocode city/place from filter and auto-show map */
  useEffect(() => {
    const query = [place, city].filter(Boolean).join(', ').trim();
    if (!query || query.length < 2) return;

    // debounce – wait 800ms after user stops typing
    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    geocodeTimerRef.current = setTimeout(() => {
      geocodeCity(query);
    }, 800);

    return () => clearTimeout(geocodeTimerRef.current);
  }, [city, place]); // eslint-disable-line react-hooks/exhaustive-deps

  const geocodeCity = async (query) => {
    try {
      setLoading(true);
      setLocationError('');

      // Use Google Geocoding API via fetch
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`
      );
      const data = await res.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const loc = { lat, lng };
        setSearchLocation(loc);
        setLocationSource('city');
        setMapVisible(true);
        fetchNearby(lng, lat, radius);
      } else {
        // Don't show error for partial typing
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = useCallback((vehicle) => {
    setSelectedVehicle(vehicle);
  }, []);

  const getVehicleIcon = (type) => {
    const icons = { car: '🚗', motorcycle: '🏍️', bicycle: '🚲', scooter: '🛵', scooty: '🛵' };
    return icons[type] || '🚗';
  };

  return (
    <div className="nearby-map-section">
      <div className="nearby-header">
        <div className="nearby-title-row">
          <h2>🗺️ Find Vehicles Near You</h2>
          {!mapVisible && !city && (
            <button className="locate-btn" onClick={getUserLocation} disabled={loading}>
              {loading ? (
                <span className="locate-spinner">⏳</span>
              ) : (
                <>
                  <span className="locate-icon">📍</span>
                  Use My Live Location
                </>
              )}
            </button>
          )}
        </div>
        <p className="nearby-subtitle">
          {city
            ? `Showing map for "${[place, city].filter(Boolean).join(', ')}" — type a city or place in the filters above`
            : 'Search by typing a city name above, or use your live location'
          }
        </p>
      </div>

      {locationError && (
        <div className="location-error">
          <span>⚠️</span> {locationError}
        </div>
      )}

      {mapVisible && (
        <>
          {/* controls bar */}
          <div className="map-controls">
            <div className="radius-control">
              <label htmlFor="radius-select">Search Radius:</label>
              <select
                id="radius-select"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="radius-select"
              >
                <option value={2000}>2 km</option>
                <option value={5000}>5 km</option>
                <option value={10000}>10 km</option>
                <option value={20000}>20 km</option>
                <option value={50000}>50 km</option>
              </select>
            </div>

            <button className="refresh-btn" onClick={getUserLocation} disabled={loading}>
              {loading ? '⏳ Refreshing…' : '🔄 Refresh Location'}
            </button>

            <span className="vehicles-found-badge">
              {nearbyVehicles.length} vehicle{nearbyVehicles.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {/* Google Map */}
          <div className="map-wrapper">
            <Wrapper apiKey={GOOGLE_MAPS_API_KEY}>
              <MapView
                center={searchLocation || userLocation || { lat: 20.5937, lng: 78.9629 }}
                zoom={13}
                vehicles={nearbyVehicles}
                onMarkerClick={handleMarkerClick}
                selectedVehicle={selectedVehicle}
                userLocation={locationSource === 'gps' ? userLocation : searchLocation}
              />
            </Wrapper>
          </div>

          {/* nearby vehicles list below map */}
          {nearbyVehicles.length > 0 && (
            <div className="nearby-list">
              <h3>Nearby Vehicles</h3>
              <div className="nearby-cards">
                {nearbyVehicles.map((v) => (
                  <div
                    key={v._id}
                    className={`nearby-card ${selectedVehicle?._id === v._id ? 'active' : ''}`}
                    onClick={() => setSelectedVehicle(v)}
                  >
                    <span className="nearby-card-icon">{getVehicleIcon(v.type)}</span>
                    <div className="nearby-card-info">
                      <strong>{v.name}</strong>
                      <span className="nearby-card-meta">
                        {v.brand} {v.model} &middot; ₹{v.pricing?.daily}/day
                      </span>
                      <span className="nearby-card-location">
                        📍 {v.location?.area || v.location?.city}, {v.location?.state}
                      </span>
                    </div>
                    <Link to={`/vehicles/${v._id}`} className="nearby-book-btn">
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && nearbyVehicles.length === 0 && (
            <div className="no-nearby">
              <span className="no-nearby-icon">🔍</span>
              <p>No vehicles found within {radius / 1000} km. Try increasing the search radius.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ---------- map styles (subtle dark) ---------- */
const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#333333' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#444444' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e8fc' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a90d9' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#c8e6c9' }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#333333' }] },
];

function vehicleTypeIcon(type) {
  const map = { car: '🚗', motorcycle: '🏍️', bicycle: '🚲', scooter: '🛵', scooty: '🛵' };
  return map[type] || '🚗';
}

export default NearbyVehiclesMap;
