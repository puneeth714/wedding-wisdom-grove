
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

export interface AddressData {
  city: string;
  state: string;
  country: string;
  full_address: string;
}

export interface PricingRangeData {
  min: string;
  max: string;
  currency: string;
}

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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any, userType?: string) => Promise<void>;
  refreshVendorProfile: () => Promise<void>;
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

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchProfiles(data.user.id);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any, userType?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      // Create vendor profile if userType is vendor
      if (data.user && userType === 'vendor' && metadata) {
        const { error: vendorError } = await supabase
          .from('vendors')
          .insert({
            supabase_auth_uid: data.user.id,
            vendor_name: metadata.vendor_name,
            vendor_category: metadata.vendor_category,
            contact_email: email,
            phone_number: metadata.phone_number,
          });

        if (vendorError) {
          console.error('Error creating vendor profile:', vendorError);
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshVendorProfile = async () => {
    if (user) {
      await fetchProfiles(user.id);
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
      signOut,
      signIn,
      signUp,
      refreshVendorProfile
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
