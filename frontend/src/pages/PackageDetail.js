import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api';

const TYPE_LABELS = {
  photography_camera: 'Photography Camera',
  videography_camera: 'Videography Camera',
  drone: 'Drone',
  lighting: 'Lighting',
  album: 'Album',
  video: 'Video',
  other: 'Other'
};

export default function PackageDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInquiry, setShowInquiry] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', mobile_number: '', preferred_date: '', message: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/packages/${id}`)
      .then(r => setPkg(r.data.package))
      .catch(() => setPkg(null))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handleBookNow = () => {
    if (!token || !user) {
      navigate(`/signup?redirect=/packages/${id}`);
      return;
    }
    setShowInquiry(true);
    setForm(f => ({ ...f, name: user.name || '', email: user.email || '', mobile_number: user.mobile_number || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setMsg(''); setSubmitting(true);
    try {
      const res = await api.post('/appointments', {
        appointment: { ...form, package_id: pkg.id, event_type: pkg.category_name }
      });
      setMsg(res.data.message);
      setShowInquiry(false);
    } catch (error) {
      setErr(error.response?.data?.errors?.join(', ') || 'Something went wrong');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="home-page"><Navbar /><p className="empty-state">Loading...</p></div>;
  if (!pkg) return <div className="home-page"><Navbar /><p className="empty-state">Package not found. <Link to="/packages">Browse packages</Link></p></div>;

  return (
    <div className="home-page">
      <Navbar />
      <div className="page-header">
        <Link to="/packages" className="back-link">&larr; Back to Packages</Link>
        <h1>{pkg.name}</h1>
        <span className="package-category">{pkg.category_name}</span>
      </div>

      <section className="section detail-section">
        <div className="detail-grid">
          <div className="detail-main">
            <p className="detail-description">{pkg.description}</p>

            <h3 className="detail-subtitle">What's Included</h3>
            <div className="items-list">
              {pkg.items.map(item => (
                <div key={item.id} className="item-row">
                  <span className="item-type-badge">{TYPE_LABELS[item.equipment_type] || item.equipment_type}</span>
                  <div className="item-info">
                    <strong>{item.quantity}x</strong> {item.equipment_name}
                    {item.notes && <span className="item-notes">{item.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="price-card">
              <div className="package-pricing">
                {pkg.discount_percentage > 0 && (
                  <>
                    <span className="original-price">{formatPrice(pkg.price)}</span>
                    <span className="discount-badge-inline">{pkg.discount_percentage}% OFF</span>
                  </>
                )}
                <span className="offer-price-lg">{formatPrice(pkg.offer_price)}</span>
              </div>
              <button className="btn-primary" onClick={handleBookNow}>Book Now</button>
              <p className="price-note">Our team will contact you to confirm details</p>
            </div>
          </div>
        </div>

        {msg && <div className="auth-success" style={{marginTop: 24}}>{msg}</div>}

        {showInquiry && (
          <div className="inquiry-form-wrapper">
            <h3>Complete Your Booking Request</h3>
            {err && <div className="auth-error">{err}</div>}
            <form onSubmit={handleSubmit}>
              <div className="appt-form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input type="tel" value={form.mobile_number} onChange={e => setForm({...form, mobile_number: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Preferred Date</label>
                  <input type="date" value={form.preferred_date} onChange={e => setForm({...form, preferred_date: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3} placeholder="Any special requests..." />
              </div>
              <div className="inquiry-actions">
                <button type="submit" className="btn-primary" disabled={submitting} style={{maxWidth: 240}}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowInquiry(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
