import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';

export default function Packages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeCat = searchParams.get('category') || '';

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = activeCat ? `/packages?category_id=${activeCat}` : '/packages';
    api.get(url)
      .then(r => setPackages(r.data.packages))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCat]);

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const setCategory = (id) => {
    if (id) setSearchParams({ category: id });
    else setSearchParams({});
  };

  return (
    <div className="home-page">
      <Navbar />
      <div className="page-header">
        <h1>Our Packages</h1>
        <p>Professional photography and videography packages for every occasion</p>
      </div>

      <section className="section">
        <div className="filter-tabs">
          <button className={`filter-tab ${!activeCat ? 'filter-active' : ''}`} onClick={() => setCategory('')}>All</button>
          {categories.map(c => (
            <button key={c.id} className={`filter-tab ${activeCat === String(c.id) ? 'filter-active' : ''}`} onClick={() => setCategory(c.id)}>{c.name}</button>
          ))}
        </div>

        {loading ? (
          <p className="empty-state">Loading packages...</p>
        ) : packages.length === 0 ? (
          <p className="empty-state">No packages available in this category yet.</p>
        ) : (
          <div className="package-grid">
            {packages.map(p => (
              <div key={p.id} className="package-card">
                {p.discount_percentage > 0 && <span className="discount-badge">{p.discount_percentage}% OFF</span>}
                <span className="package-category">{p.category_name}</span>
                <h3>{p.name}</h3>
                <p className="package-desc">{p.description?.substring(0, 120)}{p.description?.length > 120 ? '...' : ''}</p>
                <div className="package-meta">
                  <span>{p.items_count} item{p.items_count !== 1 ? 's' : ''} included</span>
                </div>
                <div className="package-pricing">
                  {p.discount_percentage > 0 && <span className="original-price">{formatPrice(p.price)}</span>}
                  <span className="offer-price">{formatPrice(p.offer_price)}</span>
                </div>
                <Link to={`/packages/${p.id}`} className="btn-view-details">View Details</Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
