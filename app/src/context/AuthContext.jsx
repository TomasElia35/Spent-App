import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, setUnauthorizedHandler } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // status: 'loading' | 'authed' | 'guest'
  const [status, setStatus] = useState('loading');
  const [username, setUsername] = useState(null);
  const [expired, setExpired] = useState(false);
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (statusRef.current === 'authed') setExpired(true);
      setStatus('guest');
      setUsername(null);
    });
    let cancelled = false;
    api
      .get('/auth/me')
      .then((data) => {
        if (cancelled) return;
        if (data?.authenticated) {
          setUsername(data.username);
          setStatus('authed');
        } else {
          setStatus('guest');
        }
      })
      .catch(() => !cancelled && setStatus('guest'));
    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, []);

  const login = useCallback(async (user, password) => {
    const data = await api.post('/auth/login', { username: user, password });
    setUsername(data.username);
    setExpired(false);
    setStatus('authed');
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUsername(null);
      setStatus('guest');
    }
  }, []);

  const value = useMemo(
    () => ({ status, username, expired, login, logout }),
    [status, username, expired, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
