import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/staff/equipment', label: 'Equipment' },
  { to: '/staff/packages', label: 'My Packages' },
  { to: '/staff/profile', label: 'Profile' },
];

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">BuddyStudio</div>
        <div className="admin-sidebar-subtitle">Staff Panel</div>
        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `admin-nav-link ${isActive ? 'admin-nav-active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <span className="admin-user-name">{user?.name}</span>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/staff/profile')}>Profile</button>
          <button className="btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
