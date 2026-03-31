import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useTranslation } from 'react-i18next';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  upcoming: '#8b5cf6',
  completed: '#22c55e',
  cancelled: '#ef4444'
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (user?.role === 'user') {
      api.get('/bookings/mine')
        .then(r => setBookings(r.data.bookings))
        .catch(() => {})
        .finally(() => setLoadingBookings(false));
    } else {
      setLoadingBookings(false);
    }
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };
  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const pendingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const recentBookings = bookings.slice(0, 3);
  const avatarSrc = user?.avatar_url ? `${API_BASE}${user.avatar_url}` : null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="auth-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>BuddyStudio</div>
        <div className="header-right">
          <span className="user-badge">{user?.role}</span>
          <span className="user-name">{user?.name}</span>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/')}>{t('dashboard.home')}</button>
          <button className="btn-secondary btn-sm" onClick={handleLogout}>{t('common.logout')}</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-welcome">
          <div className="dashboard-welcome-left">
            <div className="dashboard-avatar" onClick={() => navigate('/profile')}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="dashboard-avatar-img" />
              ) : (
                <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              )}
            </div>
            <div>
              <h1>{t('dashboard.welcome', { name: user?.name?.split(' ')[0] || 'User' })}</h1>
              <p className="dashboard-subtitle">{user?.email}</p>
            </div>
          </div>
          <button className="btn-primary btn-sm" onClick={() => navigate('/profile')}>{t('dashboard.edit_profile')}</button>
        </div>

        {user?.role === 'user' && (
          <div className="dashboard-stats-row">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-number">{bookings.length}</div>
              <div className="dashboard-stat-label">{t('dashboard.total_bookings')}</div>
            </div>
            <div className="dashboard-stat-card stat-pending">
              <div className="dashboard-stat-number">{pendingBookings.length}</div>
              <div className="dashboard-stat-label">{t('dashboard.active')}</div>
            </div>
            <div className="dashboard-stat-card stat-completed">
              <div className="dashboard-stat-number">{completedCount}</div>
              <div className="dashboard-stat-label">{t('dashboard.completed')}</div>
            </div>
          </div>
        )}

        {user?.role === 'admin' && (
          <div className="dashboard-quick-actions">
            <h3>{t('dashboard.quick_actions')}</h3>
            <div className="quick-actions-grid">
              <button className="quick-action-card" onClick={() => navigate('/admin/dashboard')}>{t('dashboard.admin_dashboard')}</button>
              <button className="quick-action-card" onClick={() => navigate('/admin/bookings')}>{t('dashboard.manage_bookings')}</button>
              <button className="quick-action-card" onClick={() => navigate('/admin/packages')}>{t('dashboard.manage_packages')}</button>
              <button className="quick-action-card" onClick={() => navigate('/admin/staff')}>{t('dashboard.manage_staff')}</button>
              <button className="quick-action-card" onClick={() => navigate('/profile')}>{t('dashboard.my_profile')}</button>
            </div>
          </div>
        )}

        {user?.role === 'staff' && (
          <div className="dashboard-quick-actions">
            <h3>{t('dashboard.quick_actions')}</h3>
            <div className="quick-actions-grid">
              <button className="quick-action-card" onClick={() => navigate('/staff/equipment')}>{t('dashboard.equipment')}</button>
              <button className="quick-action-card" onClick={() => navigate('/staff/packages')}>{t('dashboard.my_packages')}</button>
              <button className="quick-action-card" onClick={() => navigate('/profile')}>{t('dashboard.my_profile')}</button>
            </div>
          </div>
        )}

        {user?.role === 'user' && (
          <>
            {pendingBookings.length > 0 && (
              <div className="dashboard-bookings-section">
                <h3>{t('dashboard.active_bookings', { count: pendingBookings.length })}</h3>
                <div className="dashboard-bookings-list">
                  {pendingBookings.map(b => (
                    <div key={b.id} className="dashboard-booking-card">
                      <div className="dashboard-booking-header">
                        <strong>{b.package_name}</strong>
                        <span className="status-badge" style={{ background: STATUS_COLORS[b.status] || '#999', color: '#fff' }}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </div>
                      <div className="dashboard-booking-meta">
                        <span>{b.event_start_date} - {b.event_end_date}</span>
                        <strong>{formatPrice(b.amount)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="dashboard-bookings-section">
              <div className="dashboard-section-header">
                <h3>{t('dashboard.recent_bookings')}</h3>
                <Link to="/my-bookings" className="btn-secondary btn-sm">{t('dashboard.view_all')}</Link>
              </div>
              {loadingBookings ? (
                <p className="empty-state">{t('common.loading')}</p>
              ) : recentBookings.length === 0 ? (
                <div className="empty-state">
                  <p>{t('dashboard.no_bookings')}</p>
                  <Link to="/packages" className="btn-primary" style={{ display: 'inline-block', maxWidth: 200, marginTop: 12 }}>{t('dashboard.browse_packages')}</Link>
                </div>
              ) : (
                <div className="dashboard-bookings-list">
                  {recentBookings.map(b => (
                    <div key={b.id} className="dashboard-booking-card">
                      <div className="dashboard-booking-header">
                        <strong>{b.package_name}</strong>
                        <span className="status-badge" style={{ background: STATUS_COLORS[b.status] || '#999', color: '#fff' }}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </div>
                      <div className="dashboard-booking-meta">
                        <span>{b.event_start_date} - {b.event_end_date}</span>
                        <strong>{formatPrice(b.amount)}</strong>
                      </div>
                      <div className="dashboard-booking-venue">{b.event_address}</div>
                      <div className="dashboard-booking-date">{t('dashboard.booked_on')} {new Date(b.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-quick-actions">
              <h3>{t('dashboard.quick_actions')}</h3>
              <div className="quick-actions-grid">
                <button className="quick-action-card" onClick={() => navigate('/packages')}>{t('dashboard.browse_packages')}</button>
                <button className="quick-action-card" onClick={() => navigate('/my-bookings')}>{t('dashboard.all_my_bookings')}</button>
                <button className="quick-action-card" onClick={() => navigate('/gallery')}>{t('dashboard.view_gallery')}</button>
                <button className="quick-action-card" onClick={() => navigate('/profile')}>{t('dashboard.my_profile')}</button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
