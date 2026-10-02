/* AuthContext.jsx: Global auth state for SIH26097 PM-AJAY */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authMe } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('pmajay_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  /* Verify token on mount */
  useEffect(() => {
    const token = localStorage.getItem('pmajay_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authMe()
      .then((res) => {
        const freshUser = res.data.user;
        setUser(freshUser);
        localStorage.setItem('pmajay_user', JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem('pmajay_token');
        localStorage.removeItem('pmajay_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((token, userData) => {
    localStorage.setItem('pmajay_token', token);
    localStorage.setItem('pmajay_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pmajay_token');
    localStorage.removeItem('pmajay_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
