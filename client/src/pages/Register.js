import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { createTimeline, stagger, animate } from 'animejs';
import ThreeBackground from '../components/ThreeBackground';
import './RegisterSuccess.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);

    if (result.success) {
      // Show animated success message
      setShowSuccess(true);

      // Navigate after animation
      setTimeout(() => {
        setShowSuccess(false);
        if (formData.role === 'admin') {
          navigate('/admin/home');
        } else if (formData.role === 'owner') {
          navigate('/owner/dashboard');
        } else {
          navigate('/user/profile');
        }
      }, 3000);
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
      .add(cardRef.current.querySelectorAll('.register-input-group'), {
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 500,
        delay: stagger(40),
      }, '-=400');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100 py-8">
      {/* Three.js Background */}
      <ThreeBackground />

      {/* Success Animation Overlay - Professional Design */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-blue-900/95 backdrop-blur-md">
          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>

          {/* Main Success Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-10 max-w-2xl mx-4 text-center">
            {/* Gradient Glow Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-xl opacity-30 animate-pulse-slow"></div>

            {/* Content Container */}
            <div className="relative z-10">
              {/* Success Check Circle */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl transform animate-checkPop">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-checkmark" />
                    </svg>
                  </div>
                  {/* Radiating Circles */}
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-400/50 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-300/30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>

              {/* Success Message */}
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 animate-fade-in-up">
                Registration Successful!
              </h2>
              <p className="text-gray-600 text-lg mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Welcome to the CityWheels family 🎉
              </p>

              {/* Large Visible Scooter Animation */}
              <div className="relative h-36 mb-6 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl overflow-hidden shadow-inner">
                {/* Animated Road */}
                <div className="absolute bottom-4 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300">
                  <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" style={{
                    backgroundSize: '200% 100%'
                  }}></div>
                </div>

                {/* Road Dashes */}
                <div className="absolute bottom-5 left-0 right-0 h-0.5 animate-roadScroll" style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, #9ca3af 0px, #9ca3af 20px, transparent 20px, transparent 40px)'
                }}></div>

                {/* Large Scooter SVG */}
                <div className="scooter-container absolute bottom-3">
                  <svg viewBox="0 0 140 60" width="200" height="100" className="drop-shadow-2xl">
                    {/* Back Wheel */}
                    <g className="wheel-back">
                      <circle cx="25" cy="48" r="11" fill="none" stroke="#f59e0b" strokeWidth="3" />
                      <circle cx="25" cy="48" r="6" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.7" />
                      <circle cx="25" cy="48" r="3" fill="#fbbf24" />
                      <line x1="25" y1="37" x2="25" y2="59" stroke="#f59e0b" strokeWidth="1.5" />
                      <line x1="14" y1="48" x2="36" y2="48" stroke="#f59e0b" strokeWidth="1.5" />
                    </g>

                    {/* Front Wheel */}
                    <g className="wheel-front">
                      <circle cx="110" cy="48" r="11" fill="none" stroke="#f59e0b" strokeWidth="3" />
                      <circle cx="110" cy="48" r="6" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.7" />
                      <circle cx="110" cy="48" r="3" fill="#fbbf24" />
                      <line x1="110" y1="37" x2="110" y2="59" stroke="#f59e0b" strokeWidth="1.5" />
                      <line x1="99" y1="48" x2="121" y2="48" stroke="#f59e0b" strokeWidth="1.5" />
                    </g>

                    {/* Scooter Body */}
                    <path d="M35 45 L35 38 L90 38 L90 45" fill="#4f46e5" stroke="#3730a3" strokeWidth="2" strokeLinejoin="round" />
                    <rect x="35" y="35" width="55" height="4" rx="2" fill="#6366f1" />

                    {/* Front Fork */}
                    <path d="M90 38 L95 30 L98 22 Q100 16 104 14" fill="#4f46e5" stroke="#3730a3" strokeWidth="2" />

                    {/* Handlebar */}
                    <path d="M104 14 L106 8" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                    <path d="M98 7 L114 7" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="98" cy="7" r="2" fill="#ef4444" />
                    <circle cx="114" cy="7" r="2" fill="#22c55e" />

                    {/* Headlight with Glow */}
                    <ellipse cx="102" cy="22" rx="4" ry="5" fill="#fef08a" stroke="#fbbf24" strokeWidth="1.5" />
                    <ellipse cx="102" cy="22" rx="2.5" ry="3" fill="#fde68a" opacity="0.8" />
                    <path d="M102 22 L120 22" stroke="#fef08a" strokeWidth="2" opacity="0.3" />

                    {/* Rear Section */}
                    <path d="M35 38 L32 32 L34 24 Q38 20 44 20" fill="#4f46e5" stroke="#3730a3" strokeWidth="2" />

                    {/* Rider - Larger and More Visible */}
                    <ellipse cx="60" cy="10" rx="7" ry="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                    <circle cx="58" cy="9" r="1.5" fill="#000" />
                    <circle cx="62" cy="9" r="1.5" fill="#000" />
                    <path d="M58 12 Q60 13 62 12" fill="none" stroke="#000" strokeWidth="1" strokeLinecap="round" />

                    {/* Rider Body */}
                    <path d="M60 18 L60 28" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
                    <path d="M60 21 Q75 20 100 10" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M60 28 L60 35 Q58 38 54 39" stroke="#1e40af" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M54 39 L50 40" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />

                    {/* Helmet */}
                    <ellipse cx="60" cy="8" rx="8" ry="6" fill="none" stroke="#ef4444" strokeWidth="2" />
                  </svg>

                  {/* Enhanced Smoke Trail */}
                  <div className="absolute -left-8 bottom-10 flex gap-1">
                    <div className="w-3 h-3 bg-blue-400/60 rounded-full animate-smokePuff"></div>
                    <div className="w-2.5 h-2.5 bg-purple-400/50 rounded-full animate-smokePuff" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2 h-2 bg-indigo-400/40 rounded-full animate-smokePuff" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center gap-3 text-indigo-600 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="font-medium">Redirecting to your dashboard...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Card - Compact Layout */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-2xl mx-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8"
        style={{ opacity: 0 }}
      >
        {/* Logo/Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
            <span className="text-2xl">🚲</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-1">
          Join CityWheels
        </h2>
        <p className="text-center text-gray-600 mb-6 text-xs sm:text-sm">
          Start your journey with us
        </p>

        {/* Form - Compact Grid Layout */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Two Column Layout for Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name Field */}
            <div className="register-input-group">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  👤
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:bg-white transition-all outline-none text-sm text-gray-800"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="register-input-group">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  📧
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:bg-white transition-all outline-none text-sm text-gray-800"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="register-input-group">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  📱
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="[6-9][0-9]{9}"
                  placeholder="10-digit mobile"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:bg-white transition-all outline-none text-sm text-gray-800"
                />
              </div>
            </div>

            {/* Role Field */}
            <div className="register-input-group">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Register As
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10">
                  🎯
                </span>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:bg-white transition-all outline-none text-sm text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="user">🏍️ Rider</option>
                  <option value="owner">🚗 Owner</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Password Field */}
            <div className="register-input-group">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:bg-white transition-all outline-none text-sm text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="register-input-group">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  🔐
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:bg-white transition-all outline-none text-sm text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all mt-2"
          >
            Create Account
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 mt-4 text-xs sm:text-sm">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
          >
            Login here
          </Link>
        </p>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl -z-10"></div>
      </div>
    </div>
  );
};

export default Register;
