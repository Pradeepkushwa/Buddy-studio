import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyOtp() {
  const { verifyOtp, resendOtp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const role = location.state?.role || 'user';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!email) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>No email provided</h2>
          <p>Please sign up first.</p>
          <button className="btn-primary" onClick={() => navigate('/signup')}>Go to Signup</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await verifyOtp(email, otp);
      if (role === 'staff') {
        navigate('/pending-approval');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    try {
      await resendOtp(email);
      setMessage('New code sent to your email!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">BuddyStudio</div>
        <h2>Verify Email</h2>
        <p className="auth-subtitle">Enter the 6-digit code sent to <strong>{email}</strong></p>
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="otp-input"
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting || otp.length !== 6}>
            {submitting ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        <button className="btn-link" onClick={handleResend}>Resend Code</button>
      </div>
    </div>
  );
}
