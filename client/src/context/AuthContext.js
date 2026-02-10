import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set axios default headers
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Listen for storage events (logout in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed in another tab
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Validate token on navigation/page load
  useEffect(() => {
    const validateToken = () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken && user) {
        // Token was removed but user state still exists
        setUser(null);
        setToken(null);
      }
    };

    // Check on mount and when page becomes visible
    validateToken();
    document.addEventListener('visibilitychange', validateToken);

    return () => document.removeEventListener('visibilitychange', validateToken);
  }, [user]);

  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading user:', error);
      logout();
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.data.token);
      setToken(res.data.data.token);
      setUser(res.data.data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.data.token}`;
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      localStorage.setItem('token', res.data.data.token);
      setToken(res.data.data.token);
      setUser(res.data.data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.data.token}`;
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Set session expired flag for login message
    localStorage.setItem('sessionExpired', 'true');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];

    // Force full page reload to login to prevent back button access
    window.location.replace('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isOwner: user?.role === 'owner'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
