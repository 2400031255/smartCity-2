import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function Portal() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [screen, setScreen] = useState('portal');
  const [isLogin, setIsLogin] = useState(true);
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [form, setForm] = useState({ name: '', password: '', phone: '', captcha: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.expired) {
      toast.error('Your session expired. Please log in again.');
      window.history.replaceState({}, '');
    }
  }, []);

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/dashboard');
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (form.captcha.toUpperCase() !== captcha) {
      toast.error('Invalid CAPTCHA'); setCaptcha(generateCaptcha()); return;
    }
    setLoading(true);
    try {
      const u = await login(form.name, form.password, screen === 'admin' ? 'admin' : 'user');
      toast.success(`Welcome ${u.name}!`);
      navigate(u.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
      setCaptcha(generateCaptcha());
    } finally { setLoading(false); }
  };

  const [errors, setErrors] = useState({});

  const validateRegister = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Username is required';
    else if (form.name.trim().length < 3) e.name = 'At least 3 characters';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^[0-9]{10}$/.test(form.phone)) e.phone = 'Must be exactly 10 digits';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setLoading(true);
    try {
      await register(form.name, form.phone, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inp = (field) => ({ width: '100%', padding: '0.82rem 1rem', border: `1.5px solid ${errors[field] ? '#ef4444' : 'rgba(255,255,255,0.12)'}`, borderRadius: '12px', fontSize: '0.88rem', background: 'rgba(255,255,255,0.07)', color: '#fff', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' });
  const lbl = { display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', letterSpacing: '0.4px', textTransform: 'uppercase' };
  const ErrMsg = ({ field }) => errors[field] ? <span style={{ color: '#f87171', fontSize: '0.72rem', marginTop: '0.3rem', display: 'block' }}>{errors[field]}</span> : null;

  if (screen === 'portal') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden', background: '#000', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=100')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.88) saturate(1.3)', animation: 'bgZoom 35s ease-in-out infinite alternate', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.6) 100%)', zIndex: 0 }} />
      <style>{`@keyframes bgZoom { from{transform:scale(1)} to{transform:scale(1.07)} } @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }`}</style>

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '2.5rem', animation: 'fadeUp 0.9s both' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 30px rgba(255,200,50,0.7))' }}>🌆</div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px', background: 'linear-gradient(135deg,#fff 0%,#ffe566 40%,#ffb347 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>SMART CITY</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Intelligent Urban Management System</p>
      </div>

      <div className="portal-cards" style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeUp 0.9s 0.2s both' }}>
        {[
          { type: 'user', icon: '👤', title: 'Citizen Portal', desc: 'Report issues, track status, explore city services', color: '#10b981', btn: '🚀 Enter as User' },
          { type: 'admin', icon: '🔐', title: 'Admin Portal', desc: 'Manage issues, users, alerts and city infrastructure', color: '#f59e0b', btn: '🛡️ Enter as Admin' }
        ].map(card => (
          <div key={card.type} onClick={() => setScreen(card.type)} style={{ width: '300px', borderRadius: '28px', padding: '2.5rem 2rem', cursor: 'pointer', background: card.type === 'user' ? 'linear-gradient(145deg,rgba(16,185,129,0.2),rgba(6,78,59,0.6))' : 'linear-gradient(145deg,rgba(245,158,11,0.22),rgba(120,53,15,0.65))', border: `1px solid ${card.color}66`, backdropFilter: 'blur(24px)', transition: 'all 0.4s', textAlign: 'center' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-14px) scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ width: 90, height: 90, borderRadius: '26px', background: card.type === 'user' ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#d97706,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem', boxShadow: `0 12px 35px ${card.color}88` }}>{card.icon}</div>
            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.6rem' }}>{card.title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>{card.desc}</p>
            <button style={{ width: '100%', padding: '0.9rem', borderRadius: '14px', border: 'none', background: card.type === 'user' ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: `0 8px 25px ${card.color}80` }}>{card.btn}</button>
          </div>
        ))}
      </div>
    </div>
  );

  const isAdmin = screen === 'admin';
  const accent = isAdmin ? '#f59e0b' : '#10b981';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', background: '#000', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=100')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.88) saturate(1.3)', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.6) 100%)', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '440px' }}>
        <button onClick={() => setScreen('portal')} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)', padding: '0.5rem 1.1rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1rem', backdropFilter: 'blur(10px)' }}>← Back to Portal</button>

        <div style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(40px)', borderRadius: '28px', overflow: 'hidden', border: `1px solid ${accent}4d`, boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
          <div style={{ height: 3, background: isAdmin ? 'linear-gradient(90deg,#d97706,#f59e0b,#ef4444)' : 'linear-gradient(90deg,#059669,#10b981,#06b6d4)' }} />

          <div style={{ padding: '1.75rem 2rem 0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 54, height: 54, borderRadius: '16px', background: `${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', boxShadow: `0 4px 20px ${accent}4d` }}>{isAdmin ? '🔐' : '👤'}</div>
            <div>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, marginBottom: 3 }}>{isAdmin ? 'Admin Access' : isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.76rem' }}>{isAdmin ? 'Restricted to authorized personnel' : isLogin ? 'Sign in to your citizen account' : 'Join the Smart City community'}</p>
            </div>
          </div>

          <div style={{ padding: '1rem 2rem 2rem' }}>
            {isAdmin && <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d', padding: '0.35rem 0.9rem', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '1rem' }}>🛡️ Secure Admin Authentication</div>}

            <form onSubmit={isLogin || isAdmin ? handleLogin : handleRegister}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>{isAdmin ? 'Admin Username' : 'Username'}</label>
                <input style={inp('name')} type="text" placeholder="Enter username" value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setErrors(er => ({ ...er, name: '' })); }} required />
                <ErrMsg field="name" />
              </div>
              {!isLogin && !isAdmin && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={lbl}>Phone Number</label>
                  <input style={inp('phone')} type="tel" placeholder="10 digit number" maxLength={10} value={form.phone} onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors(er => ({ ...er, phone: '' })); }} required />
                  <ErrMsg field="phone" />
                </div>
              )}
              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>{isAdmin ? 'Admin Password' : 'Password'}</label>
                <input style={inp('password')} type="password" placeholder="Enter password" value={form.password} onChange={e => { setForm({ ...form, password: e.target.value }); setErrors(er => ({ ...er, password: '' })); }} required />
                <ErrMsg field="password" />
              </div>
              {(isLogin || isAdmin) && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={lbl}>Security CAPTCHA</label>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1, background: isAdmin ? 'linear-gradient(135deg,#d97706,#f59e0b)' : 'linear-gradient(135deg,#059669,#10b981)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.5rem', color: '#fff', minHeight: 48, fontFamily: 'Courier New, monospace', boxShadow: `0 6px 20px ${accent}80` }}>{captcha}</div>
                    <button type="button" onClick={() => setCaptcha(generateCaptcha())} style={{ background: isAdmin ? 'linear-gradient(135deg,#d97706,#f59e0b)' : 'linear-gradient(135deg,#059669,#10b981)', border: 'none', color: '#fff', padding: '0 16px', borderRadius: '14px', cursor: 'pointer', fontSize: '1.1rem', height: 50, boxShadow: `0 4px 15px ${accent}66` }}>🔄</button>
                  </div>
                  <input style={inp} type="text" placeholder="Enter the code above" value={form.captcha} onChange={e => setForm({ ...form, captcha: e.target.value })} required />
                </div>
              )}
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.9rem', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.75rem', background: isAdmin ? 'linear-gradient(135deg,#d97706,#f59e0b)' : 'linear-gradient(135deg,#059669,#10b981)', boxShadow: `0 8px 25px ${accent}80`, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Please wait...' : isAdmin ? '🔐 Authenticate & Enter' : isLogin ? '→ Sign In Securely' : '→ Create Account'}
              </button>
            </form>

            {!isAdmin && (
              <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                {isLogin ? "New here? " : "Already have an account? "}
                <span onClick={() => { setIsLogin(!isLogin); setErrors({}); }} style={{ color: '#6ee7b7', fontWeight: 700, cursor: 'pointer' }}>{isLogin ? 'Create Account' : 'Sign In'}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
