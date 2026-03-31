import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export default function Navbar() {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  const closeMenu = () => setMenuOpen(false);

  const toggleLang = () => {
    const newLang = currentLang === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
    setCurrentLang(newLang);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>BuddyStudio</Link>
      <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <span className={`hamburger ${menuOpen ? 'hamburger-open' : ''}`} />
      </button>
      <div className={`navbar-links ${menuOpen ? 'navbar-links-open' : ''}`}>
        <Link to="/" className="nav-link" onClick={closeMenu}>{t('nav.home')}</Link>
        <Link to="/packages" className="nav-link" onClick={closeMenu}>{t('nav.packages')}</Link>
        <Link to="/gallery" className="nav-link" onClick={closeMenu}>{t('nav.gallery')}</Link>
        {token && user ? (
          <>
            {user.role === 'user' && <Link to="/my-bookings" className="nav-link" onClick={closeMenu}>{t('nav.my_bookings')}</Link>}
            {user.role === 'staff' && <Link to="/staff" className="nav-link" onClick={closeMenu}>{t('nav.staff_panel')}</Link>}
            {user.role === 'admin' && <Link to="/admin/dashboard" className="nav-link" onClick={closeMenu}>{t('nav.admin')}</Link>}
            <Link to="/dashboard" className="nav-link" onClick={closeMenu}>{t('nav.dashboard')}</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link" onClick={closeMenu}>{t('nav.login')}</Link>
            <Link to="/signup" className="nav-link nav-link-cta" onClick={closeMenu}>{t('nav.signup')}</Link>
          </>
        )}
        <button className="nav-lang-btn" onClick={toggleLang} title="Switch language">
          {currentLang === 'en' ? 'हिं' : 'EN'}
        </button>
      </div>
    </nav>
  );
}
