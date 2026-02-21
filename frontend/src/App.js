import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Packages from './pages/Packages';
import PackageDetail from './pages/PackageDetail';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyOtp from './pages/VerifyOtp';
import PendingApproval from './pages/PendingApproval';
import Dashboard from './pages/Dashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminEquipment from './pages/admin/AdminEquipment';
import AdminCategories from './pages/admin/AdminCategories';
import AdminPackages from './pages/admin/AdminPackages';
import AdminAppointments from './pages/admin/AdminAppointments';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/packages/:id" element={<PackageDetail />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/pending-approval" element={<PendingApproval />} />

          {/* Authenticated */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/staff" replace />} />
            <Route path="staff" element={<AdminStaffPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="equipment" element={<AdminEquipment />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="appointments" element={<AdminAppointments />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
