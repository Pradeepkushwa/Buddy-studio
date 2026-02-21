import { useState, useEffect } from 'react';
import api from '../../api';

const STATUSES = ['pending', 'confirmed', 'upcoming', 'completed', 'cancelled'];
const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  upcoming: '#8b5cf6',
  completed: '#22c55e',
  cancelled: '#ef4444'
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  const fetchBookings = (status) => {
    setLoading(true);
    api.get(`/admin/bookings?status=${status}`)
      .then(r => setBookings(r.data.bookings))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(tab); }, [tab]);

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/admin/bookings/${id}`, { status: newStatus });
      fetchBookings(tab);
    } catch {}
  };

  return (
    <div>
      <h2 className="admin-page-title">Bookings</h2>

      <div className="filter-tabs">
        {STATUSES.map(s => (
          <button key={s} className={`filter-tab ${tab === s ? 'filter-tab-active' : ''}`} onClick={() => setTab(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <p className="empty-state">Loading...</p> : bookings.length === 0 ? (
        <p className="empty-state">No {tab} bookings</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Package</th>
                <th>Event Dates</th>
                <th>Venue</th>
                <th>Phone</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>{b.user_name}<br /><small>{b.user_email}</small></td>
                  <td>{b.package_name}</td>
                  <td>{b.event_start_date}<br />to {b.event_end_date}</td>
                  <td>{b.event_address}</td>
                  <td>{b.phone_number}{b.alternate_contact_number && <><br /><small>Alt: {b.alternate_contact_number}</small></>}</td>
                  <td>{formatPrice(b.amount)}</td>
                  <td>
                    <span className="status-badge" style={{ background: STATUS_COLORS[b.status] }}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <select value={b.status} onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      className="status-select">
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
