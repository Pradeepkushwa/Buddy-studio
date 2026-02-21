import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [apptForm, setApptForm] = useState({ name: '', email: '', mobile_number: '', preferred_date: '', event_type: '', message: '' });
  const [apptMsg, setApptMsg] = useState('');
  const [apptErr, setApptErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories)).catch(() => {});
    api.get('/packages').then(r => setFeatured(r.data.packages.filter(p => p.featured))).catch(() => {});
  }, []);

  const handleAppt = async (e) => {
    e.preventDefault();
    setApptErr(''); setApptMsg(''); setSubmitting(true);
    try {
      const res = await api.post('/appointments', { appointment: apptForm });
      setApptMsg(res.data.message);
      setApptForm({ name: '', email: '', mobile_number: '', preferred_date: '', event_type: '', message: '' });
    } catch (err) {
      setApptErr(err.response?.data?.errors?.join(', ') || 'Something went wrong');
    } finally { setSubmitting(false); }
  };

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  return (
    <div className="home-page">
      <Navbar />

      <section className="hero">
        <div className="hero-content">
          <h1>Capture Your Perfect Moments</h1>
          <p>Professional photography and videography for weddings, birthdays, events, and more.</p>
          <div className="hero-actions">
            <Link to="/packages" className="btn-hero">View Packages</Link>
            <a href="#appointment" className="btn-hero-outline">Book Appointment</a>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="section" id="categories">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Choose from our range of professional packages</p>
          <div className="category-grid">
            {categories.map(c => (
              <div key={c.id} className="category-card" onClick={() => navigate(`/packages?category=${c.id}`)}>
                <div className="category-icon">
                  {c.name.includes('Wedding') ? '\uD83D\uDC8D' : c.name.includes('Birthday') ? '\uD83C\uDF82' : c.name.includes('Personal') ? '\uD83D\uDCF7' : '\uD83C\uDF89'}
                </div>
                <h3>{c.name}</h3>
                <p>{c.description}</p>
                {c.packages_count > 0 && <span className="category-count">{c.packages_count} package{c.packages_count !== 1 ? 's' : ''}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="section section-alt" id="packages">
          <h2 className="section-title">Featured Packages</h2>
          <p className="section-subtitle">Special offers handpicked for you</p>
          <div className="package-grid">
            {featured.map(p => (
              <div key={p.id} className="package-card">
                {p.discount_percentage > 0 && <span className="discount-badge">{p.discount_percentage}% OFF</span>}
                <span className="package-category">{p.category_name}</span>
                <h3>{p.name}</h3>
                <p className="package-desc">{p.description?.substring(0, 100)}{p.description?.length > 100 ? '...' : ''}</p>
                <div className="package-pricing">
                  {p.discount_percentage > 0 && <span className="original-price">{formatPrice(p.price)}</span>}
                  <span className="offer-price">{formatPrice(p.offer_price)}</span>
                </div>
                <Link to={`/packages/${p.id}`} className="btn-view-details">View Details</Link>
              </div>
            ))}
          </div>
          <div className="section-cta">
            <Link to="/packages" className="btn-hero-outline">View All Packages</Link>
          </div>
        </section>
      )}

      <section className="section" id="appointment">
        <h2 className="section-title">Book an Appointment</h2>
        <p className="section-subtitle">Fill in your details and our team will contact you soon</p>
        <div className="appt-form-wrapper">
          {apptMsg && <div className="auth-success">{apptMsg}</div>}
          {apptErr && <div className="auth-error">{apptErr}</div>}
          <form onSubmit={handleAppt} className="appt-form">
            <div className="appt-form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input name="name" value={apptForm.name} onChange={e => setApptForm({...apptForm, name: e.target.value})} required placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input name="email" type="email" value={apptForm.email} onChange={e => setApptForm({...apptForm, email: e.target.value})} required placeholder="you@email.com" />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input name="mobile_number" type="tel" value={apptForm.mobile_number} onChange={e => setApptForm({...apptForm, mobile_number: e.target.value})} placeholder="+91 9876543210" />
              </div>
              <div className="form-group">
                <label>Preferred Date</label>
                <input name="preferred_date" type="date" value={apptForm.preferred_date} onChange={e => setApptForm({...apptForm, preferred_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Event Type</label>
                <select name="event_type" value={apptForm.event_type} onChange={e => setApptForm({...apptForm, event_type: e.target.value})}>
                  <option value="">Select event type</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea name="message" value={apptForm.message} onChange={e => setApptForm({...apptForm, message: e.target.value})} rows={3} placeholder="Tell us about your event..." />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting} style={{maxWidth: 320}}>
              {submitting ? 'Submitting...' : 'Request Appointment'}
            </button>
          </form>
        </div>
      </section>

      <footer className="site-footer">
        <p>BuddyStudio &mdash; Professional Photography &amp; Videography</p>
      </footer>
    </div>
  );
}
