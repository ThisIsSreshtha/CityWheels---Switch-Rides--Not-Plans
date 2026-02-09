import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, isAdmin, isOwner, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
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

          {/* Animated Scooty riding from logo to Dashboard */}
          <div className="scooty-track">
            <div className="scooty-road-line"></div>
            <div className="scooty-rider">
              <svg viewBox="0 0 120 52" width="72" height="34" className="scooty-svg">
                {/* Back wheel */}
                <circle cx="22" cy="42" r="9" fill="none" stroke="#fbbf24" strokeWidth="2.5"/>
                <circle cx="22" cy="42" r="4" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.5"/>
                <circle cx="22" cy="42" r="2" fill="#fbbf24"/>
                {/* Front wheel */}
                <circle cx="96" cy="42" r="9" fill="none" stroke="#fbbf24" strokeWidth="2.5"/>
                <circle cx="96" cy="42" r="4" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.5"/>
                <circle cx="96" cy="42" r="2" fill="#fbbf24"/>

                {/* Mudguard - back */}
                <path d="M13 38 Q22 28 31 38" fill="none" stroke="#e85d2a" strokeWidth="2" strokeLinecap="round"/>
                {/* Mudguard - front */}
                <path d="M87 38 Q96 28 105 38" fill="none" stroke="#e85d2a" strokeWidth="2" strokeLinecap="round"/>

                {/* Scooter body - the wide flat footboard + curved body */}
                <path d="M30 40 L30 34 L78 34 L78 40" fill="#ff6b35" stroke="#e85d2a" strokeWidth="1.5" strokeLinejoin="round"/>
                {/* Flat footboard top surface */}
                <rect x="30" y="32" width="48" height="3" rx="1.5" fill="#ff8c57"/>

                {/* Rear body curve going up to seat */}
                <path d="M30 34 L28 28 L30 22 Q34 18 40 18" fill="#ff6b35" stroke="#e85d2a" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
                {/* Seat */}
                <path d="M38 18 L60 18" stroke="#4a2810" strokeWidth="5" strokeLinecap="round"/>
                {/* Seat cushion highlight */}
                <path d="M40 17 L58 17" stroke="#6b3a1f" strokeWidth="2" strokeLinecap="round"/>

                {/* Front body - leg shield curving up to handlebar column */}
                <path d="M78 34 L82 28 L84 20 Q86 14 90 12" fill="#ff6b35" stroke="#e85d2a" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
                {/* Front fairing / apron */}
                <path d="M82 28 L84 22" stroke="#ff8c57" strokeWidth="3" strokeLinecap="round"/>

                {/* Handlebar stem */}
                <path d="M90 12 L92 6" stroke="#c0c0c0" strokeWidth="2.5" strokeLinecap="round"/>
                {/* Handlebars */}
                <path d="M84 5 L100 5" stroke="#ddd" strokeWidth="2.5" strokeLinecap="round"/>
                {/* Mirror left */}
                <ellipse cx="84" cy="3" rx="3" ry="2" fill="#87ceeb" stroke="#999" strokeWidth="0.8"/>
                {/* Mirror right */}
                <ellipse cx="100" cy="3" rx="3" ry="2" fill="#87ceeb" stroke="#999" strokeWidth="0.8"/>

                {/* Headlight */}
                <ellipse cx="88" cy="18" rx="3.5" ry="4" fill="#fef08a" stroke="#fbbf24" strokeWidth="1" className="scooty-headlight"/>
                {/* Headlight beam glow */}
                <ellipse cx="88" cy="18" rx="2" ry="2.5" fill="#fff9c4" opacity="0.7"/>

                {/* Tail light */}
                <rect x="24" y="26" width="5" height="3" rx="1.5" fill="#ef4444"/>
                {/* Indicator light */}
                <circle cx="26" cy="26" r="1.2" fill="#fbbf24" opacity="0.8"/>

                {/* Exhaust pipe */}
                <path d="M26 40 L18 44 L12 44" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="11" cy="44" r="2" fill="none" stroke="#888" strokeWidth="1.5"/>

                {/* Stand */}
                <path d="M34 40 L32 46" stroke="#999" strokeWidth="1.5" strokeLinecap="round"/>

                {/* ---- Rider ---- */}
                {/* Helmet */}
                <ellipse cx="52" cy="6" rx="5" ry="5.5" fill="#fbbf24" stroke="#e5a500" strokeWidth="1"/>
                {/* Helmet visor */}
                <path d="M48 6 Q52 9 56 6" fill="#333" stroke="#222" strokeWidth="0.5"/>
                {/* Torso */}
                <path d="M52 11 L52 20" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
                {/* Jacket detail */}
                <path d="M50 14 L54 14" stroke="#dbeafe" strokeWidth="1" strokeLinecap="round"/>
                {/* Arm reaching to handlebar */}
                <path d="M52 13 Q65 12 85 6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                {/* Leg on footboard */}
                <path d="M52 20 L52 28 Q52 32 48 33" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                {/* Foot */}
                <path d="M48 33 L44 34" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {/* Exhaust smoke */}
              <div className="scooty-smoke">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>

          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/vehicles">Vehicles</Link></li>

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <>
                    <li><Link to="/admin/home">Dashboard</Link></li>
                  </>
                ) : isOwner ? (
                  <>
                    <li><Link to="/owner/dashboard">Dashboard</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/user/dashboard">Dashboard</Link></li>
                  </>
                )}
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
    </nav>
  );
};

export default Navbar;
