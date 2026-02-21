import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, token, loading } = useAuth();

  if (loading) return <div className="auth-container"><p>Loading...</p></div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (!user.active && user.role === 'staff') return <Navigate to="/pending-approval" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/dashboard" replace />;

  return children;
}
