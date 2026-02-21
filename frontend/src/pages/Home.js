import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import api from '../api';

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [apptForm, setApptForm] = useState({ name: '', email: '', mobile_number: '', preferred_date: '', event_type: '', message: '' });
  const [apptMsg, setApptMsg] = useState('');
  const [apptErr, setApptErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', rating: 5, feedback: '' });
  const [reviewMsg, setReviewMsg] = useState('');
  const [reviewErr, setReviewErr] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories)).catch(() => {});
    api.get('/packages').then(r => {
      const sorted = [...r.data.packages].sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
      setFeatured(sorted.slice(0, 3));
    }).catch(() => {});
    api.get('/gallery').then(r => setGallery(r.data.gallery_items.slice(0, 6))).catch(() => {});
    api.get('/reviews').then(r => {
      setReviews(r.data.reviews.slice(0, 6));
      setAvgRating(r.data.average_rating);
      setTotalReviews(r.data.total_reviews);
    }).catch(() => {});
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewErr(''); setReviewMsg(''); setReviewSubmitting(true);
    try {
      const res = await api.post('/reviews', { review: reviewForm });
      setReviewMsg(res.data.message);
      setReviewForm({ name: '', email: '', rating: 5, feedback: '' });
      setShowReviewForm(false);
    } catch (err) {
      setReviewErr(err.response?.data?.errors?.join(', ') || 'Something went wrong');
    } finally { setReviewSubmitting(false); }
  };

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  return (
    <div className="home-page">
      <Navbar />

      <section className="hero">
        <div className="hero-content">
          <h1>Capture Your Perfect Moments</h1>
          <p>Professional photography and videography for weddings, birthdays, events, and more.</p>
          {totalReviews > 0 && (
            <div className="hero-rating">
              <StarRating rating={Math.round(avgRating)} size={22} />
              <span>{avgRating} / 5 ({totalReviews} reviews)</span>
            </div>
          )}
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
          <div className="package-grid featured-grid">
            {featured.slice(0, 3).map(p => (
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

      {gallery.length > 0 && (
        <section className="section" id="gallery">
          <h2 className="section-title">Our Work</h2>
          <p className="section-subtitle">A glimpse of moments we've captured</p>
          <div className="gallery-grid gallery-preview">
            {gallery.map(item => (
              <div key={item.id} className="gallery-item">
                {item.media_type === 'photo' ? (
                  <img src={item.media_url} alt={item.title} className="gallery-image" />
                ) : (
                  <div className="gallery-video-wrapper">
                    <iframe src={item.media_url} title={item.title} frameBorder="0" allowFullScreen />
                  </div>
                )}
                <div className="gallery-item-info">
                  <h4>{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
          <div className="section-cta">
            <Link to="/gallery" className="btn-hero-outline">View Full Gallery</Link>
          </div>
        </section>
      )}

      <section className="section section-alt" id="reviews">
        <div className="reviews-header">
          <div>
            <h2 className="section-title" style={{ textAlign: 'left' }}>What Our Clients Say</h2>
            {totalReviews > 0 && (
              <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
                <StarRating rating={Math.round(avgRating)} size={18} /> {avgRating}/5 ({totalReviews} reviews)
              </p>
            )}
          </div>
          <button className="btn-rate-us" onClick={() => setShowReviewForm(true)}>Rate Us</button>
        </div>
        {reviews.length > 0 ? (
          <div className="reviews-scroll-container">
            <div className="reviews-scroll">
              {reviews.slice(0, 3).map(r => (
                <div key={r.id} className="review-card review-card-scroll">
                  <StarRating rating={r.rating} size={18} />
                  <p className="review-feedback">"{r.feedback}"</p>
                  <span className="review-author">- {r.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </section>

      {showReviewForm && (
        <div className="modal-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Share Your Experience</h3>
            {reviewMsg && <div className="auth-success">{reviewMsg}</div>}
            {reviewErr && <div className="auth-error">{reviewErr}</div>}
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label>Your Name *</label>
                <input value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={reviewForm.email} onChange={e => setReviewForm({...reviewForm, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Rating *</label>
                <StarRating rating={reviewForm.rating} onChange={(r) => setReviewForm({...reviewForm, rating: r})} size={28} />
              </div>
              <div className="form-group">
                <label>Your Feedback</label>
                <textarea value={reviewForm.feedback} onChange={e => setReviewForm({...reviewForm, feedback: e.target.value})} rows={3} placeholder="Tell us about your experience..." />
              </div>
              <div className="inquiry-actions">
                <button type="submit" className="btn-primary" disabled={reviewSubmitting}>
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowReviewForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
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
