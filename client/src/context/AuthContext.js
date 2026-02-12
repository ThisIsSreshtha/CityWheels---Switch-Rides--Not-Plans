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

  // Add axios interceptor to handle 401 errors globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token is invalid or expired
          localStorage.setItem('sessionExpired', 'true');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];

          // Redirect to login if not already there
          if (!window.location.pathname.includes('/login')) {
            window.location.replace('/login');
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

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

  // Validate token on navigation/page load - AGGRESSIVE CHECK
  useEffect(() => {
    const validateToken = () => {
      const storedToken = localStorage.getItem('token');
      const isProtectedRoute = window.location.pathname.includes('/dashboard') ||
        window.location.pathname.includes('/admin') ||
        window.location.pathname.includes('/owner') ||
        window.location.pathname.includes('/user');

      if (!storedToken && isProtectedRoute) {
        // No token on protected route - immediate redirect
        localStorage.setItem('sessionExpired', 'true');
        setUser(null);
        setToken(null);
        window.location.replace('/login');
      } else if (!storedToken && user) {
        // Token was removed but user state still exists
        setUser(null);
        setToken(null);
      }
    };

    // Check on mount and when page becomes visible
    validateToken();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        validateToken();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading user:', error);

      // Check if token expired
      if (error.response?.data?.tokenExpired) {
        localStorage.setItem('sessionExpired', 'true');
      }

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

  const logout = async () => {
    try {
      // Call backend to increment tokenVersion
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }

    // CRITICAL: Set logout flag FIRST
    localStorage.setItem('loggedOut', 'true');
    localStorage.setItem('sessionExpired', 'true');

    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];

    // NUCLEAR OPTION: Clear ALL browser history and cache
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }

    // Replace current URL to login immediately
    window.history.replaceState(null, '', '/login');

    // Force hard reload to login (clears all state)
    window.location.href = '/login';

    // Block any further execution
    throw new Error('Logging out');
  };

  // Listen for browser navigation (back/forward buttons) - BLOCKS BOTH <- and ->
  useEffect(() => {
    const handlePopState = (event) => {
      // Check logout flag FIRST
      const loggedOut = localStorage.getItem('loggedOut');
      if (loggedOut === 'true') {
        event.preventDefault();
        event.stopPropagation();
        localStorage.removeItem('loggedOut');
        window.location.replace('/login');
        return false;
      }

      const storedToken = localStorage.getItem('token');
      const isProtectedRoute = window.location.pathname.includes('/dashboard') ||
        window.location.pathname.includes('/admin') ||
        window.location.pathname.includes('/owner') ||
        window.location.pathname.includes('/user/');

      if (!storedToken && isProtectedRoute) {
        // User tried to navigate to protected route without token (back OR forward)
        event.preventDefault();
        event.stopPropagation();
        localStorage.setItem('sessionExpired', 'true');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        // Force immediate redirect
        window.stop(); // Stop current page load
        window.location.replace('/login');
        return false;
      }
    };

    // Check immediately on mount
    const initialCheck = () => {
      const loggedOut = localStorage.getItem('loggedOut');
      if (loggedOut === 'true') {
        localStorage.removeItem('loggedOut');
        window.location.replace('/login');
        return;
      }

      const storedToken = localStorage.getItem('token');
      const isProtectedRoute = window.location.pathname.includes('/dashboard') ||
        window.location.pathname.includes('/admin') ||
        window.location.pathname.includes('/owner') ||
        window.location.pathname.includes('/user/');

      if (!storedToken && isProtectedRoute) {
        localStorage.setItem('sessionExpired', 'true');
        window.stop();
        window.location.replace('/login');
      }
    };

    initialCheck();

    // Add event listeners with capture phase (happens before bubbling)
    window.addEventListener('popstate', handlePopState, true);

    // Also listen to pageshow event for bfcache (back-forward cache)
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        // Page was loaded from bfcache (forward/back)
        initialCheck();
      }
    }, true);

    // ULTRA AGGRESSIVE: Check every 50ms  
    const blockInterval = setInterval(() => {
      const loggedOut = localStorage.getItem('loggedOut');
      if (loggedOut === 'true') {
        clearInterval(blockInterval);
        window.location.replace('/login');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token && window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        const isProtected = window.location.pathname.includes('/dashboard') ||
          window.location.pathname.includes('/admin') ||
          window.location.pathname.includes('/owner') ||
          window.location.pathname.includes('/user/');

        if (isProtected) {
          clearInterval(blockInterval);
          localStorage.setItem('sessionExpired', 'true');
          window.stop();
          window.location.replace('/login');
        }
      }
    }, 50); // Check every 50ms (was 100ms)

    return () => {
      window.removeEventListener('popstate', handlePopState, true);
      window.removeEventListener('pageshow', initialCheck, true);
      clearInterval(blockInterval);
    };
  }, []);

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
