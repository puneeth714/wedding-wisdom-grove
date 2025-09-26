import { Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Settings from './pages/Settings';
import Services from './pages/Services';
import AddService from './pages/AddService';
import EditService from './pages/EditService';
import Staff from './pages/Staff';
import Tasks from './pages/Tasks';
import NotFound from './pages/NotFound';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuthContext';
import { DataCacheProvider } from './hooks/useDataCache';
import Reviews from './pages/Reviews';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
import VendorOnboarding from './pages/VendorOnboarding';
import ManualVendorOnboarding from './pages/ManualVendorOnboarding';
import StaffLoginPage from './pages/StaffLoginPage';
import StaffDashboard from './pages/StaffDashboard';
import StaffProtectedRoute from './components/StaffProtectedRoute';
import StaffOnboarding from './pages/StaffOnboarding';
import StaffDashboardLayout from './components/staff/StaffDashboardLayout';
import StaffResetPassword from './pages/StaffResetPassword';
import StaffTasks from './pages/StaffTasks';
import StaffBookings from './pages/StaffBookings';
import StaffAvailabilityPage from './pages/StaffAvailabilityPage';
import StaffVendorServicesPage from './pages/StaffVendorServicesPage';
import StaffNotifications from './pages/StaffNotifications';
import StaffProfile from './pages/StaffProfile';
import StaffSettings from './pages/StaffSettings';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <DataCacheProvider>
      <Routes>
        <Route path="/" element={<Index />} /> {/* New root route for Index page */}

        {/* Public routes */}
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/signup"
          element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route path="/staff/login" element={<StaffLoginPage />} />
        {/* Staff onboarding route - separate protected route */}
        <Route 
          path="/staff/onboarding" 
          element={
            <StaffProtectedRoute>
              <StaffOnboarding />
            </StaffProtectedRoute>
          } 
        />
        
        {/* Protected Staff Routes with Dashboard Layout */}
        <Route element={<StaffProtectedRoute />}>
          <Route path="/staff" element={<StaffDashboardLayout><Navigate to="/staff/dashboard" replace /></StaffDashboardLayout>} />
          <Route path="/staff/dashboard" element={<StaffDashboardLayout><StaffDashboard /></StaffDashboardLayout>} />
          <Route path="/staff/reset-password" element={<StaffDashboardLayout><StaffResetPassword /></StaffDashboardLayout>} />
          <Route path="/staff/tasks" element={<StaffDashboardLayout><StaffTasks /></StaffDashboardLayout>} />
          <Route path="/staff/bookings" element={<StaffDashboardLayout><StaffBookings /></StaffDashboardLayout>} />
          <Route path="/staff/availability" element={<StaffDashboardLayout><StaffAvailabilityPage /></StaffDashboardLayout>} />
          <Route path="/staff/services" element={<StaffDashboardLayout><StaffVendorServicesPage /></StaffDashboardLayout>} />
          <Route path="/staff/notifications" element={<StaffDashboardLayout><StaffNotifications /></StaffDashboardLayout>} />
          <Route path="/staff/profile" element={<StaffDashboardLayout><StaffProfile /></StaffDashboardLayout>} />
          <Route path="/staff/settings" element={<StaffDashboardLayout><StaffSettings /></StaffDashboardLayout>} />
        </Route>
        {/* Vendor onboarding route */}
        <Route
          path="/onboarding"
          element={<ProtectedRoute><VendorOnboarding /></ProtectedRoute>}
        />
        <Route
          path="/manual-vendor-onboarding"
          element={
            <ProtectedRoute>
              <ManualVendorOnboarding />
            </ProtectedRoute>
          }
        />

        {/* Protected routes */}

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="services" element={<Services />} />
          <Route path="services/add" element={<AddService />} />
          <Route path="services/edit/:serviceId" element={<EditService />} />
          <Route path="staff" element={<Staff />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="payments" element={<Payments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reviews" element={<Reviews />} />
        </Route>
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DataCacheProvider>
  );
}

export default App;