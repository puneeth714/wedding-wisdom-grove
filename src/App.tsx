
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
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/staff/login" element={<StaffLoginPage />} />
                <Route path="/signup" element={<RegisterPage />} />
                
                {/* Vendor Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><VendorProfile /></ProtectedRoute>} />
                <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
                <Route path="/services/add" element={<ProtectedRoute><AddService /></ProtectedRoute>} />
                <Route path="/services/edit/:serviceId" element={<ProtectedRoute><EditService /></ProtectedRoute>} />
                <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                <Route path="/onboarding" element={<ProtectedRoute><VendorOnboarding /></ProtectedRoute>} />
                
                {/* Staff Routes */}
                <Route path="/staff/dashboard" element={<StaffProtectedRoute />}>
                  <Route index element={<StaffDashboard />} />
                </Route>
                <Route path="/staff/services" element={<StaffProtectedRoute />}>
                  <Route index element={<StaffServices />} />
                </Route>
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
