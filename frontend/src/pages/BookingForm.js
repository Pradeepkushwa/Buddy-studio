import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api';
import { useTranslation } from 'react-i18next';

export default function BookingForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      setError(t('booking.phone_error'));
      return;
    }
    if (form.alternate_contact_number && !phoneRegex.test(form.alternate_contact_number)) {
      setError(t('booking.alt_phone_error'));
      return;
    }
    if (form.event_end_date < form.event_start_date) {
      setError(t('booking.date_error'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/bookings', { booking: { ...form, package_id: id } });
      navigate(`/bookings/${res.data.booking.id}/payment`);
    } catch (err) {
      const msg = err.response?.data?.error || (Array.isArray(err.response?.data?.errors) ? err.response?.data?.errors.join(', ') : null) || (err.response?.status === 401 ? 'Please log in again.' : err.response?.status === 403 ? 'Account pending approval.' : t('common.something_went_wrong'));
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="home-page"><Navbar /><p className="empty-state">{t('common.loading')}</p></div>;
  if (!pkg) return <div className="home-page"><Navbar /><p className="empty-state">{t('booking.package_not_found')} <Link to="/packages">{t('common.browse_packages')}</Link></p></div>;

  return (
    <div className="home-page">
      <Navbar />
      <div className="page-header">
        <Link to={`/packages/${id}`} className="back-link">&larr; {t('booking.back_to_package')}</Link>
        <h1>{t('booking.book_title', { name: pkg.name })}</h1>
      </div>

      <section className="section">
        <div className="booking-form-layout">
          <div className="booking-package-summary">
            <h3>{t('booking.package_summary')}</h3>
            <p className="package-category">{pkg.category_name}</p>
            <div className="package-pricing">
              {pkg.discount_percentage > 0 && (
                <span className="original-price">{formatPrice(pkg.price)}</span>
              )}
              <span className="offer-price-lg">{formatPrice(pkg.offer_price)}</span>
            </div>
            <p className="booking-note">{t('booking.amount_note')}</p>
          </div>

          <div className="booking-form-wrapper">
            <h3>{t('booking.event_details')}</h3>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="appt-form-grid">
                <div className="form-group">
                  <label>{t('booking.start_date')}</label>
                  <input type="date" name="event_start_date" value={form.event_start_date}
                    onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label>{t('booking.end_date')}</label>
                  <input type="date" name="event_end_date" value={form.event_end_date}
                    onChange={handleChange} required min={form.event_start_date || new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group full-width">
                  <label>{t('booking.address')}</label>
                  <textarea name="event_address" value={form.event_address}
                    onChange={handleChange} required rows={2} placeholder={t('booking.address_placeholder')} />
                </div>
                <div className="form-group">
                  <label>{t('booking.phone')}</label>
                  <input type="tel" name="phone_number" value={form.phone_number}
                    onChange={handleChange} required placeholder={t('booking.phone_placeholder')} />
                </div>
                <div className="form-group">
                  <label>{t('booking.email')}</label>
                  <input type="email" name="email" value={form.email}
                    onChange={handleChange} required placeholder={t('booking.email_placeholder')} />
                </div>
                <div className="form-group">
                  <label>{t('booking.alt_contact')}</label>
                  <input type="tel" name="alternate_contact_number" value={form.alternate_contact_number}
                    onChange={handleChange} placeholder={t('booking.phone_placeholder')} />
                </div>
              </div>
              <div className="form-group">
                <label>{t('booking.notes')}</label>
                <textarea name="notes" value={form.notes} onChange={handleChange}
                  rows={3} placeholder={t('booking.notes_placeholder')} />
              </div>
              <button type="submit" className="btn-primary" disabled={submitting} style={{ maxWidth: 320 }}>
                {submitting ? t('booking.processing') : t('booking.proceed_payment')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
