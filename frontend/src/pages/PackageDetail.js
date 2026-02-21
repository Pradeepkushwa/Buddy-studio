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
      navigate(`/login?redirect=/book/${id}`);
      return;
    }
    navigate(`/book/${id}`);
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
              <p className="price-note">Secure your event dates today</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
