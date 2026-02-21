import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api';

export default function BookingForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    event_start_date: '',
    event_end_date: '',
    event_address: '',
    phone_number: '',
    email: '',
    alternate_contact_number: '',
    notes: ''
  });

  useEffect(() => {
    api.get(`/packages/${id}`)
      .then(r => {
        setPkg(r.data.package);
        setForm(f => ({ ...f, email: user?.email || '', phone_number: user?.mobile_number || '' }));
      })
      .catch(() => setPkg(null))
      .finally(() => setLoading(false));
  }, [id, user]);

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    if (!phoneRegex.test(form.phone_number)) {
      setError('Please enter a valid phone number (7-15 digits)');
      return;
    }
    if (form.alternate_contact_number && !phoneRegex.test(form.alternate_contact_number)) {
      setError('Please enter a valid alternate contact number');
      return;
    }
    if (form.event_end_date < form.event_start_date) {
      setError('End date must be on or after start date');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/bookings', { booking: { ...form, package_id: id } });
      navigate(`/bookings/${res.data.booking.id}/payment`);
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="home-page"><Navbar /><p className="empty-state">Loading...</p></div>;
  if (!pkg) return <div className="home-page"><Navbar /><p className="empty-state">Package not found. <Link to="/packages">Browse packages</Link></p></div>;

  return (
    <div className="home-page">
      <Navbar />
      <div className="page-header">
        <Link to={`/packages/${id}`} className="back-link">&larr; Back to Package</Link>
        <h1>Book: {pkg.name}</h1>
      </div>

      <section className="section">
        <div className="booking-form-layout">
          <div className="booking-package-summary">
            <h3>Package Summary</h3>
            <p className="package-category">{pkg.category_name}</p>
            <div className="package-pricing">
              {pkg.discount_percentage > 0 && (
                <span className="original-price">{formatPrice(pkg.price)}</span>
              )}
              <span className="offer-price-lg">{formatPrice(pkg.offer_price)}</span>
            </div>
            <p className="booking-note">Amount will be confirmed upon booking</p>
          </div>

          <div className="booking-form-wrapper">
            <h3>Event Details</h3>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="appt-form-grid">
                <div className="form-group">
                  <label>Event Start Date *</label>
                  <input type="date" name="event_start_date" value={form.event_start_date}
                    onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label>Event End Date *</label>
                  <input type="date" name="event_end_date" value={form.event_end_date}
                    onChange={handleChange} required min={form.event_start_date || new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group full-width">
                  <label>Event Address / Venue *</label>
                  <textarea name="event_address" value={form.event_address}
                    onChange={handleChange} required rows={2} placeholder="Full venue address" />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" name="phone_number" value={form.phone_number}
                    onChange={handleChange} required placeholder="+91 9876543210" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={form.email}
                    onChange={handleChange} required placeholder="you@email.com" />
                </div>
                <div className="form-group">
                  <label>Alternate Contact Number</label>
                  <input type="tel" name="alternate_contact_number" value={form.alternate_contact_number}
                    onChange={handleChange} placeholder="+91 9876543210" />
                </div>
              </div>
              <div className="form-group">
                <label>Special Requests / Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange}
                  rows={3} placeholder="Any special requirements or preferences..." />
              </div>
              <button type="submit" className="btn-primary" disabled={submitting} style={{ maxWidth: 320 }}>
                {submitting ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
