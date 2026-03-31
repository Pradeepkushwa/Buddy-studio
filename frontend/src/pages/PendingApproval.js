import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PendingApproval() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">{t('auth.brand')}</div>
        <div className="pending-icon">&#9203;</div>
        <h2>{t('auth.pending_title')}</h2>
        <p className="auth-subtitle">
          Hi <strong>{user?.name || 'there'}</strong>, {t('auth.pending_subtitle')}
        </p>
        <p className="auth-subtitle">{t('auth.pending_desc')}</p>
        <button className="btn-secondary" onClick={handleLogout}>{t('auth.back_to_login_btn')}</button>
      </div>
    </div>
  );
}
