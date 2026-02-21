import { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/customers').then(r => setCustomers(r.data.customers)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="empty-state">Loading...</p>;

  return (
    <div>
      <h2 className="admin-page-title">Customers ({customers.length})</h2>
      {customers.length === 0 ? <p className="empty-state">No customers yet.</p> : (
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Verified</th><th>Joined</th></tr></thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td>{c.name || '\u2014'}</td><td>{c.email}</td><td>{c.mobile_number || '\u2014'}</td>
                  <td>{c.email_verified ? 'Yes' : 'No'}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
