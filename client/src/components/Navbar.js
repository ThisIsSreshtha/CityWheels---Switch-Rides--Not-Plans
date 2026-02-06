import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            <div className="logo-container">
              <div className="logo-badge">
                <div className="badge-circle">
                  <div className="spinning-wheel">⚙</div>
                  <div className="cycle-icon">🚲</div>
                </div>
              </div>
              <div className="brand-text">
                <div className="brand-name">
                  <span className="city-part">CITY</span>
                  <span className="wheels-part">WHEELS</span>
                </div>
                <div className="brand-tagline">⚡ Switch Rides, Not Plans</div>
              </div>
            </div>
          </Link>

          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/vehicles">Vehicles</Link></li>

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <>
                    <li><Link to="/admin/dashboard">Dashboard</Link></li>
                    <li><Link to="/admin/users">Users</Link></li>
                    <li><Link to="/admin/vehicles">Manage Vehicles</Link></li>
                    <li><Link to="/admin/bookings">Bookings</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/user/dashboard">Dashboard</Link></li>
                    <li><Link to="/user/bookings">My Bookings</Link></li>
                    <li><Link to="/user/profile">Profile</Link></li>
                  </>
                )}
                <li>
                  <span className="user-info">Hello, {user?.name}</span>
                </li>
                <li>
                  <button onClick={handleLogout} className="btn btn-danger">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li>
                  <Link to="/register" className="btn btn-primary">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
