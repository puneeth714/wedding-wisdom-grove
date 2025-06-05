
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuthContext";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import StaffLoginPage from "./pages/StaffLoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import VendorProfile from "./pages/VendorProfile";
import EditProfile from "./pages/EditProfile";
import Services from "./pages/Services";
import StaffServices from "./pages/StaffServices";
import Staff from "./pages/Staff";
import Settings from "./pages/Settings";
import Bookings from "./pages/Bookings";
import VendorOnboarding from "./pages/VendorOnboarding";
import AddService from "./pages/AddService";
import EditService from "./pages/EditService";
import StaffDashboard from "./pages/StaffDashboard";
import VendorLayout from "./components/VendorLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Authentication Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<RegisterPage />} />
              <Route path="/staff/login" element={<StaffLoginPage />} />
              
              {/* Vendor Routes - wrapped with VendorLayout */}
              <Route path="/dashboard" element={
                <VendorLayout>
                  <Dashboard />
                </VendorLayout>
              } />
              <Route path="/profile" element={
                <VendorLayout>
                  <VendorProfile />
                </VendorLayout>
              } />
              <Route path="/profile/edit" element={
                <VendorLayout>
                  <EditProfile />
                </VendorLayout>
              } />
              <Route path="/services" element={
                <VendorLayout>
                  <Services />
                </VendorLayout>
              } />
              <Route path="/services/add" element={
                <VendorLayout>
                  <AddService />
                </VendorLayout>
              } />
              <Route path="/services/edit/:serviceId" element={
                <VendorLayout>
                  <EditService />
                </VendorLayout>
              } />
              <Route path="/staff" element={
                <VendorLayout>
                  <Staff />
                </VendorLayout>
              } />
              <Route path="/settings" element={
                <VendorLayout>
                  <Settings />
                </VendorLayout>
              } />
              <Route path="/bookings" element={
                <VendorLayout>
                  <Bookings />
                </VendorLayout>
              } />
              <Route path="/onboarding" element={
                <VendorLayout>
                  <VendorOnboarding />
                </VendorLayout>
              } />
              
              {/* Staff Routes */}
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/services" element={<StaffServices />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
