
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './hooks/useAuthContext';
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import VendorOnboarding from "./pages/VendorOnboarding";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";
import Calendar from "./pages/Calendar";
import Bookings from "./pages/Bookings";
import Services from "./pages/Services";
import Tasks from "./pages/Tasks";
import Staff from "./pages/Staff";
import Notifications from "./pages/Notifications";
import Reviews from "./pages/Reviews";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import VendorLayout from './components/VendorLayout';
import StaffLoginPage from "./pages/StaffLoginPage";
import StaffOnboarding from "./pages/StaffOnboarding";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import StaffProfile from "./pages/StaffProfile";
import StaffBookings from "./pages/StaffBookings";
import StaffTasks from "./pages/StaffTasks";
import StaffAvailability from "./pages/StaffAvailability";
import StaffServices from "./pages/StaffServices";
import StaffNotifications from "./pages/StaffNotifications";
import StaffProtectedRoute from './components/StaffProtectedRoute';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/vendor-onboarding" element={<VendorOnboarding />} />
            
            {/* Staff routes */}
            <Route path="/staff/login" element={<StaffLoginPage />} />
            <Route path="/staff/onboarding" element={<StaffOnboarding />} />
            <Route path="/staff/*" element={<StaffProtectedRoute />}>
              <Route path="dashboard" element={<StaffDashboardPage />} />
              <Route path="profile" element={<StaffProfile />} />
              <Route path="bookings" element={<StaffBookings />} />
              <Route path="tasks" element={<StaffTasks />} />
              <Route path="availability" element={<StaffAvailability />} />
              <Route path="services" element={<StaffServices />} />
              <Route path="notifications" element={<StaffNotifications />} />
            </Route>
            
            {/* Vendor routes with layout */}
            <Route path="/" element={<VendorLayout><Dashboard /></VendorLayout>} />
            <Route path="/profile" element={<VendorLayout><EditProfile /></VendorLayout>} />
            <Route path="/calendar" element={<VendorLayout><Calendar /></VendorLayout>} />
            <Route path="/bookings" element={<VendorLayout><Bookings /></VendorLayout>} />
            <Route path="/services" element={<VendorLayout><Services /></VendorLayout>} />
            <Route path="/tasks" element={<VendorLayout><Tasks /></VendorLayout>} />
            <Route path="/staff" element={<VendorLayout><Staff /></VendorLayout>} />
            <Route path="/notifications" element={<VendorLayout><Notifications /></VendorLayout>} />
            <Route path="/reviews" element={<VendorLayout><Reviews /></VendorLayout>} />
            <Route path="/payments" element={<VendorLayout><Payments /></VendorLayout>} />
            <Route path="/settings" element={<VendorLayout><Settings /></VendorLayout>} />
            
            {/* Customer routes */}
            <Route path="/customer/*" element={<Index />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
