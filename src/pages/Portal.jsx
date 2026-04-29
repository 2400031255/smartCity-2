import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const USERS = [
  { name: 'srisanth',    password: 'SASI@1234', role: 'admin' },
  { name: 'Admin User',  password: 'admin123',  role: 'admin' },
  { name: 'Regular User',password: 'user123',   role: 'user'  },
  { name: 'user',        password: 'user123',   role: 'user'  },
];

function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function Portal() {
  const { user, login: ctxLogin } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({ name: '', password: '', captcha: '' });
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/dashboard');
  }, [user]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (form.captcha.toUpperCase() !== captcha) {
      setError('Invalid CAPTCHA. Please try again.');
      setCaptcha(generateCaptcha());
      setForm(f => ({ ...f, captcha: '' }));
      return;
    }

    const match = USERS.find(
      u => u.name === form.name && u.password === form.password && u.role === role
    );

    if (!match) {
      setError('Invalid credentials for selected login type.');
      setCaptcha(generateCaptcha());
      setForm(f => ({ ...f, captcha: '' }));
      return;
    }

    // Store user in localStorage (same shape AuthContext expects)
    const userData = { name: match.name, role: match.role, phone: '' };
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', 'local-token');
    localStorage.setItem('sessionExpiry', String(Date.now() + 7 * 24 * 60 * 60 * 1000));

    // Trigger AuthContext to pick up the stored user
    window.location.href = match.role === 'admin' ? '/admin' : '/dashboard';
  };

  return (
    <div className="auth-screen">
      <div className="auth-right">
        <div className="auth-container">
          <div className="auth-header">
            <span className="logo">🌆</span>
            <h1>SMART CITY</h1>
            <p>Intelligent Urban Management System</p>
          </div>

          <div className="auth-form active">
            <h2>Login</h2>

            <div className="login-type-selector">
              <div
                className={`login-type-btn${role === 'user' ? ' active' : ''}`}
                onClick={() => { setRole('user'); setError(''); }}
              >
                <span className="icon">👤</span>
                <span className="label">User Login</span>
              </div>
              <div
                className={`login-type-btn${role === 'admin' ? ' active' : ''}`}
                onClick={() => { setRole('admin'); setError(''); }}
              >
                <span className="icon">🔒</span>
                <span className="label">Admin Login</span>
              </div>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="loginName">Name (Username)</label>
                <input
                  id="loginName"
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <input
                  id="loginPassword"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Enter CAPTCHA *</label>
                <div className="captcha-container">
                  <div className="captcha-code" id="captchaCode">{captcha}</div>
                  <button
                    type="button"
                    className="captcha-refresh"
                    onClick={() => { setCaptcha(generateCaptcha()); setForm(f => ({ ...f, captcha: '' })); }}
                  >🔄</button>
                </div>
                <input
                  type="text"
                  placeholder="Enter code above"
                  value={form.captcha}
                  onChange={e => setForm(f => ({ ...f, captcha: e.target.value }))}
                  required
                />
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.75rem', textAlign: 'center' }}>{error}</p>}

              <button type="submit" className="btn-primary">Login</button>
            </form>

            <p className="demo-credentials">
              <strong>🔑 Demo Credentials</strong><br />
              <small>
                <strong>Admin:</strong> srisanth / SASI@1234<br />
                <strong>User:</strong> Regular User / user123
              </small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
