
import React from 'react';
import { useAuth } from '../hooks/useAuthContext';
import { useLocation, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, vendorProfile, staffProfile, isLoading, isLoadingProfile } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is staff, redirect to staff portal
  if (staffProfile) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  // If user doesn't have vendor profile, redirect to onboarding
  if (!vendorProfile) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // User is a vendor with valid profile
  return <>{children}</>;
};

export default ProtectedRoute;
