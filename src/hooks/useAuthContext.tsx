
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface VendorProfile {
  vendor_id: string;
  vendor_name: string;
  vendor_category: string;
  contact_email: string;
  phone_number: string;
  website_url: string;
  address: any;
  pricing_range: any;
  rating: number;
  description: string;
  portfolio_image_urls: string[];
  is_active: boolean;
  supabase_auth_uid: string;
  is_verified: boolean;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

interface StaffProfile {
  staff_id: string;
  vendor_id: string;
  supabase_auth_uid: string;
  email: string;
  phone_number: string;
  display_name: string;
  role: string;
  is_active: boolean;
  state: string;
  invitation_status: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  vendorProfile: VendorProfile | null;
  staffProfile: StaffProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfiles(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfiles(session.user.id);
      } else {
        setVendorProfile(null);
        setStaffProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfiles = async (userId: string) => {
    try {
      // Fetch vendor profile
      const { data: vendor } = await supabase
        .from('vendors')
        .select('*')
        .eq('supabase_auth_uid', userId)
        .single();

      if (vendor) {
        setVendorProfile(vendor);
      }

      // Fetch staff profile
      const { data: staff } = await supabase
        .from('vendor_staff')
        .select('*')
        .eq('supabase_auth_uid', userId)
        .single();

      if (staff) {
        setStaffProfile(staff);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setVendorProfile(null);
    setStaffProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      vendorProfile,
      staffProfile,
      isLoading,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
