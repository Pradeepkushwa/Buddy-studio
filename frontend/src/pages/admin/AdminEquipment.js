import { useState, useEffect, useCallback } from 'react';
import api from '../../api';

const TYPES = [
  { value: 'photography_camera', label: 'Photography Camera' },
  { value: 'videography_camera', label: 'Videography Camera' },
  { value: 'drone', label: 'Drone' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'album', label: 'Album' },
  { value: 'video', label: 'Video' },
  { value: 'other', label: 'Other' },
];

const EMPTY_FORM = { name: '', equipment_type: 'photography_camera', description: '' };

export default function AdminEquipment() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    try { const r = await api.get('/admin/equipments'); setItems(r.data.equipments); } catch {}
  }, []);

  useEffect(() => { fetch().finally(() => setLoading(false)); }, [fetch]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editing) {
        await api.patch(`/admin/equipments/${editing}`, { equipment: form });
      } else {
        await api.post('/admin/equipments', { equipment: form });
      }
      setForm(EMPTY_FORM); setEditing(null); setShowForm(false); fetch();
    } catch (err) { setError(err.response?.data?.errors?.join(', ') || 'Failed'); }
  };

  const startEdit = (item) => {
    setForm({ name: item.name, equipment_type: item.equipment_type, description: item.description || '' });
    setEditing(item.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this equipment?')) return;
    try { await api.delete(`/admin/equipments/${id}`); fetch(); } catch {}
  };

  if (loading) return <p className="empty-state">Loading...</p>;

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Equipment ({items.length})</h2>
        <button className="btn-primary" style={{width:'auto',padding:'8px 20px'}} onClick={() => { setShowForm(!showForm); setEditing(null); setForm(EMPTY_FORM); }}>
          {showForm ? 'Cancel' : '+ Add Equipment'}
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="form-group">
                <label>Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Canon EOS R5" />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select value={form.equipment_type} onChange={e => setForm({...form, equipment_type: e.target.value})}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional details" />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{width:'auto',padding:'8px 20px'}}>{editing ? 'Update' : 'Create'}</button>
          </form>
        </div>
      )}

      {items.length === 0 ? <p className="empty-state">No equipment yet. Add your first one above.</p> : (
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Type</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(eq => (
                <tr key={eq.id} className={!eq.active ? 'row-inactive' : ''}>
                  <td>{eq.name}</td>
                  <td>{TYPES.find(t => t.value === eq.equipment_type)?.label || eq.equipment_type}</td>
                  <td>{eq.description || '\u2014'}</td>
                  <td><span className={`status-badge ${eq.active ? 'status-approved' : 'status-pending'}`}>{eq.active ? 'Active' : 'Inactive'}</span></td>
                  <td className="action-cell">
                    <button className="btn-approve" onClick={() => startEdit(eq)}>Edit</button>
                    {eq.active && <button className="btn-reject" onClick={() => handleDelete(eq.id)}>Deactivate</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
