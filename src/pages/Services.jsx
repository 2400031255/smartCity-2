import { useEffect, useState } from 'react';
import API from '../api/axios';

export default function Services() {
  const [emergency, setEmergency] = useState([]);
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    API.get('/emergency').then(r => setEmergency(r.data)).catch(() => {});
    API.get('/buses').then(r => setBuses(r.data)).catch(() => {});
  }, []);

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow)', marginBottom: '1rem' };

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>🏛️ City Services</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Access municipal services and information</p>

      <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 800 }}>📞 Emergency Numbers</h3>
      {emergency.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: 'var(--text-secondary)' }}>No emergency numbers available</div>
      ) : emergency.map(e => (
        <div key={e.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.25rem' }}>{e.service}</h4>
            <p style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 700 }}>{e.number}</p>
            {e.address && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>📍 {e.address}</p>}
          </div>
          <a href={`tel:${e.number}`} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>📞 Call</a>
        </div>
      ))}

      <h3 style={{ color: 'var(--text-primary)', margin: '2rem 0 1rem', fontWeight: 800 }}>🚌 Bus Routes</h3>
      {buses.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: 'var(--text-secondary)' }}>No bus routes available</div>
      ) : buses.map(b => (
        <div key={b.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>🚌 Bus {b.number}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{b.route}</p>
          </div>
          <span style={{ background: 'var(--accent)', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem' }}>{b.time}</span>
        </div>
      ))}

      <h3 style={{ color: 'var(--text-primary)', margin: '2rem 0 1rem', fontWeight: 800 }}>🏙️ City Facilities</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
        {[{ icon: '🗑️', title: 'Waste Management', desc: 'Next collection: Tomorrow, 8:00 AM' }, { icon: '💡', title: 'Street Lighting', desc: '98% operational' }, { icon: '🚰', title: 'Water Supply', desc: 'Normal pressure' }].map(f => (
          <div key={f.title} style={card}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{f.icon}</div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.25rem' }}>{f.title}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
