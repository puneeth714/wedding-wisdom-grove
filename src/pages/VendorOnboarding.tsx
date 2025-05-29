

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, X, ArrowRight } from 'lucide-react';
import VenueOnboardingForm from '@/components/onboarding/VenueOnboardingForm';

const categories = [
  "Venue", "Catering", "Photography", "Videography", "Decor", 
  "Makeup", "Clothing", "Music", "Transportation", "Invitation", "Other"
];

const commonAmenities = [
  "WiFi", "Parking", "Air Conditioning", "Kitchen", "Sound System", 
  "Projector", "Wheelchair Accessible", "Outdoor Space", "Bar", "Catering Kitchen"
];

const VendorOnboarding: React.FC = () => {
  const { user, vendorProfile, refreshVendorProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Check if we're updating existing vendor
  const [isUpdating, setIsUpdating] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showVenueForm, setShowVenueForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    vendorName: '',
    vendorCategory: '',
    description: '',
    contactEmail: '',
    phoneNumber: '',
    websiteUrl: '',
    // Address
    city: '',
    state: '',
    country: 'India',
    fullAddress: '',
    // Pricing
    minPrice: '',
    maxPrice: '',
    currency: 'INR',
    // Amenities and services
    selectedAmenities: [] as string[],
    customAmenities: '',
    services: '',
    capacity: '',
    style: '',
    specializations: '',
    policies: '',
    ritualOfferings: '',
  });

  // Fix race condition by using useEffect with proper dependency management
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Only populate form data once when vendorProfile is available and data hasn't been loaded yet
    if (vendorProfile && !dataLoaded) {
      setIsUpdating(true);
      
      console.log("Populating form with existing vendor data:", vendorProfile);
      
      // Basic info
      setFormData(prev => ({
        ...prev,
        vendorName: vendorProfile.vendor_name || '',
        vendorCategory: vendorProfile.vendor_category || '',
        description: vendorProfile.description || '',
        contactEmail: vendorProfile.contact_email || '',
        phoneNumber: vendorProfile.phone_number || '',
        websiteUrl: vendorProfile.website_url || '',
        // Parse address data safely
        city: vendorProfile.address?.city || '',
        state: vendorProfile.address?.state || '',
        country: vendorProfile.address?.country || 'India',
        fullAddress: vendorProfile.address?.full_address || '',
        // Parse pricing data safely
        minPrice: vendorProfile.pricing_range?.min?.toString() || '',
        maxPrice: vendorProfile.pricing_range?.max?.toString() || '',
        currency: vendorProfile.pricing_range?.currency || 'INR',
        // Parse details data safely
        selectedAmenities: vendorProfile.details?.amenities || [],
        services: vendorProfile.details?.services?.join(', ') || '',
        capacity: vendorProfile.details?.capacity?.toString() || '',
        style: vendorProfile.details?.style || '',
        specializations: vendorProfile.details?.specializations?.join(', ') || '',
        policies: vendorProfile.details?.policies?.join(', ') || '',
        ritualOfferings: vendorProfile.details?.ritual_offerings?.join(', ') || '',
      }));
      
      setDataLoaded(true);
    } else if (!vendorProfile && !dataLoaded) {
      // No existing vendor profile, mark as loaded to prevent further checks
      setDataLoaded(true);
    }
  }, [user, vendorProfile, navigate, dataLoaded]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenity)
        ? prev.selectedAmenities.filter(a => a !== amenity)
        : [...prev.selectedAmenities, amenity]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.vendorName && formData.vendorCategory && formData.description);
      case 2:
        return !!(formData.contactEmail && formData.city && formData.state);
      case 3:
        return !!(formData.minPrice && formData.maxPrice);
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast({
        title: "Please fill required fields",
        description: "All required fields must be completed before proceeding.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const amenitiesList = [
        ...formData.selectedAmenities,
        ...(formData.customAmenities ? formData.customAmenities.split(',').map(a => a.trim()) : [])
      ].filter(Boolean);

      const vendorData = {
        vendor_name: formData.vendorName,
        vendor_category: formData.vendorCategory,
        description: formData.description,
        contact_email: formData.contactEmail,
        phone_number: formData.phoneNumber || null,
        website_url: formData.websiteUrl || null,
        supabase_auth_uid: user.id,
        address: {
          city: formData.city,
          state: formData.state,
          country: formData.country,
          full_address: formData.fullAddress,
        },
        pricing_range: {
          min: parseFloat(formData.minPrice),
          max: parseFloat(formData.maxPrice),
          currency: formData.currency,
        },
        details: {
          amenities: amenitiesList,
          services: formData.services ? formData.services.split(',').map(s => s.trim()).filter(Boolean) : [],
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          style: formData.style || null,
          specializations: formData.specializations ? formData.specializations.split(',').map(s => s.trim()).filter(Boolean) : [],
          policies: formData.policies ? formData.policies.split(',').map(s => s.trim()).filter(Boolean) : [],
          ritual_offerings: formData.ritualOfferings ? formData.ritualOfferings.split(',').map(s => s.trim()).filter(Boolean) : []
        },
      };

      console.log("Submitting vendor data:", vendorData);

      if (isUpdating && vendorProfile) {
        // Update existing vendor
        const { error } = await supabase
          .from('vendors')
          .update(vendorData)
          .eq('vendor_id', vendorProfile.vendor_id);

        if (error) {
          console.error("Update error:", error);
          throw error;
        }

        toast({
          title: "Profile updated successfully!",
          description: "Your vendor profile has been updated.",
        });
      } else {
        // Insert new vendor
        const { error } = await supabase
          .from('vendors')
          .insert([vendorData]);

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }

        toast({
          title: "Onboarding completed successfully!",
          description: "Welcome to the vendor portal!",
        });
      }

      await refreshVendorProfile();
      navigate('/');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
    toast({
      title: "Onboarding skipped",
      description: "You can complete your profile later from the profile page.",
    });
  };

  const handleVenueOnboardingComplete = () => {
    navigate('/');
  };

  const handleShowVenueForm = () => {
    setShowVenueForm(true);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Show comprehensive venue form for first-time users or when specifically requested
  if (showVenueForm || (!vendorProfile && !isUpdating)) {
    return <VenueOnboardingForm onComplete={handleVenueOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isUpdating ? 'Update Your Profile' : 'Welcome to Sanskara AI!'}
          </h1>
          <p className="text-gray-600">
            {isUpdating 
              ? 'Update your vendor profile information' 
              : 'Let\'s set up your vendor profile to get started'
            }
          </p>
          
          {!isUpdating && (
            <div className="flex justify-center gap-4 mt-4">
              <Button onClick={handleShowVenueForm} className="bg-blue-600 hover:bg-blue-700">
                Venue Onboarding (Recommended)
              </Button>
              <Button variant="outline" onClick={handleSkip}>
                Skip for now
              </Button>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i + 1}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep > i + 1 
                    ? 'bg-green-500 text-white' 
                    : currentStep === i + 1 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }`}
              >
                {currentStep > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
            ))}
          </div>
          <div className="text-center mt-2 text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="mb-4">Basic Information</CardTitle>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="vendorName">Business Name *</Label>
                      <Input
                        id="vendorName"
                        value={formData.vendorName}
                        onChange={(e) => handleInputChange('vendorName', e.target.value)}
                        placeholder="Enter your business name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="vendorCategory">Business Category *</Label>
                      <Select 
                        value={formData.vendorCategory} 
                        onValueChange={(value) => handleInputChange('vendorCategory', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your business category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Business Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe your business and services"
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="mb-4">Contact & Location</CardTitle>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="contactEmail">Contact Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="websiteUrl">Website URL</Label>
                      <Input
                        id="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                        placeholder="https://yourbusiness.com"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="City"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          placeholder="State"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="fullAddress">Full Address</Label>
                      <Textarea
                        id="fullAddress"
                        value={formData.fullAddress}
                        onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                        placeholder="Complete address with landmarks"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="mb-4">Pricing Information</CardTitle>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="minPrice">Minimum Price *</Label>
                        <Input
                          id="minPrice"
                          type="number"
                          value={formData.minPrice}
                          onChange={(e) => handleInputChange('minPrice', e.target.value)}
                          placeholder="10000"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="maxPrice">Maximum Price *</Label>
                        <Input
                          id="maxPrice"
                          type="number"
                          value={formData.maxPrice}
                          onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                          placeholder="100000"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select 
                          value={formData.currency} 
                          onValueChange={(value) => handleInputChange('currency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="mb-4">Additional Details</CardTitle>
                  <div className="space-y-6">
                    <div>
                      <Label>Amenities</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {commonAmenities.map(amenity => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              id={amenity}
                              checked={formData.selectedAmenities.includes(amenity)}
                              onCheckedChange={() => handleAmenityToggle(amenity)}
                            />
                            <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4">
                        <Label htmlFor="customAmenities">Custom Amenities (comma separated)</Label>
                        <Input
                          id="customAmenities"
                          value={formData.customAmenities}
                          onChange={(e) => handleInputChange('customAmenities', e.target.value)}
                          placeholder="Custom amenity 1, Custom amenity 2"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="services">Services Offered</Label>
                        <Input
                          id="services"
                          value={formData.services}
                          onChange={(e) => handleInputChange('services', e.target.value)}
                          placeholder="Service 1, Service 2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={formData.capacity}
                          onChange={(e) => handleInputChange('capacity', e.target.value)}
                          placeholder="100"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="style">Style</Label>
                        <Input
                          id="style"
                          value={formData.style}
                          onChange={(e) => handleInputChange('style', e.target.value)}
                          placeholder="Traditional, Modern, etc."
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="specializations">Specializations</Label>
                        <Input
                          id="specializations"
                          value={formData.specializations}
                          onChange={(e) => handleInputChange('specializations', e.target.value)}
                          placeholder="Weddings, Corporate Events"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="policies">Policies (comma separated)</Label>
                      <Textarea
                        id="policies"
                        value={formData.policies}
                        onChange={(e) => handleInputChange('policies', e.target.value)}
                        placeholder="Cancellation policy, Payment terms, etc."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="ritualOfferings">Ritual/AI Offerings (comma separated)</Label>
                      <Textarea
                        id="ritualOfferings"
                        value={formData.ritualOfferings}
                        onChange={(e) => handleInputChange('ritualOfferings', e.target.value)}
                        placeholder="Traditional ceremonies, AI-powered services, etc."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              <div className="flex space-x-2">
                {currentStep < totalSteps ? (
                  <Button onClick={nextStep}>
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isUpdating ? 'Updating...' : 'Completing...'}
                      </>
                    ) : (
                      isUpdating ? 'Update Profile' : 'Complete Onboarding'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorOnboarding;

