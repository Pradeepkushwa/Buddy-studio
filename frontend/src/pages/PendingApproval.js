import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PendingApproval() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">BuddyStudio</div>
        <div className="pending-icon">&#9203;</div>
        <h2>Approval Pending</h2>
        <p className="auth-subtitle">
          Hi <strong>{user?.name || 'there'}</strong>, your staff account has been created
          and your email is verified.
        </p>
        <p className="auth-subtitle">
          An admin needs to approve your account before you can access the dashboard.
          You'll be notified once approved.
        </p>
        <button className="btn-secondary" onClick={handleLogout}>Back to Login</button>
      </div>
    </div>
  );
}
