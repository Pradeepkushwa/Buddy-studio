import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', mobile_number: '', password: '', password_confirmation: '', role: 'user' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const res = await signup(form);
      if (res.requires_otp === false) {
        if (res.token && res.user) {
          localStorage.setItem('token', res.token);
          updateUser(res.user);
          navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
        } else if (res.role === 'staff') {
          navigate('/pending-approval');
        } else {
          navigate('/login');
        }
      } else {
        navigate('/verify-otp', { state: { email: res.email, role: res.role } });
      }
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.error || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">BuddyStudio</div>
        <h2>Create Account</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" />
          </div>
          <div className="form-group">
            <label htmlFor="mobile_number">Mobile Number</label>
            <input id="mobile_number" name="mobile_number" type="tel" value={form.mobile_number} onChange={handleChange} placeholder="+91 9876543210" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} placeholder="Min 6 characters" />
          </div>
          <div className="form-group">
            <label htmlFor="password_confirmation">Confirm Password</label>
            <input id="password_confirmation" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="role">I am a</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="user">Customer</option>
              <option value="staff">Staff Member</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
