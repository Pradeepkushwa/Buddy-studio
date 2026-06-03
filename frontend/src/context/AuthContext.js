import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';

const AuthContext = createContext(null);

// Decode JWT payload without verifying signature (client-side only)
function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // convert to ms
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const exp = getTokenExpiry(token);
  if (!exp) return true;
  return Date.now() >= exp;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    // If token is already expired on load, clear everything
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('token');
    return t && !isTokenExpired(t) ? t : null;
  });

  const [loading, setLoading] = useState(false);
  const autoLogoutTimer = useRef(null);

  const saveAuth = useCallback((tokenVal, userVal) => {
    setToken(tokenVal);
    setUser(userVal);
    if (tokenVal) {
      localStorage.setItem('token', tokenVal);
      localStorage.setItem('user', JSON.stringify(userVal));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  const logout = useCallback(async () => {
    if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
    try {
      await api.delete('/auth/logout');
    } catch {
      // Ignore errors — clear local state regardless
    }
    saveAuth(null, null);
  }, [saveAuth]);

  // Auto-logout timer — fires exactly when token expires
  useEffect(() => {
    if (!token) return;
    const exp = getTokenExpiry(token);
    if (!exp) return;

    const msUntilExpiry = exp - Date.now();
    if (msUntilExpiry <= 0) {
      logout();
      return;
    }

    autoLogoutTimer.current = setTimeout(() => {
      logout();
    }, msUntilExpiry);

    return () => {
      if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
    };
  }, [token, logout]);

  useEffect(() => {
    if (token && !user) {
      setLoading(true);
      api.get('/auth/me')
        .then((res) => saveAuth(token, res.data.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    }
  }, [token, user, saveAuth, logout]);

  const signup = async (data) => {
    const res = await api.post('/auth/signup', data);
    return res.data;
  };

  const verifyOtp = async (email, otpCode) => {
    const res = await api.post('/auth/verify_otp', { email, otp_code: otpCode });
    if (res.data.token) saveAuth(res.data.token, res.data.user);
    return res.data;
  };

  const resendOtp = async (email) => {
    const res = await api.post('/auth/resend_otp', { email });
    return res.data;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) saveAuth(res.data.token, res.data.user);
    return res.data;
  };

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, verifyOtp, resendOtp, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
