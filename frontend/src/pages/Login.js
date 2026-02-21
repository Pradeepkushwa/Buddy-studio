import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
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
        <div className="auth-logo">BuddyStudio</div>
        <h2>Welcome Back</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Your password" />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="auth-link forgot-link"><Link to="/forgot-password">Forgot Password?</Link></p>
        <p className="auth-link">Don't have an account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
}
