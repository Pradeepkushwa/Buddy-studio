import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function AdminStaff() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('staff');
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await api.get('/admin/staff');
      setStaff(res.data.staff);
    } catch { /* ignore */ }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await api.get('/admin/customers');
      setCustomers(res.data.customers);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStaff(), fetchCustomers()]).finally(() => setLoading(false));
  }, [fetchStaff, fetchCustomers]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/staff/${id}/approve`);
      fetchStaff();
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/staff/${id}/reject`);
      fetchStaff();
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="auth-logo">BuddyStudio</div>
        <div className="header-right">
          <span className="user-badge">admin</span>
          <span className="user-name">{user?.name}</span>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="dashboard-main">
        <h1>Admin Panel</h1>

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'staff' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            Staff ({staff.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'customers' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            Customers ({customers.length})
          </button>
        </div>

        {loading ? (
          <p className="empty-state">Loading...</p>
        ) : activeTab === 'staff' ? (
          <StaffTable
            staff={staff}
            actionLoading={actionLoading}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ) : (
          <CustomerTable customers={customers} />
        )}
      </main>
    </div>
  );
}

function StaffTable({ staff, actionLoading, onApprove, onReject }) {
  if (staff.length === 0) return <p className="empty-state">No staff members yet.</p>;

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Email Verified</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.id}>
              <td>{s.name || '\u2014'}</td>
              <td>{s.email}</td>
              <td>{s.mobile_number || '\u2014'}</td>
              <td>{s.email_verified ? 'Yes' : 'No'}</td>
              <td>
                <span className={`status-badge status-${s.verification_status}`}>
                  {s.verification_status}
                </span>
              </td>
              <td>{new Date(s.created_at).toLocaleDateString()}</td>
              <td className="action-cell">
                {s.verification_status !== 'approved' && (
                  <button
                    className="btn-approve"
                    onClick={() => onApprove(s.id)}
                    disabled={actionLoading === s.id}
                  >
                    Approve
                  </button>
                )}
                {s.verification_status === 'approved' && (
                  <button
                    className="btn-reject"
                    onClick={() => onReject(s.id)}
                    disabled={actionLoading === s.id}
                  >
                    Revoke
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomerTable({ customers }) {
  if (customers.length === 0) return <p className="empty-state">No customers yet.</p>;

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Email Verified</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.name || '\u2014'}</td>
              <td>{c.email}</td>
              <td>{c.mobile_number || '\u2014'}</td>
              <td>{c.email_verified ? 'Yes' : 'No'}</td>
              <td>{new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
