import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setSubmitting(true);
    try {
      const res = await api.post('/password/forgot', { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setSubmitting(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setSubmitting(true);
    try {
      const res = await api.post('/password/verify_otp', { email, otp_code: otpCode });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired code');
    } finally { setSubmitting(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== passwordConfirmation) { setError('Passwords do not match'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/password/reset', {
        email, otp_code: otpCode, password, password_confirmation: passwordConfirmation
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.join(', ') || 'Something went wrong');
    } finally { setSubmitting(false); }
  };

  const handleResendOtp = async () => {
    setError(''); setMessage(''); setSubmitting(true);
    try {
      const res = await api.post('/password/forgot', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">BuddyStudio</div>
        <h2>{step === 1 ? 'Forgot Password' : step === 2 ? 'Verify Code' : 'New Password'}</h2>
        <p className="auth-step-desc">
          {step === 1 && 'Enter your email and we\'ll send you a reset code.'}
          {step === 2 && `We've sent a 6-digit code to ${email}`}
          {step === 3 && 'Create your new password.'}
        </p>

        <div className="forgot-steps">
          <div className={`forgot-step ${step >= 1 ? 'active' : ''}`}><span>1</span> Email</div>
          <div className="forgot-step-line" />
          <div className={`forgot-step ${step >= 2 ? 'active' : ''}`}><span>2</span> Verify</div>
          <div className="forgot-step-line" />
          <div className={`forgot-step ${step >= 3 ? 'active' : ''}`}><span>3</span> Reset</div>
        </div>

        {message && <div className="auth-success">{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="reset-email">Email Address</label>
              <input id="reset-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@email.com" />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label htmlFor="reset-otp">6-Digit Code</label>
              <input id="reset-otp" type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)}
                required placeholder="Enter code" maxLength={6} className="otp-input" />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Verifying...' : 'Verify Code'}
            </button>
            <button type="button" className="btn-link" onClick={handleResendOtp} disabled={submitting}>
              Resend Code
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input id="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="Min 6 characters" minLength={6} />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input id="confirm-password" type="password" value={passwordConfirmation}
                onChange={e => setPasswordConfirmation(e.target.value)}
                required placeholder="Re-enter password" minLength={6} />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-link">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
