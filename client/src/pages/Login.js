import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { createTimeline, stagger } from 'animejs';
import ThreeBackground from '../components/ThreeBackground';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

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
      .add(cardRef.current.querySelectorAll('.login-input-group'), {
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 500,
        delay: stagger(60),
      }, '-=400');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100">
      {/* Three.js Background */}
      <ThreeBackground />

      {/* Login Card */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-md mx-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10"
        style={{ opacity: 0 }}
      >
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
            <span className="text-3xl">🚲</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 mb-8 text-sm">
          Switch Rides, Not Plans
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="login-input-group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                📧
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 focus:bg-white transition-all outline-none text-gray-800"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="login-input-group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                🔒
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 focus:bg-white transition-all outline-none text-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all mt-6"
          >
            Sign In
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-gray-600 mt-6 text-sm">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-amber-600 hover:text-amber-700 font-semibold hover:underline transition-colors"
          >
            Register here
          </Link>
        </p>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl -z-10"></div>
      </div>
    </div>
  );
};

export default Login;
