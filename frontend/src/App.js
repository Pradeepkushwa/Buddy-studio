import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Packages from './pages/Packages';
import PackageDetail from './pages/PackageDetail';
import GalleryPage from './pages/GalleryPage';
import BookingForm from './pages/BookingForm';
import PaymentPage from './pages/PaymentPage';
import MyBookings from './pages/MyBookings';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import PendingApproval from './pages/PendingApproval';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminEquipment from './pages/admin/AdminEquipment';
import AdminCategories from './pages/admin/AdminCategories';
import AdminPackages from './pages/admin/AdminPackages';
import AdminBookings from './pages/admin/AdminBookings';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminGallery from './pages/admin/AdminGallery';
import AdminReviews from './pages/admin/AdminReviews';
import StaffLayout from './pages/staff/StaffLayout';
import StaffEquipment from './pages/staff/StaffEquipment';
import StaffPackages from './pages/staff/StaffPackages';
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
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/pending-approval" element={<PendingApproval />} />

          {/* Authenticated */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/book/:id" element={
            <ProtectedRoute><BookingForm /></ProtectedRoute>
          } />
          <Route path="/bookings/:id/payment" element={
            <ProtectedRoute><PaymentPage /></ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute><MyBookings /></ProtectedRoute>
          } />

          {/* Staff */}
          <Route path="/staff" element={
            <ProtectedRoute requiredRole="staff"><StaffLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="/staff/equipment" replace />} />
            <Route path="equipment" element={<StaffEquipment />} />
            <Route path="packages" element={<StaffPackages />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="staff" element={<AdminStaffPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="equipment" element={<AdminEquipment />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="reviews" element={<AdminReviews />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
