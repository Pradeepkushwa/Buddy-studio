import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gallery')
      .then(r => {
        setItems(r.data.gallery_items);
        setCategories(['All', ...r.data.categories]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory);

  if (loading) return <div className="home-page"><Navbar /><p className="empty-state">Loading...</p></div>;

  return (
    <div className="home-page">
      <Navbar />
      <div className="page-header">
        <h1>Our Gallery</h1>
        <p className="section-subtitle">Moments we've captured</p>
      </div>

      <section className="section">
        <div className="filter-tabs">
          {categories.map(c => (
            <button key={c} className={`filter-tab ${activeCategory === c ? 'filter-tab-active' : ''}`}
              onClick={() => setActiveCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="empty-state">No items in this category yet.</p>
        ) : (
          <div className="gallery-grid">
            {filtered.map(item => (
              <div key={item.id} className="gallery-item">
                {item.media_type === 'video' ? (
                  <div className="gallery-video-wrapper">
                    <iframe src={item.media_url} title={item.title} frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                      allowFullScreen />
                  </div>
                ) : (
                  <img src={item.media_url} alt={item.title} className="gallery-image" />
                )}
                <div className="gallery-item-info">
                  <h4>{item.title}</h4>
                  {item.description && <p>{item.description}</p>}
                  <span className="gallery-category-tag">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="site-footer">
        <p>BuddyStudio &mdash; Professional Photography &amp; Videography</p>
      </footer>
    </div>
  );
}
