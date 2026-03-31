import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      setError(err.response?.data?.error || t('common.something_went_wrong'));
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
    if (password.length < 6) { setError(t('auth.password_min_error')); return; }
    if (password !== passwordConfirmation) { setError(t('auth.passwords_no_match')); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/password/reset', {
        email, otp_code: otpCode, password, password_confirmation: passwordConfirmation
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.join(', ') || t('common.something_went_wrong'));
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

  const stepTitle = step === 1 ? t('auth.forgot_title_step1') : step === 2 ? t('auth.forgot_title_step2') : t('auth.forgot_title_step3');

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">{t('auth.brand')}</div>
        <h2>{stepTitle}</h2>
        <p className="auth-step-desc">
          {step === 1 && t('auth.forgot_desc1')}
          {step === 2 && `${t('auth.sent_code_to')} ${email}`}
          {step === 3 && t('auth.forgot_desc3')}
        </p>

        <div className="forgot-steps">
          <div className={`forgot-step ${step >= 1 ? 'active' : ''}`}><span>1</span> {t('auth.forgot_step_email')}</div>
          <div className="forgot-step-line" />
          <div className={`forgot-step ${step >= 2 ? 'active' : ''}`}><span>2</span> {t('auth.forgot_step_verify')}</div>
          <div className="forgot-step-line" />
          <div className={`forgot-step ${step >= 3 ? 'active' : ''}`}><span>3</span> {t('auth.forgot_step_reset')}</div>
        </div>

        {message && <div className="auth-success">{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="reset-email">{t('auth.email_address')}</label>
              <input id="reset-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder={t('auth.email_placeholder')} />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? t('auth.sending') : t('auth.send_reset_code')}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label htmlFor="reset-otp">{t('auth.six_digit_code')}</label>
              <input id="reset-otp" type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)}
                required placeholder={t('auth.enter_code')} maxLength={6} className="otp-input" />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? t('auth.verifying') : t('auth.verify_code')}
            </button>
            <button type="button" className="btn-link" onClick={handleResendOtp} disabled={submitting}>
              {t('auth.resend_code')}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="new-password">{t('auth.new_password')}</label>
              <input id="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder={t('auth.min_6_chars')} minLength={6} />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">{t('auth.confirm_password_label')}</label>
              <input id="confirm-password" type="password" value={passwordConfirmation}
                onChange={e => setPasswordConfirmation(e.target.value)}
                required placeholder={t('auth.re_enter_password')} minLength={6} />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? t('auth.updating') : t('auth.reset_password')}
            </button>
          </form>
        )}

        <p className="auth-link">
          <Link to="/login">{t('auth.back_to_login')}</Link>
        </p>
      </div>
    </div>
  );
}
