import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

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

  const logout = useCallback(() => {
    saveAuth(null, null);
  }, [saveAuth]);

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

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, verifyOtp, resendOtp, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
