import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import api, { refreshSession, setAccessToken } from '../api/client';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setAuthenticated(false);
    setUser(null);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/users/logout', null, { skipAuthRefresh: true });
    } catch {
      // Local logout must still complete if the network is unavailable.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const login = useCallback((nextToken, nextUser) => {
    setAccessToken(nextToken);
    setAuthenticated(Boolean(nextToken));
    setUser(nextUser || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    refreshSession()
      .then(({ accessToken, user: nextUser }) => {
        if (active) login(accessToken, nextUser);
      })
      .catch(() => {
        if (active) clearSession();
      });
    return () => { active = false; };
  }, [clearSession, login]);

  useEffect(() => {
    const handleExpiry = () => clearSession();
    window.addEventListener('shopboard:session-expired', handleExpiry);
    return () => window.removeEventListener('shopboard:session-expired', handleExpiry);
  }, [clearSession]);

  const value = useMemo(
    () => ({ authenticated, clearSession, loading, login, logout, user }),
    [authenticated, clearSession, loading, login, logout, user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider, AuthContext };
