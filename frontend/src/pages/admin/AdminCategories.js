import { useState, useEffect, useCallback } from 'react';
import api from '../../api';

const EMPTY_FORM = { name: '', description: '', image_url: '', position: 0 };

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    try { const r = await api.get('/admin/categories'); setItems(r.data.categories); } catch {}
  }, []);

  useEffect(() => { fetch().finally(() => setLoading(false)); }, [fetch]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editing) {
        await api.patch(`/admin/categories/${editing}`, { category: form });
      } else {
        await api.post('/admin/categories', { category: form });
      }
      setForm(EMPTY_FORM); setEditing(null); setShowForm(false); fetch();
    } catch (err) { setError(err.response?.data?.errors?.join(', ') || 'Failed'); }
  };

  const startEdit = (item) => {
    setForm({ name: item.name, description: item.description || '', image_url: item.image_url || '', position: item.position });
    setEditing(item.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this category?')) return;
    try { await api.delete(`/admin/categories/${id}`); fetch(); } catch {}
  };

  if (loading) return <p className="empty-state">Loading...</p>;

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Categories ({items.length})</h2>
        <button className="btn-primary" style={{width:'auto',padding:'8px 20px'}} onClick={() => { setShowForm(!showForm); setEditing(null); setForm(EMPTY_FORM); }}>
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="form-group">
                <label>Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Wedding Package" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Short description" />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Position (order)</label>
                <input type="number" value={form.position} onChange={e => setForm({...form, position: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{width:'auto',padding:'8px 20px'}}>{editing ? 'Update' : 'Create'}</button>
          </form>
        </div>
      )}

      {items.length === 0 ? <p className="empty-state">No categories yet.</p> : (
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Pos</th><th>Name</th><th>Description</th><th>Packages</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} className={!c.active ? 'row-inactive' : ''}>
                  <td>{c.position}</td>
                  <td>{c.name}</td>
                  <td>{c.description || '\u2014'}</td>
                  <td>{c.packages_count}</td>
                  <td><span className={`status-badge ${c.active ? 'status-approved' : 'status-pending'}`}>{c.active ? 'Active' : 'Inactive'}</span></td>
                  <td className="action-cell">
                    <button className="btn-approve" onClick={() => startEdit(c)}>Edit</button>
                    {c.active && <button className="btn-reject" onClick={() => handleDelete(c.id)}>Deactivate</button>}
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
