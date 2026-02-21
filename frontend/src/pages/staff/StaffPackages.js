import { useState, useEffect, useCallback } from 'react';
import api from '../../api';

const EMPTY_FORM = { name: '', description: '', category_id: '', price: '', discount_percentage: '0', featured: false, package_items_attributes: [] };
const EMPTY_ITEM = { equipment_id: '', quantity: 1, notes: '' };

const APPROVAL_COLORS = {
  approved: '#22c55e',
  pending_approval: '#f59e0b',
  rejected: '#ef4444'
};

export default function StaffPackages() {
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [pkgRes, catRes, eqRes] = await Promise.all([
        api.get('/staff/packages'), api.get('/categories'), api.get('/staff/equipments')
      ]);
      setPackages(pkgRes.data.packages);
      setCategories(catRes.data.categories);
      setEquipmentList(eqRes.data.equipments.filter(e => e.active));
    } catch {}
  }, []);

  useEffect(() => { fetchAll().finally(() => setLoading(false)); }, [fetchAll]);

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setMessage('');
    const payload = {
      ...form,
      price: parseFloat(form.price),
      discount_percentage: parseFloat(form.discount_percentage) || 0,
      package_items_attributes: form.package_items_attributes.filter(i => i.equipment_id)
    };
    try {
      let res;
      if (editing) {
        res = await api.patch(`/staff/packages/${editing}`, { package: payload });
      } else {
        res = await api.post('/staff/packages', { package: payload });
      }
      setMessage(res.data.message || 'Saved successfully');
      setForm(EMPTY_FORM); setEditing(null); setShowForm(false); fetchAll();
    } catch (err) { setError(err.response?.data?.errors?.join(', ') || 'Failed to save'); }
  };

  const startEdit = (pkg) => {
    setForm({
      name: pkg.name, description: pkg.description || '', category_id: pkg.category_id,
      price: pkg.price, discount_percentage: pkg.discount_percentage, featured: pkg.featured,
      package_items_attributes: pkg.items.map(i => ({ id: i.id, equipment_id: i.equipment_id, quantity: i.quantity, notes: i.notes || '' }))
    });
    setEditing(pkg.id); setShowForm(true);
  };

  const addItem = () => setForm({ ...form, package_items_attributes: [...form.package_items_attributes, { ...EMPTY_ITEM }] });

  const updateItem = (idx, field, value) => {
    const items = [...form.package_items_attributes];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, package_items_attributes: items });
  };

  const removeItem = (idx) => {
    const items = [...form.package_items_attributes];
    if (items[idx].id) items[idx] = { ...items[idx], _destroy: true };
    else items.splice(idx, 1);
    setForm({ ...form, package_items_attributes: items });
  };

  const previewOffer = () => {
    const p = parseFloat(form.price) || 0;
    const d = parseFloat(form.discount_percentage) || 0;
    return d > 0 ? p - (p * d / 100) : p;
  };

  if (loading) return <p className="empty-state">Loading...</p>;

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">My Packages ({packages.length})</h2>
        <button className="btn-primary" style={{ width: 'auto', padding: '8px 20px' }} onClick={() => { setShowForm(!showForm); setEditing(null); setForm(EMPTY_FORM); setMessage(''); }}>
          {showForm ? 'Cancel' : '+ Create Package'}
        </button>
      </div>

      {message && <div className="auth-success">{message}</div>}

      {showForm && (
        <div className="admin-form-card">
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="form-group">
                <label>Package Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Price (INR) *</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min="1" />
              </div>
              <div className="form-group">
                <label>Discount %</label>
                <input type="number" value={form.discount_percentage} onChange={e => setForm({ ...form, discount_percentage: e.target.value })} min="0" max="100" />
              </div>
            </div>
            <div className="price-preview">
              Offer Price: <strong>{formatPrice(previewOffer())}</strong>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>

            <h4 style={{ margin: '16px 0 8px' }}>Package Items</h4>
            {form.package_items_attributes.filter(i => !i._destroy).map((item, idx) => (
              <div key={idx} className="pkg-item-row">
                <select value={item.equipment_id} onChange={e => updateItem(idx, 'equipment_id', e.target.value)} required>
                  <option value="">Select equipment</option>
                  {equipmentList.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                </select>
                <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} min="1" style={{ width: 70 }} />
                <input value={item.notes} onChange={e => updateItem(idx, 'notes', e.target.value)} placeholder="Notes" style={{ flex: 1 }} />
                <button type="button" className="btn-reject btn-sm" onClick={() => removeItem(idx)}>Remove</button>
              </div>
            ))}
            <button type="button" className="btn-secondary btn-sm" style={{ marginBottom: 16 }} onClick={addItem}>+ Add Item</button>

            <div><button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 32px' }}>{editing ? 'Update' : 'Create Package'}</button></div>
          </form>
        </div>
      )}

      {packages.length === 0 ? <p className="empty-state">No packages yet. Create your first one above.</p> : (
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Offer Price</th><th>Items</th><th>Approval</th><th>Actions</th></tr></thead>
            <tbody>
              {packages.map(p => (
                <tr key={p.id} className={!p.active ? 'row-inactive' : ''}>
                  <td>{p.name}</td>
                  <td>{p.category_name}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td><strong>{formatPrice(p.offer_price)}</strong></td>
                  <td>{p.items.length}</td>
                  <td>
                    <span className="status-badge" style={{ background: APPROVAL_COLORS[p.approval_status] || '#999' }}>
                      {p.approval_status === 'pending_approval' ? 'Pending' : p.approval_status}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button className="btn-approve" onClick={() => startEdit(p)}>Edit</button>
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
