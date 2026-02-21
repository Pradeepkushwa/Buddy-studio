import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', mobile_number: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [emailMode, setEmailMode] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailStep, setEmailStep] = useState(1);
  const [emailMsg, setEmailMsg] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/profile')
      .then(r => {
        setProfile(r.data.user);
        setForm({ name: r.data.user.name || '', mobile_number: r.data.user.mobile_number || '' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg(''); setErr(''); setSaving(true);
    try {
      const res = await api.patch('/profile', { profile: form });
      setProfile(res.data.user);
      updateUser(res.data.user);
      setMsg('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      setErr(error.response?.data?.errors?.join(', ') || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handleAvatarClick = () => fileRef.current?.click();

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) { setErr('Only image files allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { setErr('File must be under 5MB'); return; }

    setUploading(true); setErr(''); setMsg('');
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(res.data.user);
      updateUser(res.data.user);
      setMsg('Profile picture updated');
    } catch (error) {
      setErr(error.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleEmailChangeRequest = async (e) => {
    e.preventDefault();
    setEmailMsg(''); setEmailErr(''); setEmailSaving(true);
    try {
      const res = await api.post('/profile/request_email_change', { new_email: newEmail });
      setEmailMsg(res.data.message);
      setEmailStep(2);
    } catch (error) {
      setEmailErr(error.response?.data?.error || 'Failed to send code');
    } finally { setEmailSaving(false); }
  };

  const handleEmailChangeVerify = async (e) => {
    e.preventDefault();
    setEmailMsg(''); setEmailErr(''); setEmailSaving(true);
    try {
      const res = await api.post('/profile/verify_email_change', { otp_code: emailOtp });
      setProfile(res.data.user);
      updateUser(res.data.user);
      setEmailMsg('Email updated successfully!');
      setEmailMode(false);
      setEmailStep(1);
      setNewEmail('');
      setEmailOtp('');
    } catch (error) {
      setEmailErr(error.response?.data?.error || 'Verification failed');
    } finally { setEmailSaving(false); }
  };

  const avatarSrc = profile?.avatar_url ? `${API_BASE}${profile.avatar_url}` : null;

  if (loading) return <div className="profile-page"><p className="empty-state">Loading...</p></div>;

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <h1>My Profile</h1>
      </div>

      {msg && <div className="auth-success">{msg}</div>}
      {err && <div className="auth-error">{err}</div>}

      <div className="profile-page-grid">
        <div className="profile-page-card profile-avatar-card">
          <div className="profile-avatar-large" onClick={handleAvatarClick}>
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="profile-avatar-img" />
            ) : (
              <span className="profile-avatar-initials">
                {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
            <div className="profile-avatar-overlay">
              {uploading ? 'Uploading...' : 'Change Photo'}
            </div>
          </div>
          <input type="file" ref={fileRef} hidden accept="image/*" onChange={handleAvatarUpload} />
          <h2 className="profile-avatar-name">{profile?.name || 'User'}</h2>
          <span className="user-badge">{profile?.role}</span>
          <span className={`status-badge ${profile?.verification_status === 'approved' || profile?.verification_status === 'verified' ? 'status-approved' : 'status-pending'}`}>
            {profile?.verification_status}
          </span>
        </div>

        <div className="profile-page-card profile-details-card">
          <div className="profile-card-header">
            <h3>Personal Details</h3>
            {!editMode && (
              <button className="btn-secondary btn-sm" onClick={() => { setEditMode(true); setMsg(''); setErr(''); }}>
                Edit
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input value={form.mobile_number} onChange={e => setForm({ ...form, mobile_number: e.target.value })} placeholder="+91 9876543210" />
              </div>
              <div className="profile-edit-actions">
                <button type="submit" className="btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn-secondary btn-sm" onClick={() => {
                  setEditMode(false);
                  setForm({ name: profile?.name || '', mobile_number: profile?.mobile_number || '' });
                }}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="profile-info-list">
              <div className="profile-info-row">
                <span className="profile-info-label">Name</span>
                <span className="profile-info-value">{profile?.name || '—'}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">{profile?.email}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Mobile</span>
                <span className="profile-info-value">{profile?.mobile_number || '—'}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Role</span>
                <span className="profile-info-value" style={{ textTransform: 'capitalize' }}>{profile?.role}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Member Since</span>
                <span className="profile-info-value">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="profile-page-card">
          <div className="profile-card-header">
            <h3>Email Settings</h3>
            {!emailMode && (
              <button className="btn-secondary btn-sm" onClick={() => { setEmailMode(true); setEmailMsg(''); setEmailErr(''); }}>
                Change Email
              </button>
            )}
          </div>

          {emailMsg && <div className="auth-success" style={{ marginBottom: 12 }}>{emailMsg}</div>}
          {emailErr && <div className="auth-error" style={{ marginBottom: 12 }}>{emailErr}</div>}

          {emailMode ? (
            emailStep === 1 ? (
              <form onSubmit={handleEmailChangeRequest}>
                <p className="profile-email-note">A verification code will be sent to your new email address.</p>
                <div className="form-group">
                  <label>New Email Address</label>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required placeholder="new@email.com" />
                </div>
                <div className="profile-edit-actions">
                  <button type="submit" className="btn-primary btn-sm" disabled={emailSaving}>
                    {emailSaving ? 'Sending...' : 'Send Code'}
                  </button>
                  <button type="button" className="btn-secondary btn-sm" onClick={() => { setEmailMode(false); setNewEmail(''); }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleEmailChangeVerify}>
                <p className="profile-email-note">Enter the 6-digit code sent to <strong>{newEmail}</strong></p>
                <div className="form-group">
                  <label>Verification Code</label>
                  <input type="text" value={emailOtp} onChange={e => setEmailOtp(e.target.value)}
                    required placeholder="Enter 6-digit code" maxLength={6} className="otp-input" />
                </div>
                <div className="profile-edit-actions">
                  <button type="submit" className="btn-primary btn-sm" disabled={emailSaving}>
                    {emailSaving ? 'Verifying...' : 'Verify & Update'}
                  </button>
                  <button type="button" className="btn-secondary btn-sm" onClick={() => {
                    setEmailMode(false); setEmailStep(1); setNewEmail(''); setEmailOtp('');
                  }}>Cancel</button>
                </div>
              </form>
            )
          ) : (
            <div className="profile-info-list">
              <div className="profile-info-row">
                <span className="profile-info-label">Current Email</span>
                <span className="profile-info-value">{profile?.email}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Verified</span>
                <span className="profile-info-value">
                  {profile?.email_verified ? <span className="status-approved">Yes</span> : <span className="status-pending">No</span>}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="profile-page-card">
          <h3>Quick Actions</h3>
          <div className="profile-quick-actions">
            {profile?.role === 'admin' && (
              <button className="quick-action-card" onClick={() => navigate('/admin/dashboard')}>Admin Dashboard</button>
            )}
            {profile?.role === 'staff' && (
              <>
                <button className="quick-action-card" onClick={() => navigate('/staff/equipment')}>Equipment</button>
                <button className="quick-action-card" onClick={() => navigate('/staff/packages')}>My Packages</button>
              </>
            )}
            <button className="quick-action-card" onClick={() => navigate('/packages')}>Browse Packages</button>
            <button className="quick-action-card" onClick={() => navigate('/forgot-password')}>Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
}
