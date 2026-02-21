import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  upcoming: '#8b5cf6',
  completed: '#22c55e',
  cancelled: '#ef4444'
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/mine')
      .then(r => setBookings(r.data.bookings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  if (loading) return <div className="home-page"><Navbar /><p className="empty-state">Loading...</p></div>;

  return (
    <div className="home-page">
      <Navbar />
      <div className="page-header">
        <h1>My Bookings</h1>
        <p className="section-subtitle">Track the status of your event bookings</p>
      </div>

      <section className="section">
        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>No bookings yet.</p>
            <Link to="/packages" className="btn-primary" style={{ display: 'inline-block', marginTop: 16 }}>Browse Packages</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(b => (
              <div key={b.id} className="booking-card">
                <div className="booking-card-header">
                  <h3>{b.package_name}</h3>
                  <span className="status-badge" style={{ background: STATUS_COLORS[b.status] || '#999' }}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                </div>
                <div className="booking-card-details">
                  <div className="booking-detail-row"><span>Event Dates:</span> {b.event_start_date} to {b.event_end_date}</div>
                  <div className="booking-detail-row"><span>Venue:</span> {b.event_address}</div>
                  <div className="booking-detail-row"><span>Contact:</span> {b.phone_number}</div>
                  <div className="booking-detail-row"><span>Amount:</span> <strong>{formatPrice(b.amount)}</strong></div>
                  {b.notes && <div className="booking-detail-row"><span>Notes:</span> {b.notes}</div>}
                </div>
                <div className="booking-card-footer">
                  <span className="booking-date">Booked on {new Date(b.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
