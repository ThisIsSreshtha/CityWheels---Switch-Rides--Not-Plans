import React, { useContext, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const OwnerRoute = ({ children }) => {
  const { isAuthenticated, isOwner, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Validate token on mount and navigation
    const token = localStorage.getItem('token');
    if (!token && !loading) {
      // No token, set session expired and redirect
      localStorage.setItem('sessionExpired', 'true');
      navigate('/login', { replace: true });
    }
  }, [navigate, loading]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    localStorage.setItem('sessionExpired', 'true');
    return <Navigate to="/login" replace />;
  }

  return isOwner ? children : <Navigate to="/user/dashboard" replace />;
};

export default OwnerRoute;
