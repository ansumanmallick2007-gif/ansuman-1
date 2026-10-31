import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('synapse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('synapse_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token and verify user session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('synapse_token');
      if (storedToken) {
        try {
          const res = await api.get('/users/me');
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('synapse_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Session verification failed:', err.message);
          localStorage.removeItem('synapse_token');
          localStorage.removeItem('synapse_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('synapse_token', receivedToken);
      localStorage.setItem('synapse_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
    throw new Error(res.data.error || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('synapse_token', receivedToken);
      localStorage.setItem('synapse_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
    throw new Error(res.data.error || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('synapse_token');
    localStorage.removeItem('synapse_user');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const quickDemoLogin = async (roleName) => {
    const demoAccounts = {
      admin: { email: 'admin@synapse.ai', password: 'Synapse2026!' },
      finance: { email: 'finance.lead@synapse.ai', password: 'Synapse2026!' },
      engineering: { email: 'eng.lead@synapse.ai', password: 'Synapse2026!' },
      employee: { email: 'employee@synapse.ai', password: 'Synapse2026!' }
    };

    const target = demoAccounts[roleName] || demoAccounts.admin;
    return await login(target.email, target.password);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    role: user?.role || 'guest',
    department: user?.department || 'general',
    login,
    register,
    logout,
    quickDemoLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

