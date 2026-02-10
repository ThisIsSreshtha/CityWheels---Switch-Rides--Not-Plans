import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showSessionMessage, setShowSessionMessage] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Check for session expired message on mount
  useEffect(() => {
    const sessionExpired = localStorage.getItem('sessionExpired');
    if (sessionExpired === 'true') {
      setShowSessionMessage(true);
      localStorage.removeItem('sessionExpired');

      // Auto-hide message after 6 seconds
      const timer = setTimeout(() => {
        setShowSessionMessage(false);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const userName = result.data.data.user.name || 'User';
      toast.success(
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🔓</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>Welcome back, {userName}!</div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>You have been logged in successfully.</div>
          </div>
        </div>,
        {
          icon: false,
          style: {
            background: 'linear-gradient(135deg, #b45309, #f59e0b)',
            color: '#fff',
            borderRadius: '12px',
            padding: '14px 18px',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
            border: '1px solid rgba(253, 230, 138, 0.3)',
          },
          progressStyle: { background: '#fde68a' },
        }
      );
      if (result.data.data.user.role === 'admin') {
        navigate('/admin/home');
      } else if (result.data.data.user.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to CityWheels</h2>
        <p className="auth-subtitle">Switch Rides, Not Plans</p>

        {showSessionMessage && (
          <div
            style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              border: '1px solid #fcd34d',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'slideDown 0.3s ease-out'
            }}
          >
            <span style={{ fontSize: '20px' }}>🔒</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#92400e', fontSize: '14px' }}>
                Session Expired
              </div>
              <div style={{ color: '#78350f', fontSize: '12px', marginTop: '2px' }}>
                Please log in again to continue
              </div>
            </div>
            <button
              onClick={() => setShowSessionMessage(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#92400e',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0 5px'
              }}
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
