import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const userLinks = [
    { to: '/dashboard', label: '🏙️ Dashboard' },
    { to: '/places',    label: '🏛️ Places' },
    { to: '/services',  label: '🏛️ Services' },
    { to: '/report',    label: '📝 Report' },
    { to: '/issues',    label: '📋 My Issues' },
  ];

  const adminLinks = [
    { to: '/dashboard', label: '🏙️ Dashboard' },
    { to: '/admin',     label: '🔒 Admin' },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        .nav-links { display: flex; gap: 0.25rem; flex: 1; justify-content: center; flex-wrap: wrap; }
        .nav-user { display: flex; align-items: center; gap: 0.75rem; }
        .hamburger { display: none; background: none; border: 1px solid var(--border); color: var(--text-secondary); padding: 0.4rem 0.6rem; border-radius: 8px; cursor: pointer; font-size: 1.1rem; }
        .mobile-menu { display: none; }
        @media (max-width: 640px) {
          .nav-links { display: none; }
          .nav-user { display: none; }
          .hamburger { display: block; }
          .mobile-menu { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem 1.5rem; background: var(--nav-bg); border-bottom: 1px solid var(--border); }
        }
      `}</style>
      <nav style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)', padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow)' }}>
        <div style={{ fontWeight: 900, fontSize: '1.1rem', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🏙️ Smart City
        </div>
        <div className="nav-links">
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '0.45rem 0.9rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600,
              background: location.pathname === l.to ? 'linear-gradient(135deg, var(--accent), #8b5cf6)' : 'transparent',
              color: location.pathname === l.to ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}>{l.label}</Link>
          ))}
        </div>
        <div className="nav-user">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user?.name}</span>
          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '20px', background: user?.role === 'admin' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)', color: user?.role === 'admin' ? '#f59e0b' : 'var(--accent)', fontWeight: 700 }}>{user?.role}</span>
          <button onClick={handleLogout} style={{ padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Logout</button>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>{menuOpen ? '✕' : '☰'}</button>
      </nav>
      {menuOpen && (
        <div className="mobile-menu">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={{
              padding: '0.6rem 1rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
              background: location.pathname === l.to ? 'linear-gradient(135deg, var(--accent), #8b5cf6)' : 'var(--bg-secondary)',
              color: location.pathname === l.to ? '#fff' : 'var(--text-secondary)',
            }}>{l.label}</Link>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user?.name} · <span style={{ color: user?.role === 'admin' ? '#f59e0b' : 'var(--accent)', fontWeight: 700 }}>{user?.role}</span></span>
            <button onClick={handleLogout} style={{ padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Logout</button>
          </div>
        </div>
      )}
      <main style={{ padding: '1.5rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
