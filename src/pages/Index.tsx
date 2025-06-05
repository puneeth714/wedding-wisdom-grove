
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthContext";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, vendorProfile, staffProfile, isLoading, isLoadingProfile } = useAuth();

  useEffect(() => {
    if (isLoading || isLoadingProfile) return;

    if (user) {
      // If user is logged in, redirect based on their role
      if (staffProfile) {
        // User is staff, redirect to staff dashboard
        navigate("/staff/dashboard");
      } else if (vendorProfile) {
        // User is vendor, redirect to vendor dashboard
        navigate("/dashboard");
      } else {
        // User exists but no profile found, redirect to onboarding
        navigate("/onboarding");
      }
    } else {
      // User not logged in, redirect to login
      navigate("/login");
    }
  }, [user, vendorProfile, staffProfile, isLoading, isLoadingProfile, navigate]);

  // Show loading while checking authentication
  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading...</p>
      </div>
    );
  }

  return null; // This should not render as user will be redirected
};

export default Index;
