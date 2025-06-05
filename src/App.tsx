
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
import ProtectedRoute from "./components/ProtectedRoute";
import StaffProtectedRoute from "./components/StaffProtectedRoute";
import VendorLayout from "./components/VendorLayout";
import StaffDashboardLayout from "./components/staff/StaffDashboardLayout";
import Navbar from "./components/Navbar";

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
              {/* Public Routes - with Navbar */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <main className="container mx-auto px-4 py-8">
                    <Index />
                  </main>
                </>
              } />
              <Route path="/login" element={
                <>
                  <Navbar />
                  <main className="container mx-auto px-4 py-8">
                    <LoginPage />
                  </main>
                </>
              } />
              <Route path="/signup" element={
                <>
                  <Navbar />
                  <main className="container mx-auto px-4 py-8">
                    <RegisterPage />
                  </main>
                </>
              } />
              <Route path="/staff/login" element={
                <>
                  <Navbar />
                  <main className="container mx-auto px-4 py-8">
                    <StaffLoginPage />
                  </main>
                </>
              } />
              
              {/* Vendor Routes - with VendorLayout */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <VendorLayout>
                    <Dashboard />
                  </VendorLayout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <VendorLayout>
                    <VendorProfile />
                  </VendorLayout>
                </ProtectedRoute>
              } />
              <Route path="/profile/edit" element={
                <ProtectedRoute>
                  <VendorLayout>
                    <EditProfile />
                  </VendorLayout>
                </ProtectedRoute>
              } />
              <Route path="/services" element={
                <ProtectedRoute>
                  <VendorLayout>
                    <Services />
                  </VendorLayout>
                </ProtectedRoute>
              } />
              <Route path="/services/add" element={
                <ProtectedRoute>
                  <VendorLayout>
                    <AddService />
                  </VendorLayout>
                </ProtectedRoute>
              } />
              <Route path="/services/edit/:serviceId" element={
                <ProtectedRoute>
                  <VendorLayout>
                    <EditService />
                  </VendorLayout>
                </ProtectedRoute>
              } />
              <Route path="/staff" element={
                <ProtectedRoute>
                  <VendorLayout>
                    <Staff />
                  </VendorLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <VendorLayout>
                    <Settings />
                  </VendorLayout>
                </ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute>
                  <VendorLayout>
                    <Bookings />
                  </VendorLayout>
                </ProtectedRoute>
              } />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <VendorLayout>
                    <VendorOnboarding />
                  </VendorLayout>
                </ProtectedRoute>
              } />
              
              {/* Staff Routes - with StaffDashboardLayout */}
              <Route path="/staff/dashboard" element={
                <StaffProtectedRoute>
                  <StaffDashboardLayout>
                    <StaffDashboard />
                  </StaffDashboardLayout>
                </StaffProtectedRoute>
              } />
              <Route path="/staff/services" element={
                <StaffProtectedRoute>
                  <StaffDashboardLayout>
                    <StaffServices />
                  </StaffDashboardLayout>
                </StaffProtectedRoute>
              } />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
