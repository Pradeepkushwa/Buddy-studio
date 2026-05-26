import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell';

const NAV_ITEMS = [
  { to: '/admin/dashboard',  label: 'Dashboard' },
  { to: '/admin/revenue',    label: '💰 Revenue' },
  { to: '/admin/staff',      label: 'Staff' },
  { to: '/admin/customers',  label: 'Customers' },
  { to: '/admin/equipment',  label: 'Equipment' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/packages',   label: 'Packages' },
  { to: '/admin/bookings',   label: 'Bookings' },
  { to: '/admin/appointments', label: 'Appointments' },
  { to: '/admin/gallery',    label: 'Gallery' },
  { to: '/admin/reviews',    label: 'Reviews' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const darkPages = ['/admin/dashboard', '/admin', '/admin/', '/admin/revenue'];
  const isDashboard = darkPages.includes(location.pathname);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">BuddyStudio</div>
        <div className="admin-sidebar-subtitle">Admin Panel</div>
        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `admin-nav-link ${isActive ? 'admin-nav-active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <span className="admin-user-name">{user?.name}</span>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/profile')}>Profile</button>
          <button className="btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className={`admin-content${isDashboard ? ' admin-content-dark' : ''}`}>
        <div className="admin-topbar">
          <div className="admin-topbar-right">
            <NotificationBell />
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
