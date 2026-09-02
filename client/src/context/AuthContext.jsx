import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('writecircle_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('writecircle_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data.data);
        localStorage.setItem('writecircle_user', JSON.stringify(data.data));
      })
      .catch(() => {
        localStorage.removeItem('writecircle_token');
        localStorage.removeItem('writecircle_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('writecircle_token', data.token);
    localStorage.setItem('writecircle_user', JSON.stringify(data.data));
    setUser(data.data);
    return data.data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('writecircle_token', data.token);
    localStorage.setItem('writecircle_user', JSON.stringify(data.data));
    setUser(data.data);
    return data.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('writecircle_token');
    localStorage.removeItem('writecircle_user');
    setUser(null);
  }, []);

  const updateUserLocal = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem('writecircle_user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserLocal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
