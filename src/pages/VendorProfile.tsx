
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, User, MapPin, DollarSign, Star, Settings } from "lucide-react";
import { useAuth, VendorProfile as VendorProfileType } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface ExtendedVendorProfile extends Omit<VendorProfileType, 'pricing_range'> {
  details?: {
    amenities?: string[];
    services?: string[];
    capacity?: number;
    style?: string;
    specializations?: string[];
  };
  address?: {
    city: string;
    state: string;
    country: string;
    full_address: string;
  };
  pricing_range?: {
    min: number;
    max: number;
    currency: string;
  };
}

const VendorProfile: React.FC = () => {
  const { vendorProfile, refreshVendorProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ExtendedVendorProfile | null>(null);

  // Form states
  const [vendorName, setVendorName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [vendorCategory, setVendorCategory] = useState('');
  
  // Address states
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  
  // Pricing states
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [currency, setCurrency] = useState('INR');
  
  // Details states
  const [amenities, setAmenities] = useState<string>('');
  const [services, setServices] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(0);
  const [style, setStyle] = useState('');
  const [specializations, setSpecializations] = useState<string>('');

  useEffect(() => {
    if (vendorProfile) {
      const extended = vendorProfile as unknown as ExtendedVendorProfile;
      setProfileData(extended);
      
      // Basic info
      setVendorName(extended.vendor_name || '');
      setContactEmail(extended.contact_email || '');
      setPhoneNumber(extended.phone_number || '');
      setWebsiteUrl(extended.website_url || '');
      setDescription(extended.description || '');
      setVendorCategory(extended.vendor_category || '');
      
      // Address
      if (extended.address) {
        setCity(extended.address.city || '');
        setState(extended.address.state || '');
        setCountry(extended.address.country || '');
        setFullAddress(extended.address.full_address || '');
      }
      
      // Pricing
      if (extended.pricing_range) {
        setMinPrice(Number(extended.pricing_range.min) || 0);
        setMaxPrice(Number(extended.pricing_range.max) || 0);
        setCurrency(extended.pricing_range.currency || 'INR');
      }
      
      // Details
      if (extended.details) {
        setAmenities(extended.details.amenities?.join(', ') || '');
        setServices(extended.details.services?.join(', ') || '');
        setCapacity(extended.details.capacity || 0);
        setStyle(extended.details.style || '');
        setSpecializations(extended.details.specializations?.join(', ') || '');
      }
    }
  }, [vendorProfile]);

  const handleSave = async () => {
    if (!vendorProfile) return;

    setIsLoading(true);
    try {
      const updateData = {
        vendor_name: vendorName,
        contact_email: contactEmail,
        phone_number: phoneNumber || null,
        website_url: websiteUrl || null,
        description: description || null,
        vendor_category: vendorCategory,
        address: {
          city,
          state,
          country,
          full_address: fullAddress
        },
        pricing_range: {
          min: minPrice,
          max: maxPrice,
          currency
        },
        details: {
          amenities: amenities ? amenities.split(',').map(item => item.trim()) : [],
          services: services ? services.split(',').map(item => item.trim()) : [],
          capacity,
          style,
          specializations: specializations ? specializations.split(',').map(item => item.trim()) : []
        }
      };

      const { error } = await supabase
        .from('vendors')
        .update(updateData)
        .eq('vendor_id', vendorProfile.vendor_id);

      if (error) throw error;

      await refreshVendorProfile();
      toast({
        title: "Profile updated",
        description: "Your vendor profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteOnboarding = () => {
    navigate('/onboarding');
  };

  if (!vendorProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isProfileIncomplete = !vendorProfile.vendor_name || !vendorProfile.vendor_category || !vendorProfile.description;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vendor Profile</h1>
        {isProfileIncomplete && (
          <Button onClick={handleCompleteOnboarding} variant="outline">
            Complete Onboarding
          </Button>
        )}
      </div>

      {isProfileIncomplete && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-orange-600" />
              <p className="text-orange-800">
                Your profile is incomplete. Complete your onboarding to unlock all features.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Basic Information
          </CardTitle>
          <CardDescription>Manage your business profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor_name">Business Name</Label>
              <Input 
                id="vendor_name" 
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vendor_category">Category</Label>
              <Input 
                id="vendor_category" 
                value={vendorCategory}
                onChange={(e) => setVendorCategory(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email Address</Label>
              <Input 
                id="contact_email" 
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input 
                id="phone_number" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website_url">Website</Label>
              <Input 
                id="website_url" 
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea 
              id="description" 
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input 
                id="state" 
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input 
                id="country" 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="full_address">Full Address</Label>
            <Textarea 
              id="full_address" 
              rows={3}
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Pricing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_price">Minimum Price</Label>
              <Input 
                id="min_price" 
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_price">Maximum Price</Label>
              <Input 
                id="max_price" 
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input 
                id="currency" 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (comma separated)</Label>
              <Input 
                id="amenities" 
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                placeholder="WiFi, Parking, AC, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="services">Services (comma separated)</Label>
              <Input 
                id="services" 
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="Photography, Catering, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input 
                id="capacity" 
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Input 
                id="style" 
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="Traditional, Modern, etc."
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="specializations">Specializations (comma separated)</Label>
            <Input 
              id="specializations" 
              value={specializations}
              onChange={(e) => setSpecializations(e.target.value)}
              placeholder="Weddings, Corporate Events, etc."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </Button>
      </div>
    </div>
  );
};

export default VendorProfile;
