import { useEffect, useState, useCallback } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const STATUS_COLOR = { pending: '#f59e0b', resolved: '#10b981', completed: '#6366f1' };

const CARD = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem', marginBottom: '0.75rem', boxShadow: 'var(--shadow)' };
const INP = { width: '100%', padding: '0.75rem 1rem', border: '2px solid var(--border)', borderRadius: '12px', fontSize: '0.9rem', background: 'var(--input-bg)', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' };
const LBL = { display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' };
const BTN_PRIMARY = { padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg,var(--accent),#8b5cf6)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', width: '100%' };
const BTN_DELETE = { padding: '0.4rem 0.8rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 };
const TABS = ['issues', 'users', 'places', 'buses', 'alerts', 'emergency'];

// Reusable field component
const Field = ({ label, children }) => (
  <div><label style={LBL}>{label}</label>{children}</div>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
    <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: 480, border: '1px solid var(--border)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

// Reusable tab-level add button
const AddBtn = ({ label, onClick }) => (
  <button onClick={onClick} style={{ ...BTN_PRIMARY, width: 'auto', marginBottom: '1rem', padding: '0.6rem 1.5rem' }}>{label}</button>
);

export default function AdminPanel() {
  const [tab, setTab] = useState('issues');
  const [data, setData] = useState({ issues: [], users: [], places: [], buses: [], alerts: [], emergency: [] });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const closeModal = () => { setModal(null); setForm({}); };

  // Only fetch the stats-relevant endpoints on mount; fetch tab data lazily
  const load = useCallback((keys) => {
    const endpoints = { issues: '/issues', users: '/users', places: '/places', buses: '/buses', alerts: '/alerts', emergency: '/emergency' };
    keys.forEach(k =>
      API.get(endpoints[k])
        .then(r => setData(d => ({ ...d, [k]: r.data })))
        .catch(() => toast.error(`Failed to load ${k}`))
    );
  }, []);

  // On mount: load all for stats; on tab change: refresh that tab
  useEffect(() => { load(['issues', 'users', 'places', 'buses', 'alerts', 'emergency']); }, [load]);
  useEffect(() => { load([tab]); }, [tab, load]);

  const mutate = useCallback(async (fn, msg, refreshKeys) => {
    try { await fn(); toast.success(msg); load(refreshKeys); }
    catch (err) { toast.error(err.response?.data?.error || `Failed: ${msg}`); }
  }, [load]);

  const resolve   = (id) => mutate(() => API.put(`/issues/${id}`, { status: 'resolved' }), 'Marked resolved', ['issues']);
  const complete  = (id) => mutate(() => API.put(`/issues/${id}`, { status: 'completed' }), 'Marked completed', ['issues']);
  const deleteIssue     = (id)   => mutate(() => API.delete(`/issues/${id}`),   'Issue deleted',  ['issues']);
  const deleteUser      = (name) => mutate(() => API.delete(`/users/${name}`),   'User deleted',   ['users']);
  const deletePlace     = (id)   => mutate(() => API.delete(`/places/${id}`),    'Place deleted',  ['places']);
  const deleteBus       = (id)   => mutate(() => API.delete(`/buses/${id}`),     'Bus deleted',    ['buses']);
  const deleteAlert     = (id)   => mutate(() => API.delete(`/alerts/${id}`),    'Alert deleted',  ['alerts']);
  const deleteEmergency = (id)   => mutate(() => API.delete(`/emergency/${id}`), 'Deleted',        ['emergency']);

  const handleCreate = async () => {
    // Validate before submitting
    if (modal === 'addPlace' && (!form.name?.trim() || !form.image?.trim() || !form.address?.trim())) {
      toast.error('Name, image URL and address are required'); return;
    }
    if (modal === 'addBus' && (!form.number?.trim() || !form.route?.trim() || !form.time?.trim())) {
      toast.error('Bus number, route and timing are required'); return;
    }
    if (modal === 'addAlert' && !form.message?.trim()) {
      toast.error('Alert message is required'); return;
    }
    if (modal === 'addEmergency' && (!form.service?.trim() || !form.number?.trim())) {
      toast.error('Service name and phone number are required'); return;
    }
    if (modal === 'addSolution' && !form.solution?.trim()) {
      toast.error('Solution description is required'); return;
    }
    setLoading(true);
    try {
      const actions = {
        addPlace:     () => API.post('/places', form),
        addBus:       () => API.post('/buses', form),
        addAlert:     () => API.post('/alerts', form),
        addEmergency: () => API.post('/emergency', form),
        addSolution:  () => API.put(`/issues/${form.id}`, { solution: form.solution, priority: form.priority }),
      };
      const refreshMap = { addPlace: 'places', addBus: 'buses', addAlert: 'alerts', addEmergency: 'emergency', addSolution: 'issues' };
      await actions[modal]();
      toast.success('Saved');
      closeModal();
      load([refreshMap[modal]]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setLoading(false); }
  };

  const { issues, users, places, buses, alerts, emergency } = data;

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>🔒 Admin Control Center</h2>

      <div className="admin-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[{ icon: '👥', val: users.length, lbl: 'Total Users' }, { icon: '📝', val: issues.length, lbl: 'Total Issues' }, { icon: '⏳', val: issues.filter(i => i.status === 'pending').length, lbl: 'Pending' }, { icon: '🏛️', val: places.length, lbl: 'Places' }].map(s => (
          <div key={s.lbl} style={{ ...CARD, textAlign: 'center', background: 'linear-gradient(135deg,var(--accent),#8b5cf6)', border: 'none' }}>
            <div style={{ fontSize: '2rem' }}>{s.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{s.val}</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', background: tab === t ? 'linear-gradient(135deg,var(--accent),#8b5cf6)' : 'var(--bg-secondary)', color: tab === t ? '#fff' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {tab === 'issues' && (
        <div>
          {issues.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No issues</p> : issues.map(i => (
            <div key={i.id} style={CARD}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{i.category}</strong>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: `${STATUS_COLOR[i.status]}22`, color: STATUS_COLOR[i.status] }}>{i.status}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>👤 {i.name} | 📱 {i.phone}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>📍 {i.location}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>📝 {i.description}</p>
              {i.solution && <div style={{ background: 'rgba(16,185,129,0.12)', borderLeft: '4px solid #10b981', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.82rem', color: 'var(--text-primary)' }}>✅ Solution: {i.solution}</div>}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => { setModal('addSolution'); setForm({ id: i.id, solution: i.solution || '', priority: i.priority || 'medium' }); }} style={{ padding: '0.4rem 0.8rem', background: 'rgba(99,102,241,0.15)', border: '1px solid #6366f1', color: '#6366f1', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>🔧 {i.solution ? 'Edit Solution' : 'Add Solution'}</button>
                {i.status === 'pending'  && <button onClick={() => resolve(i.id)}  style={{ padding: '0.4rem 0.8rem', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>✅ Resolve</button>}
                {i.status === 'resolved' && <button onClick={() => complete(i.id)} style={{ padding: '0.4rem 0.8rem', background: 'rgba(99,102,241,0.15)', border: '1px solid #6366f1', color: '#6366f1', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>🏆 Complete</button>}
                <button onClick={() => deleteIssue(i.id)} style={BTN_DELETE}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div>
          {users.filter(u => u.role === 'user').map(u => (
            <div key={u.id} style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>👤 {u.name}</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>📱 {u.phone} | Joined: {new Date(u.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => deleteUser(u.name)} style={BTN_DELETE}>🗑️ Delete</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'places' && (
        <div>
          <AddBtn label="+ Add Place" onClick={() => { setModal('addPlace'); setForm({ name: '', image: '', description: '', address: '', icon: '🏛️' }); }} />
          {places.map(p => (
            <div key={p.id} style={{ ...CARD, display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <img src={p.image} alt={p.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '10px' }} onError={e => e.target.src = 'https://via.placeholder.com/80'} />
              <div style={{ flex: 1 }}>
                <strong style={{ color: 'var(--text-primary)' }}>{p.icon} {p.name}</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>📍 {p.address}</p>
              </div>
              <button onClick={() => deletePlace(p.id)} style={BTN_DELETE}>🗑️</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'buses' && (
        <div>
          <AddBtn label="+ Add Bus Route" onClick={() => { setModal('addBus'); setForm({ number: '', route: '', time: '' }); }} />
          {buses.map(b => (
            <div key={b.id} style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>🚌 Bus {b.number}</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{b.route} | {b.time}</p>
              </div>
              <button onClick={() => deleteBus(b.id)} style={BTN_DELETE}>🗑️</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'alerts' && (
        <div>
          <AddBtn label="+ Add Alert" onClick={() => { setModal('addAlert'); setForm({ type: 'warning', message: '' }); }} />
          {alerts.map(a => (
            <div key={a.id} style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><strong style={{ color: 'var(--text-primary)' }}>{a.type === 'warning' ? '⚠️' : a.type === 'success' ? '✅' : 'ℹ️'} {a.message}</strong></div>
              <button onClick={() => deleteAlert(a.id)} style={BTN_DELETE}>🗑️</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'emergency' && (
        <div>
          <AddBtn label="+ Add Emergency Number" onClick={() => { setModal('addEmergency'); setForm({ service: '', number: '', address: '' }); }} />
          {emergency.map(e => (
            <div key={e.id} style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>{e.service}</strong>
                <p style={{ color: 'var(--accent)', fontWeight: 700 }}>{e.number}</p>
                {e.address && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>📍 {e.address}</p>}
              </div>
              <button onClick={() => deleteEmergency(e.id)} style={BTN_DELETE}>🗑️</button>
            </div>
          ))}
        </div>
      )}

      {modal === 'addSolution' && (
        <Modal title="🔧 Add Solution" onClose={closeModal}>
          <Field label="Priority">
            <select style={INP} value={form.priority} onChange={e => setField('priority', e.target.value)}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </Field>
          <Field label="Solution">
            <textarea style={{ ...INP, height: 100, resize: 'vertical' }} placeholder="Describe the solution..." value={form.solution} onChange={e => setField('solution', e.target.value)} />
          </Field>
          <button style={BTN_PRIMARY} onClick={handleCreate} disabled={loading}>{loading ? 'Saving...' : 'Save Solution'}</button>
        </Modal>
      )}

      {modal === 'addPlace' && (
        <Modal title="🏛️ Add Tourist Place" onClose={closeModal}>
          <Field label="Place Name"><input style={INP} placeholder="e.g. Kanaka Durga Temple" value={form.name} onChange={e => setField('name', e.target.value)} /></Field>
          <Field label="Image URL"><input style={INP} placeholder="https://..." value={form.image} onChange={e => setField('image', e.target.value)} /></Field>
          <Field label="Description"><textarea style={{ ...INP, height: 80, resize: 'vertical' }} value={form.description} onChange={e => setField('description', e.target.value)} /></Field>
          <Field label="Address"><input style={INP} placeholder="Full address" value={form.address} onChange={e => setField('address', e.target.value)} /></Field>
          <button style={BTN_PRIMARY} onClick={handleCreate} disabled={loading}>{loading ? 'Adding...' : 'Add Place'}</button>
        </Modal>
      )}

      {modal === 'addBus' && (
        <Modal title="🚌 Add Bus Route" onClose={closeModal}>
          <Field label="Bus Number"><input style={INP} placeholder="e.g. 99" value={form.number} onChange={e => setField('number', e.target.value)} /></Field>
          <Field label="Route"><input style={INP} placeholder="e.g. Station to Temple" value={form.route} onChange={e => setField('route', e.target.value)} /></Field>
          <Field label="Timing"><input style={INP} placeholder="e.g. Every 15 min" value={form.time} onChange={e => setField('time', e.target.value)} /></Field>
          <button style={BTN_PRIMARY} onClick={handleCreate} disabled={loading}>{loading ? 'Adding...' : 'Add Bus Route'}</button>
        </Modal>
      )}

      {modal === 'addAlert' && (
        <Modal title="🚨 Add Alert" onClose={closeModal}>
          <Field label="Alert Type">
            <select style={INP} value={form.type} onChange={e => setField('type', e.target.value)}>
              <option value="warning">⚠️ Warning</option>
              <option value="info">ℹ️ Info</option>
              <option value="success">✅ Success</option>
            </select>
          </Field>
          <Field label="Message"><input style={INP} placeholder="Alert message..." value={form.message} onChange={e => setField('message', e.target.value)} /></Field>
          <button style={BTN_PRIMARY} onClick={handleCreate} disabled={loading}>{loading ? 'Adding...' : 'Add Alert'}</button>
        </Modal>
      )}

      {modal === 'addEmergency' && (
        <Modal title="📞 Add Emergency Number" onClose={closeModal}>
          <Field label="Service Name"><input style={INP} placeholder="e.g. Police" value={form.service} onChange={e => setField('service', e.target.value)} /></Field>
          <Field label="Phone Number"><input style={INP} placeholder="e.g. 100" value={form.number} onChange={e => setField('number', e.target.value)} /></Field>
          <Field label="Address"><input style={INP} placeholder="Station address" value={form.address} onChange={e => setField('address', e.target.value)} /></Field>
          <button style={BTN_PRIMARY} onClick={handleCreate} disabled={loading}>{loading ? 'Adding...' : 'Add Emergency Number'}</button>
        </Modal>
      )}
    </div>
  );
}
