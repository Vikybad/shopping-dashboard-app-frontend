import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('authUser')); } catch { return null; }
  });
  const [loading, setLoading] = useState(Boolean(token) && !user);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const login = useCallback((nextToken, nextUser) => {
    localStorage.setItem('authToken', nextToken);
    if (nextUser) localStorage.setItem('authUser', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser || null);
    setLoading(!nextUser);
  }, []);

  useEffect(() => {
    const handleExpiry = () => logout();
    window.addEventListener('shopboard:session-expired', handleExpiry);
    return () => window.removeEventListener('shopboard:session-expired', handleExpiry);
  }, [logout]);

  useEffect(() => {
    if (!token || user) return;
    let active = true;
    api.get('/users/me')
      .then(({ data }) => {
        if (!active) return;
        setUser(data.data);
        localStorage.setItem('authUser', JSON.stringify(data.data));
      })
      .catch(() => active && logout())
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [logout, token, user]);

  const value = useMemo(() => ({ authenticated: Boolean(token), loading, login, logout, token, user }), [loading, login, logout, token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider, AuthContext };
