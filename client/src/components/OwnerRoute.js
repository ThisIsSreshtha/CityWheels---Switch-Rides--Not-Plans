import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const OwnerRoute = ({ children }) => {
  const { isAuthenticated, isOwner, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return isOwner ? children : <Navigate to="/user/dashboard" />;
};

export default OwnerRoute;
