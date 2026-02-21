import { useState, useEffect } from 'react';
import api from '../../api';

const MEDIA_TYPES = ['photo', 'video'];
const CATEGORIES = ['Love Moments', 'Happy Clients', 'Wedding', 'Birthday', 'Events', 'Behind the Scenes'];

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', media_url: '', media_type: 'photo', description: '', category: '', position: 0, active: true });
  const [error, setError] = useState('');

  const fetchItems = () => {
    setLoading(true);
    api.get('/admin/gallery_items')
      .then(r => setItems(r.data.gallery_items))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const resetForm = () => {
    setForm({ title: '', media_url: '', media_type: 'photo', description: '', category: '', position: 0, active: true });
    setEditing(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title, media_url: item.media_url, media_type: item.media_type,
      description: item.description || '', category: item.category || '',
      position: item.position, active: item.active
    });
    setEditing(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.patch(`/admin/gallery_items/${editing}`, { gallery_item: form });
      } else {
        await api.post('/admin/gallery_items', { gallery_item: form });
      }
      resetForm();
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this gallery item?')) return;
    await api.delete(`/admin/gallery_items/${id}`);
    fetchItems();
  };

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Gallery ({items.length})</h2>
        <button className="btn-secondary btn-sm" style={{ padding: '6px 16px', fontSize: 13 }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="appt-form-grid">
              <div className="form-group">
                <label>Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Media URL *</label>
                <input value={form.media_url} onChange={e => setForm({ ...form, media_url: e.target.value })} required placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Media Type</label>
                <select value={form.media_type} onChange={e => setForm({ ...form, media_type: e.target.value })}>
                  {MEDIA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Position</label>
                <input type="number" value={form.position} onChange={e => setForm({ ...form, position: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Active
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <button type="submit" className="btn-primary btn-sm">{editing ? 'Update' : 'Add'}</button>
          </form>
        </div>
      )}

      {loading ? <p className="empty-state">Loading...</p> : items.length === 0 ? (
        <p className="empty-state">No gallery items yet</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Active</th>
                <th>Uploaded By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.media_type === 'photo' ? (
                      <img src={item.media_url} alt={item.title} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                    ) : (
                      <span className="media-type-badge">Video</span>
                    )}
                  </td>
                  <td>{item.title}</td>
                  <td>{item.media_type}</td>
                  <td>{item.category}</td>
                  <td>{item.active ? 'Yes' : 'No'}</td>
                  <td>{item.uploaded_by || '-'}</td>
                  <td>
                    <button className="btn-secondary btn-sm" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(item.id)} style={{ marginLeft: 4 }}>Delete</button>
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
