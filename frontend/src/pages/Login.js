import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login(form.email, form.password);
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        const role = res.user?.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'staff') navigate('/staff');
        else navigate('/dashboard');
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.verification_status === 'pending' && data?.message) {
        setError(data.message);
      } else {
        setError(data?.error || 'Login failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">{t('auth.brand')}</div>
        <h2>{t('auth.login_title')}</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder={t('auth.email_placeholder')} />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <PasswordInput id="password" name="password" value={form.password} onChange={handleChange} required placeholder={t('auth.password_placeholder')} />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? t('auth.logging_in') : t('auth.log_in')}
          </button>
        </form>
        <p className="auth-link forgot-link"><Link to="/forgot-password">{t('auth.forgot_password')}</Link></p>
        <p className="auth-link">{t('auth.no_account')} <Link to="/signup">{t('auth.signup_link')}</Link></p>
      </div>
    </div>
  );
}
