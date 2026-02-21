import { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="empty-state">Loading dashboard...</p>;
  if (!stats) return <p className="empty-state">Could not load dashboard stats.</p>;

  return (
    <div>
      <h2 className="admin-page-title">Dashboard</h2>

      <div className="dashboard-stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-value">{stats.customers}</div>
          <div className="stat-label">Customers</div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-value">{stats.staff}</div>
          <div className="stat-label">Staff Members</div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-value">{stats.gallery_items}</div>
          <div className="stat-label">Gallery Items</div>
        </div>
        <div className="stat-card stat-yellow">
          <div className="stat-value">{stats.packages.active}</div>
          <div className="stat-label">Active Packages</div>
        </div>
      </div>

      <h3 className="dashboard-section-title">Bookings</h3>
      <div className="dashboard-stats-grid">
        <div className="stat-card stat-yellow">
          <div className="stat-value">{stats.bookings.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-value">{stats.bookings.confirmed}</div>
          <div className="stat-label">Confirmed</div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-value">{stats.bookings.upcoming}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-value">{stats.bookings.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <h3 className="dashboard-section-title">Appointments</h3>
      <div className="dashboard-stats-grid">
        <div className="stat-card stat-yellow">
          <div className="stat-value">{stats.appointments.new}</div>
          <div className="stat-label">New</div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-value">{stats.appointments.contacted}</div>
          <div className="stat-label">Contacted</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.appointments.total}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      <h3 className="dashboard-section-title">Packages & Reviews</h3>
      <div className="dashboard-stats-grid">
        <div className="stat-card stat-yellow">
          <div className="stat-value">{stats.packages.pending_approval}</div>
          <div className="stat-label">Pending Approval</div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-value">{stats.packages.featured}</div>
          <div className="stat-label">Featured</div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-value">{stats.reviews.approved}</div>
          <div className="stat-label">Approved Reviews</div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-value">{stats.reviews.average_rating || '-'}</div>
          <div className="stat-label">Avg Rating</div>
        </div>
      </div>
    </div>
  );
}
