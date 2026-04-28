import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import API from '../api/axios';

const AuthContext = createContext();

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
const WARN_BEFORE      =  5 * 60 * 1000; // warn 5 minutes before timeout

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const inactivityTimer = useRef(null);
  const warnTimer       = useRef(null);
  const warnToastId     = useRef(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiry');
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    clearTimeout(inactivityTimer.current);
    clearTimeout(warnTimer.current);
    if (warnToastId.current) toast.dismiss(warnToastId.current);
  }, [clearSession]);

  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    clearTimeout(warnTimer.current);
    if (warnToastId.current) toast.dismiss(warnToastId.current);

    // Warn 5 min before timeout
    warnTimer.current = setTimeout(() => {
      warnToastId.current = toast('⚠️ Session expires in 5 minutes due to inactivity', {
        duration: 5 * 60 * 1000,
        icon: '⏱️',
        style: { background: '#f59e0b', color: '#fff', fontWeight: 600 },
      });
    }, INACTIVITY_LIMIT - WARN_BEFORE);

    // Auto-logout after inactivity
    inactivityTimer.current = setTimeout(() => {
      logout();
      toast.error('Session expired due to inactivity. Please log in again.');
    }, INACTIVITY_LIMIT);
  }, [logout]);

  // Start tracking activity when user is logged in
  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    const handler = () => resetInactivityTimer();

    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetInactivityTimer(); // start timer immediately on login

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      clearTimeout(inactivityTimer.current);
      clearTimeout(warnTimer.current);
    };
  }, [user, resetInactivityTimer]);

  // Listen for 401 from axios interceptor → auto-logout
  useEffect(() => {
    const handler = () => {
      clearSession();
      toast.error('Your session has expired. Please log in again.');
    };
    window.addEventListener('session:expired', handler);
    return () => window.removeEventListener('session:expired', handler);
  }, [clearSession]);

  // Check token expiry on tab focus (handles browser sleep / long idle)
  useEffect(() => {
    const handler = () => {
      const expiry = localStorage.getItem('sessionExpiry');
      if (expiry && Date.now() > Number(expiry)) {
        clearSession();
        toast.error('Your session has expired. Please log in again.');
      }
    };
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, [clearSession]);

  const login = useCallback(async (name, password, role) => {
    const { data } = await API.post('/login', { name, password, role });
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // matches JWT 7d
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('sessionExpiry', String(expiry));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, phone, password) => {
    await API.post('/register', { name, phone, password, role: 'user' });
    return await login(name, password, 'user');
  }, [login]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
