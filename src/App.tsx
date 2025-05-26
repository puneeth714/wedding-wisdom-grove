
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './hooks/useAuthContext';
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VendorOnboarding from "./pages/VendorOnboarding";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";
import CalendarPage from "./pages/CalendarPage";
import BookingsPage from "./pages/BookingsPage";
import ServicesPage from "./pages/ServicesPage";
import TasksPage from "./pages/TasksPage";
import StaffPage from "./pages/StaffPage";
import NotificationsPage from "./pages/NotificationsPage";
import ReviewsPage from "./pages/ReviewsPage";
import PaymentsPage from "./pages/PaymentsPage";
import SettingsPage from "./pages/SettingsPage";
import VendorLayout from './components/VendorLayout';
import StaffLogin from "./pages/StaffLogin";
import StaffOnboarding from "./pages/StaffOnboarding";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import StaffProfile from "./pages/StaffProfile";
import StaffBookings from "./pages/StaffBookings";
import StaffTasks from "./pages/StaffTasks";
import StaffAvailability from "./pages/StaffAvailability";
import StaffServices from "./pages/StaffServices";
import StaffNotifications from "./pages/StaffNotifications";

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
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/vendor-onboarding" element={<VendorOnboarding />} />
            
            {/* Staff routes */}
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff/onboarding" element={<StaffOnboarding />} />
            <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
            <Route path="/staff/profile" element={<StaffProfile />} />
            <Route path="/staff/bookings" element={<StaffBookings />} />
            <Route path="/staff/tasks" element={<StaffTasks />} />
            <Route path="/staff/availability" element={<StaffAvailability />} />
            <Route path="/staff/services" element={<StaffServices />} />
            <Route path="/staff/notifications" element={<StaffNotifications />} />
            
            {/* Vendor routes with layout */}
            <Route path="/" element={<VendorLayout><Dashboard /></VendorLayout>} />
            <Route path="/profile" element={<VendorLayout><EditProfile /></VendorLayout>} />
            <Route path="/calendar" element={<VendorLayout><CalendarPage /></VendorLayout>} />
            <Route path="/bookings" element={<VendorLayout><BookingsPage /></VendorLayout>} />
            <Route path="/services" element={<VendorLayout><ServicesPage /></VendorLayout>} />
            <Route path="/tasks" element={<VendorLayout><TasksPage /></VendorLayout>} />
            <Route path="/staff" element={<VendorLayout><StaffPage /></VendorLayout>} />
            <Route path="/notifications" element={<VendorLayout><NotificationsPage /></VendorLayout>} />
            <Route path="/reviews" element={<VendorLayout><ReviewsPage /></VendorLayout>} />
            <Route path="/payments" element={<VendorLayout><PaymentsPage /></VendorLayout>} />
            <Route path="/settings" element={<VendorLayout><SettingsPage /></VendorLayout>} />
            
            {/* Customer routes */}
            <Route path="/customer/*" element={<Index />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
