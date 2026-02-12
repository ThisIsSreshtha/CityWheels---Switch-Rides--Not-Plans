import React, { useContext, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const OwnerRoute = ({ children }) => {
  const { isAuthenticated, isOwner, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // CRITICAL: Synchronous token check
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Validate token on mount and navigation
    const currentToken = localStorage.getItem('token');
    if (!currentToken && !loading) {
      // No token, set session expired and redirect
      localStorage.setItem('sessionExpired', 'true');
      navigate('/login', { replace: true });
    }
  }, [navigate, loading]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  // Immediate check - if no token, redirect
  if (!token) {
    localStorage.setItem('sessionExpired', 'true');
    return <Navigate to="/login" replace />;
  }

  if (!isAuthenticated) {
    localStorage.setItem('sessionExpired', 'true');
    return <Navigate to="/login" replace />;
  }

  return isOwner ? children : <Navigate to="/user/dashboard" replace />;
};

export default OwnerRoute;
