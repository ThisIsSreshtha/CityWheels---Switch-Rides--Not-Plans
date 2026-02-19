import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { createTimeline, stagger } from 'animejs';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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

  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const tl = createTimeline({ defaults: { ease: 'outExpo' } });
    tl.add(cardRef.current, {
      opacity: [0, 1],
      translateY: [40, 0],
      scale: [0.95, 1],
      duration: 800,
    })
    .add(cardRef.current.querySelectorAll('.form-group'), {
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 500,
      delay: stagger(60),
    }, '-=400');
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card" ref={cardRef} style={{ opacity: 0 }}>
        <h2>Login to CityWheels</h2>
        <p className="auth-subtitle">Switch Rides, Not Plans</p>

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
