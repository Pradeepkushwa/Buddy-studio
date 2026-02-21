import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, token } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">BuddyStudio</Link>
      <div className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/packages" className="nav-link">Packages</Link>
        {token && user ? (
          <>
            {user.role === 'admin' && <Link to="/admin/staff" className="nav-link">Admin</Link>}
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link nav-link-cta">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
