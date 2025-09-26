import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';

const StaffProtectedRoute: React.FC = () => {
  const { user, isLoading: authLoading, staffProfile, isLoadingStaffProfile } = useAuth();
  const navigate = useNavigate();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    // Only proceed if authentication and staff profile loading are complete
    if (authLoading || isLoadingStaffProfile) {
      // Still loading, do nothing yet
      return;
    }

    if (!user) {
      // No user, redirect to login
      setRedirectPath('/staff/login');
    } else if (!staffProfile) {
      // User is logged in, but no staff profile found, redirect to login (or an error page)
      // This handles cases where userType might be customer or vendor but they try to access staff route
      setRedirectPath('/staff/login');
    } else if (!staffProfile.is_active || !staffProfile.display_name || !staffProfile.role || staffProfile.invitation_status === 'pending') {
      // Staff profile exists but needs onboarding
      setRedirectPath('/staff/onboarding');
    } else {
      // All checks passed, clear any redirection path
      setRedirectPath(null);
    }
  }, [user, authLoading, isLoadingStaffProfile, staffProfile, navigate]);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (authLoading || isLoadingStaffProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Verifying staff credentials...</p>
      </div>
    );
  }

  return <Outlet />;
};

export default StaffProtectedRoute;