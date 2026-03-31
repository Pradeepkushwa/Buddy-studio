import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import { useTranslation } from 'react-i18next';

export default function Packages() {
  const { t } = useTranslation();
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
        <h1>{t('packages.title')}</h1>
        <p>{t('packages.subtitle')}</p>
      </div>

      <section className="section">
        <div className="filter-tabs">
          <button className={`filter-tab ${!activeCat ? 'filter-active' : ''}`} onClick={() => setCategory('')}>{t('common.all')}</button>
          {categories.map(c => (
            <button key={c.id} className={`filter-tab ${activeCat === String(c.id) ? 'filter-active' : ''}`} onClick={() => setCategory(c.id)}>{c.name}</button>
          ))}
        </div>

        {loading ? (
          <p className="empty-state">{t('packages.loading')}</p>
        ) : packages.length === 0 ? (
          <p className="empty-state">{t('packages.no_packages')}</p>
        ) : (
          <div className="package-grid">
            {packages.map(p => (
              <div key={p.id} className="package-card">
                {p.discount_percentage > 0 && <span className="discount-badge">{p.discount_percentage}% OFF</span>}
                <span className="package-category">{p.category_name}</span>
                <h3>{p.name}</h3>
                <p className="package-desc">{p.description?.substring(0, 120)}{p.description?.length > 120 ? '...' : ''}</p>
                <div className="package-meta">
                  <span>{p.items_count} {p.items_count !== 1 ? t('common.items_included_plural', { count: p.items_count }) : t('common.items_included', { count: p.items_count })}</span>
                </div>
                <div className="package-pricing">
                  {p.discount_percentage > 0 && <span className="original-price">{formatPrice(p.price)}</span>}
                  <span className="offer-price">{formatPrice(p.offer_price)}</span>
                </div>
                <Link to={`/packages/${p.id}`} className="btn-view-details">{t('common.view_details')}</Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
