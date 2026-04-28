import { useEffect, useState } from 'react';
import API from '../api/axios';

export default function Places() {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { API.get('/places').then(r => setPlaces(r.data)).catch(() => {}); }, []);

  const filtered = places.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '24px', padding: '3rem 2rem', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌆</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Famous Places</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Discover iconic destinations in Vijayawada</p>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto 2rem', position: 'relative' }}>
        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search places..." style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', border: '2px solid var(--border)', borderRadius: '25px', fontSize: '0.95rem', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem' }}>🔍</div>
          <p>No places found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
          {filtered.map(place => (
            <div key={place.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow)', transition: 'all 0.3s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                <img src={place.image} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src = 'https://via.placeholder.com/400x200?text=' + place.name} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6),transparent)' }} />
                <span style={{ position: 'absolute', bottom: 12, right: 12, fontSize: '2rem' }}>{place.icon}</span>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{place.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{place.description}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1rem' }}>📍 {place.address}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ flex: 1, padding: '0.6rem', background: 'linear-gradient(135deg,var(--accent),#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>🔍 Explore</button>
                  <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`, '_blank')} style={{ flex: 1, padding: '0.6rem', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1.5px solid var(--border)', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>🗺️ Directions</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
