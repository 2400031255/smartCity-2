import { useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'streetlight', label: 'Street Light', icon: '💡' },
  { value: 'traffic', label: 'Traffic Signal', icon: '🚦' },
  { value: 'waste', label: 'Waste', icon: '🗑️' },
  { value: 'water', label: 'Water Pipe', icon: '🚧' },
  { value: 'other', label: 'Other', icon: '📌' },
];

const CARD = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem', boxShadow: 'var(--shadow)' };
const LBL = { display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.4px' };
const inpStyle = (hasError) => ({ width: '100%', padding: '0.75rem 1rem', border: `2px solid ${hasError ? '#ef4444' : 'var(--border)'}`, borderRadius: '12px', fontSize: '0.9rem', background: 'var(--input-bg)', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' });
const ErrMsg = ({ msg }) => msg ? <span style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '0.3rem', display: 'block', fontWeight: 500 }}>{msg}</span> : null;

export default function ReportIssue() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', category: '', location: '', description: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^[0-9]{10}$/.test(form.phone)) e.phone = 'Phone must be exactly 10 digits';
    if (!form.category) e.category = 'Please select a category';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.trim().length < 10) e.description = 'Description must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/issues', form);
      setRefId('SC' + String(data.id).padStart(8, '0'));
      setSubmitted(true);
      toast.success('Issue reported successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit');
    } finally { setLoading(false); }
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  if (submitted) return (
    <div style={{ ...CARD, textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Report Submitted!</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Reference ID: <strong style={{ color: 'var(--accent)' }}>{refId}</strong></p>
      <button onClick={() => { setSubmitted(false); setForm({ name: user?.name || '', phone: user?.phone || '', category: '', location: '', description: '' }); }} style={{ padding: '0.85rem 2rem', background: 'linear-gradient(135deg,var(--accent),#8b5cf6)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>Report Another Issue</button>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '2rem', alignItems: 'start' }} className="report-grid">
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', margin: '-2rem -2rem 2rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)', borderRadius: '20px 20px 0 0' }}>
          <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📝</div>
          <div><h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>Report an Issue</h2><p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem' }}>Help us improve the city</p></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div><label style={LBL}>Full Name</label><input style={inpStyle(errors.name)} value={form.name} onChange={e => handleChange('name', e.target.value)} /><ErrMsg msg={errors.name} /></div>
            <div><label style={LBL}>Phone Number</label><input style={inpStyle(errors.phone)} type="tel" maxLength={10} value={form.phone} onChange={e => handleChange('phone', e.target.value)} /><ErrMsg msg={errors.phone} /></div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={LBL}>Issue Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
              {CATEGORIES.map(c => (
                <div key={c.value} onClick={() => handleChange('category', c.value)} style={{ padding: '1rem 0.5rem', border: `2px solid ${form.category === c.value ? 'var(--accent)' : errors.category ? '#ef4444' : 'var(--border)'}`, borderRadius: '14px', cursor: 'pointer', textAlign: 'center', background: form.category === c.value ? 'rgba(var(--accent-rgb),0.1)' : 'var(--bg-secondary)', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '1.8rem' }}>{c.icon}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: form.category === c.value ? 'var(--accent)' : 'var(--text-secondary)' }}>{c.label}</div>
                </div>
              ))}
            </div>
            <ErrMsg msg={errors.category} />
          </div>

          <div style={{ marginBottom: '1rem' }}><label style={LBL}>Location</label><input style={inpStyle(errors.location)} placeholder="Enter address or landmark" value={form.location} onChange={e => handleChange('location', e.target.value)} /><ErrMsg msg={errors.location} /></div>
          <div style={{ marginBottom: '1.5rem' }}><label style={LBL}>Description</label><textarea style={{ ...inpStyle(errors.description), height: 100, resize: 'vertical' }} placeholder="Describe the issue in detail..." value={form.description} onChange={e => handleChange('description', e.target.value)} /><ErrMsg msg={errors.description} /></div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg,var(--accent),#8b5cf6)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Submitting...' : '📤 Submit Report'}
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', flexWrap: 'wrap' }}>
        {[{ icon: '⚡', title: 'Quick Tips', items: ['📍 Be specific about location', '📸 A photo helps resolve faster', '📝 Describe clearly', '📞 Provide valid phone'] }, { icon: '🚨', title: 'Emergency?', items: ['Call 100 — Police', 'Call 108 — Ambulance', 'Call 101 — Fire'] }].map(c => (
          <div key={c.title} style={{ ...CARD, padding: '1.25rem', flex: '1 1 200px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{c.icon}</div>
            <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{c.title}</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {c.items.map(i => <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{i}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
