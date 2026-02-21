import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="auth-logo">BuddyStudio</div>
        <div className="header-right">
          <span className="user-badge">{user?.role}</span>
          <span className="user-name">{user?.name}</span>
          <button className="btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="dashboard-main">
        <h1>Welcome, {user?.name || 'User'}!</h1>
        <p>Role: <strong>{user?.role}</strong></p>
        <p>Email: {user?.email}</p>
        {user?.mobile_number && <p>Mobile: {user?.mobile_number}</p>}
        <p>Status: {user?.verification_status}</p>
        {user?.role === 'admin' && (
          <button className="btn-primary" onClick={() => navigate('/admin')}>Go to Admin Panel</button>
        )}
      </main>
    </div>
  );
}
