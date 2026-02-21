import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';

export default function PaymentPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/mine')
      .then(r => {
        const found = r.data.bookings.find(b => b.id === parseInt(id));
        setBooking(found || null);
      })
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  if (loading) return <div className="home-page"><Navbar /><p className="empty-state">Loading...</p></div>;
  if (!booking) return <div className="home-page"><Navbar /><p className="empty-state">Booking not found. <Link to="/my-bookings">My Bookings</Link></p></div>;

  return (
    <div className="home-page">
      <Navbar />
      <div className="page-header">
        <h1>Payment</h1>
      </div>

      <section className="section">
        <div className="payment-card">
          <div className="payment-summary">
            <h3>Booking Summary</h3>
            <div className="payment-row"><span>Package</span><strong>{booking.package_name}</strong></div>
            <div className="payment-row"><span>Event Dates</span><strong>{booking.event_start_date} to {booking.event_end_date}</strong></div>
            <div className="payment-row"><span>Venue</span><strong>{booking.event_address}</strong></div>
            <div className="payment-row"><span>Contact</span><strong>{booking.phone_number}</strong></div>
            <hr />
            <div className="payment-row payment-total"><span>Total Amount</span><strong>{formatPrice(booking.amount)}</strong></div>
          </div>

          <div className="payment-action">
            <button className="btn-primary btn-pay" disabled>Pay Now</button>
            <p className="payment-note">Payment gateway coming soon. Your booking has been recorded and our team will contact you to confirm.</p>
            <div className="payment-links">
              <Link to="/my-bookings" className="btn-hero-outline">View My Bookings</Link>
              <Link to="/packages" className="btn-secondary">Browse More Packages</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
