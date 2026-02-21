import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

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
          <button className="btn-secondary btn-sm" onClick={() => navigate('/')}>Home</button>
          <button className="btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
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
              <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
              <p className="dashboard-subtitle">{user?.email}</p>
            </div>
          </div>
          <button className="btn-primary btn-sm" onClick={() => navigate('/profile')}>Edit Profile</button>
        </div>

        {user?.role === 'user' && (
          <div className="dashboard-stats-row">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-number">{bookings.length}</div>
              <div className="dashboard-stat-label">Total Bookings</div>
            </div>
            <div className="dashboard-stat-card stat-pending">
              <div className="dashboard-stat-number">{pendingBookings.length}</div>
              <div className="dashboard-stat-label">Active</div>
            </div>
            <div className="dashboard-stat-card stat-completed">
              <div className="dashboard-stat-number">{completedCount}</div>
              <div className="dashboard-stat-label">Completed</div>
            </div>
          </div>
        )}

        {user?.role === 'admin' && (
          <div className="dashboard-quick-actions">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="quick-action-card" onClick={() => navigate('/admin/dashboard')}>Admin Dashboard</button>
              <button className="quick-action-card" onClick={() => navigate('/admin/bookings')}>Manage Bookings</button>
              <button className="quick-action-card" onClick={() => navigate('/admin/packages')}>Manage Packages</button>
              <button className="quick-action-card" onClick={() => navigate('/admin/staff')}>Manage Staff</button>
              <button className="quick-action-card" onClick={() => navigate('/profile')}>My Profile</button>
            </div>
          </div>
        )}

        {user?.role === 'staff' && (
          <div className="dashboard-quick-actions">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="quick-action-card" onClick={() => navigate('/staff/equipment')}>Equipment</button>
              <button className="quick-action-card" onClick={() => navigate('/staff/packages')}>My Packages</button>
              <button className="quick-action-card" onClick={() => navigate('/profile')}>My Profile</button>
            </div>
          </div>
        )}

        {user?.role === 'user' && (
          <>
            {pendingBookings.length > 0 && (
              <div className="dashboard-bookings-section">
                <h3>Active Bookings ({pendingBookings.length})</h3>
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
                <h3>Recent Bookings</h3>
                <Link to="/my-bookings" className="btn-secondary btn-sm">View All</Link>
              </div>
              {loadingBookings ? (
                <p className="empty-state">Loading...</p>
              ) : recentBookings.length === 0 ? (
                <div className="empty-state">
                  <p>No bookings yet.</p>
                  <Link to="/packages" className="btn-primary" style={{ display: 'inline-block', maxWidth: 200, marginTop: 12 }}>Browse Packages</Link>
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
                      <div className="dashboard-booking-date">Booked on {new Date(b.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-quick-actions">
              <h3>Quick Actions</h3>
              <div className="quick-actions-grid">
                <button className="quick-action-card" onClick={() => navigate('/packages')}>Browse Packages</button>
                <button className="quick-action-card" onClick={() => navigate('/my-bookings')}>All My Bookings</button>
                <button className="quick-action-card" onClick={() => navigate('/gallery')}>View Gallery</button>
                <button className="quick-action-card" onClick={() => navigate('/profile')}>My Profile</button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
