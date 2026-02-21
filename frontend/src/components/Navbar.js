import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, token } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>BuddyStudio</Link>
      <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <span className={`hamburger ${menuOpen ? 'hamburger-open' : ''}`} />
      </button>
      <div className={`navbar-links ${menuOpen ? 'navbar-links-open' : ''}`}>
        <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
        <Link to="/packages" className="nav-link" onClick={closeMenu}>Packages</Link>
        <Link to="/gallery" className="nav-link" onClick={closeMenu}>Gallery</Link>
        {token && user ? (
          <>
            {user.role === 'user' && <Link to="/my-bookings" className="nav-link" onClick={closeMenu}>My Bookings</Link>}
            {user.role === 'staff' && <Link to="/staff" className="nav-link" onClick={closeMenu}>Staff Panel</Link>}
            {user.role === 'admin' && <Link to="/admin/dashboard" className="nav-link" onClick={closeMenu}>Admin</Link>}
            <Link to="/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
            <Link to="/signup" className="nav-link nav-link-cta" onClick={closeMenu}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
