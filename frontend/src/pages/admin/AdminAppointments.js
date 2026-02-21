import { useState, useEffect, useCallback } from 'react';
import api from '../../api';

const STATUSES = ['new', 'contacted', 'completed', 'cancelled'];
const STATUS_COLORS = { new: 'status-verified', contacted: 'status-pending', completed: 'status-approved', cancelled: 'status-pending' };

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetch = useCallback(async () => {
    try { const r = await api.get('/admin/appointments'); setAppointments(r.data.appointments); } catch {}
  }, []);

  useEffect(() => { fetch().finally(() => setLoading(false)); }, [fetch]);

  const updateStatus = async (id, status) => {
    setActionLoading(id);
    try { await api.patch(`/admin/appointments/${id}`, { status }); fetch(); } catch {}
    finally { setActionLoading(null); }
  };

  if (loading) return <p className="empty-state">Loading...</p>;

  const newCount = appointments.filter(a => a.status === 'new').length;

  return (
    <div>
      <h2 className="admin-page-title">
        Appointments ({appointments.length})
        {newCount > 0 && <span className="new-badge">{newCount} new</span>}
      </h2>
      {appointments.length === 0 ? <p className="empty-state">No appointment requests yet.</p> : (
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Package</th><th>Event</th><th>Date</th><th>Status</th><th>Received</th><th>Actions</th></tr></thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id} className={a.status === 'new' ? 'row-highlight' : ''}>
                  <td>{a.name}</td>
                  <td>{a.email}</td>
                  <td>{a.mobile_number || '\u2014'}</td>
                  <td>{a.package_name || '\u2014'}</td>
                  <td>{a.event_type || '\u2014'}</td>
                  <td>{a.preferred_date || '\u2014'}</td>
                  <td><span className={`status-badge ${STATUS_COLORS[a.status] || ''}`}>{a.status}</span></td>
                  <td>{new Date(a.created_at).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={a.status}
                      onChange={e => updateStatus(a.id, e.target.value)}
                      disabled={actionLoading === a.id}
                      className="status-select"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
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
