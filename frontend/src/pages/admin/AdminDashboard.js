import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StarRating({ rating }) {
  return (
    <div className="rating-stars-row">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>★</span>
      ))}
    </div>
  );
}

function OverviewCard({ icon, value, label, accent, iconBg, onClick }) {
  return (
    <div
      className={`dash-stat-card ${accent}${onClick ? ' dash-stat-card-clickable' : ''}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
    >
      <div className={`card-icon-circle ${iconBg}`}>{icon}</div>
      <div className="card-value">{value}</div>
      <div className="card-label">{label}</div>
    </div>
  );
}

function BookingCard({ icon, value, label, accent, iconBg, onClick }) {
  return (
    <div
      className={`dash-stat-card ${accent}${onClick ? ' dash-stat-card-clickable' : ''}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
    >
      <div className={`card-icon-circle ${iconBg}`} style={{ width: 36, height: 36, fontSize: '1rem', marginBottom: 10 }}>{icon}</div>
      <div className="card-value" style={{ fontSize: '1.7rem' }}>{value}</div>
      <div className="card-label">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="empty-state">Loading dashboard...</p>;
  if (!stats)  return <p className="empty-state">Could not load dashboard stats.</p>;

  const ratingPct = stats.reviews.average_rating
    ? ((stats.reviews.average_rating / 5) * 100).toFixed(0)
    : 0;

  return (
    <div className="admin-dashboard-dark">
      {/* Welcome header */}
      <div className="dash-welcome">
        <h2 className="dash-welcome-title">{greeting()}, {user?.name || 'Admin'} 👋</h2>
        <p className="dash-welcome-sub">Here's what's happening with BuddyStudio today.</p>
      </div>

      {/* Overview — 4 top cards */}
      <div className="dash-overview-grid">
        <OverviewCard icon="👥" value={stats.customers}       label="Customers"       accent="accent-blue"   iconBg="icon-blue"   onClick={() => navigate('/admin/customers')} />
        <OverviewCard icon="👨‍💼" value={stats.staff}           label="Staff Members"   accent="accent-purple" iconBg="icon-purple" onClick={() => navigate('/admin/staff')} />
        <OverviewCard icon="🖼️" value={stats.gallery_items}   label="Gallery Items"   accent="accent-green"  iconBg="icon-green"  onClick={() => navigate('/admin/gallery')} />
        <OverviewCard icon="📦" value={stats.packages.active} label="Active Packages" accent="accent-yellow"  iconBg="icon-yellow" onClick={() => navigate('/admin/packages')} />
      </div>

      {/* Bookings section */}
      <div className="dash-section">
        <div className="dash-section-header bdr-yellow" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/bookings')}>
          <span className="dash-section-label">📅 Bookings</span>
          <span className="dash-section-arrow">→</span>
        </div>
        <div className="dash-bookings-grid">
          <BookingCard icon="⏳" value={stats.bookings.pending}   label="Pending"   accent="accent-yellow" iconBg="icon-yellow" onClick={() => navigate('/admin/bookings')} />
          <BookingCard icon="✅" value={stats.bookings.confirmed} label="Confirmed" accent="accent-blue"   iconBg="icon-blue"   onClick={() => navigate('/admin/bookings')} />
          <BookingCard icon="📅" value={stats.bookings.upcoming}  label="Upcoming"  accent="accent-purple" iconBg="icon-purple" onClick={() => navigate('/admin/bookings')} />
          <BookingCard icon="🎊" value={stats.bookings.completed} label="Completed" accent="accent-green"  iconBg="icon-green"  onClick={() => navigate('/admin/bookings')} />
        </div>
      </div>

      {/* Appointments + Reviews side by side */}
      <div className="dash-two-col">

        {/* Appointments */}
        <div className="dash-section">
          <div className="dash-section-header bdr-blue" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/appointments')}>
            <span className="dash-section-label">📋 Appointments</span>
            <span className="dash-section-arrow">→</span>
          </div>
          <div className="dash-stat-card" style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => navigate('/admin/appointments')}>
            <div className="appt-stat-row">
              <span className="appt-stat-label">🆕 New requests</span>
              <span className="appt-stat-value">{stats.appointments.new}</span>
            </div>
            <div className="appt-stat-row">
              <span className="appt-stat-label">📞 Contacted</span>
              <span className="appt-stat-value">{stats.appointments.contacted}</span>
            </div>
            <div className="appt-stat-row">
              <span className="appt-stat-label">📊 Total</span>
              <span className="appt-stat-value">{stats.appointments.total}</span>
            </div>
          </div>
        </div>

        {/* Reviews & Rating */}
        <div className="dash-section">
          <div className="dash-section-header bdr-yellow" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/reviews')}>
            <span className="dash-section-label">⭐ Reviews & Rating</span>
            <span className="dash-section-arrow">→</span>
          </div>
          <div className="dash-stat-card" style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => navigate('/admin/reviews')}>
            <div className="reviews-rating-big">
              <span className="rating-number">{stats.reviews.average_rating || '–'}</span>
              <span className="rating-max">/ 5</span>
            </div>
            <StarRating rating={stats.reviews.average_rating || 0} />
            <div className="rating-bar-wrap">
              <div className="rating-bar-fill" style={{ width: `${ratingPct}%` }} />
            </div>
            <p className="rating-sub">
              {stats.reviews.approved} approved · {stats.reviews.pending} pending · {stats.reviews.total} total
            </p>
            {stats.packages.pending_approval > 0 && (
              <p className="rating-sub" style={{ color: '#f59e0b', marginTop: 8 }}>
                ⚠️ {stats.packages.pending_approval} package{stats.packages.pending_approval > 1 ? 's' : ''} pending approval
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="dash-section">
        <div className="dash-section-header bdr-purple">
          <span className="dash-section-label">⚡ Quick Actions</span>
        </div>
        <div className="dash-quick-actions">
          <button className="dash-action-btn primary" onClick={() => navigate('/admin/packages')}>
            📦 Manage Packages
          </button>
          <button className="dash-action-btn" onClick={() => navigate('/admin/bookings')}>
            📅 View Bookings
            {stats.bookings.pending > 0 && (
              <span style={{ background: '#f59e0b', color: '#000', borderRadius: 6, padding: '1px 7px', fontSize: '0.75rem', fontWeight: 700 }}>
                {stats.bookings.pending}
              </span>
            )}
          </button>
          <button className="dash-action-btn" onClick={() => navigate('/admin/appointments')}>
            📋 Appointments
            {stats.appointments.new > 0 && (
              <span style={{ background: '#3b82f6', color: '#fff', borderRadius: 6, padding: '1px 7px', fontSize: '0.75rem', fontWeight: 700 }}>
                {stats.appointments.new}
              </span>
            )}
          </button>
          <button className="dash-action-btn" onClick={() => navigate('/admin/reviews')}>
            ⭐ Reviews
            {stats.reviews.pending > 0 && (
              <span style={{ background: '#8b5cf6', color: '#fff', borderRadius: 6, padding: '1px 7px', fontSize: '0.75rem', fontWeight: 700 }}>
                {stats.reviews.pending}
              </span>
            )}
          </button>
          <button className="dash-action-btn" onClick={() => navigate('/admin/staff')}>
            👨‍💼 Staff
          </button>
          <button className="dash-action-btn" onClick={() => navigate('/admin/gallery')}>
            🖼️ Gallery
          </button>
          <button className="dash-action-btn primary" onClick={() => navigate('/admin/revenue')} style={{ borderColor: '#22c55e', color: '#22c55e' }}>
            💰 Revenue Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
