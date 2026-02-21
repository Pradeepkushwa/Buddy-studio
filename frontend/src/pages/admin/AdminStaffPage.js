import { useState, useEffect, useCallback } from 'react';
import api from '../../api';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchStaff = useCallback(async () => {
    try { const res = await api.get('/admin/staff'); setStaff(res.data.staff); } catch {}
  }, []);

  useEffect(() => { fetchStaff().finally(() => setLoading(false)); }, [fetchStaff]);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try { await api.patch(`/admin/staff/${id}/${action}`); fetchStaff(); } catch {}
    finally { setActionLoading(null); }
  };

  if (loading) return <p className="empty-state">Loading...</p>;

  return (
    <div>
      <h2 className="admin-page-title">Staff Members ({staff.length})</h2>
      {staff.length === 0 ? <p className="empty-state">No staff members yet.</p> : (
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Verified</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id}>
                  <td>{s.name || '\u2014'}</td><td>{s.email}</td><td>{s.mobile_number || '\u2014'}</td>
                  <td>{s.email_verified ? 'Yes' : 'No'}</td>
                  <td><span className={`status-badge status-${s.verification_status}`}>{s.verification_status}</span></td>
                  <td>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="action-cell">
                    {s.verification_status !== 'approved' && <button className="btn-approve" onClick={() => handleAction(s.id, 'approve')} disabled={actionLoading === s.id}>Approve</button>}
                    {s.verification_status === 'approved' && <button className="btn-reject" onClick={() => handleAction(s.id, 'reject')} disabled={actionLoading === s.id}>Revoke</button>}
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
