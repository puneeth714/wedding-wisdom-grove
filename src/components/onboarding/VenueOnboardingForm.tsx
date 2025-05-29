import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface HallDetails {
  hallName: string;
  spaceType: string;
  otherSpaceType: string;
  theatreCapacity: string;
  banquetCapacity: string;
  floatingCapacity: string;
  separateDining: boolean;
  diningCapacity: string;
  areaDimensions: string;
  acType: string;
  stageAvailable: boolean;
  stageDimensions: string;
  danceFloorAvailable: boolean;
  danceFloorSize: string;
  ambienceDescription: string;
}

interface VenueFormData {
  // Basic Information
  venueName: string;
  fullAddress: string;
  contactPersonName: string;
  phoneNumbers: string;
  email: string;
  websiteLinks: string;
  yearsInOperation: string;
  
  // Hall Details
  halls: HallDetails[];
  
  // Pricing & Catering
  rentalIncludedInCatering: boolean;
  weekdayRate: string;
  weekendRate: string;
  festivalRate: string;
  durationOptions: string[];
  hourlyRate: string;
  basicRentalIncludes: string[];
  cateringOptions: string;
  outsideCaterersInfo: string;
  royaltyFee: boolean;
  kitchenAccess: boolean;
  vegStandardRange: string;
  vegDeluxeRange: string;
  nonVegStandardRange: string;
  nonVegDeluxeRange: string;
  cuisineSpecialties: string[];
  menuCustomization: string;
  
  // Alcohol Policy
  alcoholAllowed: boolean;
  inHouseBar: boolean;
  permitRequired: boolean;
  corkageFee: string;
  
  // Decoration
  decorationOptions: string;
  outsideDecoratorRestrictions: string;
  basicDecorIncluded: boolean;
  basicDecorDetails: string;
  decorPackageRange: string;
  decorThemes: string;
  decorCustomization: boolean;
  popularThemes: string;
  
  // Taxes & Payment
  gstApplied: boolean;
  gstPercentage: string;
  otherCharges: string;
  advanceAmount: string;
  paymentTerms: string;
  cancellationPolicy: string;
  paymentModes: string[];
  
  // Amenities
  carParkingCapacity: string;
  bikesParkingCapacity: string;
  valetParking: boolean;
  valetCost: string;
  totalRooms: string;
  acRooms: string;
  nonAcRooms: string;
  complimentaryRooms: boolean;
  extraRoomCharges: string;
  roomAmenities: string[];
  generatorCapacity: string;
  backupDuration: string;
  soundSystem: string;
  projectorScreen: string;
  djServices: string;
  djCost: string;
  washroomCount: string;
  washroomDescription: string;
  wheelchairAccess: boolean;
  elevatorAccess: boolean;
  staffCount: string;
  staffServices: string;
  wifiAvailable: boolean;
  
  // Ritual & Cultural
  fireRitualAllowed: string;
  mandapSetupInfo: string;
  
  // AI & Operational
  bookingSystem: string;
  aiIntegration: boolean;
  uniqueFeatures: string;
  idealClientProfile: string;
  flexibilityLevel: string;
  aiSuggestions: string;
  preferredLeadMode: string;
  venueRules: string;
}

const VenueOnboardingForm: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user, refreshVendorProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 6;

  const [formData, setFormData] = useState<VenueFormData>({
    venueName: '',
    fullAddress: '',
    contactPersonName: '',
    phoneNumbers: '',
    email: '',
    websiteLinks: '',
    yearsInOperation: '',
    halls: [{
      hallName: '',
      spaceType: '',
      otherSpaceType: '',
      theatreCapacity: '',
      banquetCapacity: '',
      floatingCapacity: '',
      separateDining: false,
      diningCapacity: '',
      areaDimensions: '',
      acType: '',
      stageAvailable: false,
      stageDimensions: '',
      danceFloorAvailable: false,
      danceFloorSize: '',
      ambienceDescription: ''
    }],
    rentalIncludedInCatering: false,
    weekdayRate: '',
    weekendRate: '',
    festivalRate: '',
    durationOptions: [],
    hourlyRate: '',
    basicRentalIncludes: [],
    cateringOptions: '',
    outsideCaterersInfo: '',
    royaltyFee: false,
    kitchenAccess: false,
    vegStandardRange: '',
    vegDeluxeRange: '',
    nonVegStandardRange: '',
    nonVegDeluxeRange: '',
    cuisineSpecialties: [],
    menuCustomization: '',
    alcoholAllowed: false,
    inHouseBar: false,
    permitRequired: false,
    corkageFee: '',
    decorationOptions: '',
    outsideDecoratorRestrictions: '',
    basicDecorIncluded: false,
    basicDecorDetails: '',
    decorPackageRange: '',
    decorThemes: '',
    decorCustomization: false,
    popularThemes: '',
    gstApplied: false,
    gstPercentage: '',
    otherCharges: '',
    advanceAmount: '',
    paymentTerms: '',
    cancellationPolicy: '',
    paymentModes: [],
    carParkingCapacity: '',
    bikesParkingCapacity: '',
    valetParking: false,
    valetCost: '',
    totalRooms: '',
    acRooms: '',
    nonAcRooms: '',
    complimentaryRooms: false,
    extraRoomCharges: '',
    roomAmenities: [],
    generatorCapacity: '',
    backupDuration: '',
    soundSystem: '',
    projectorScreen: '',
    djServices: '',
    djCost: '',
    washroomCount: '',
    washroomDescription: '',
    wheelchairAccess: false,
    elevatorAccess: false,
    staffCount: '',
    staffServices: '',
    wifiAvailable: false,
    fireRitualAllowed: '',
    mandapSetupInfo: '',
    bookingSystem: '',
    aiIntegration: false,
    uniqueFeatures: '',
    idealClientProfile: '',
    flexibilityLevel: '',
    aiSuggestions: '',
    preferredLeadMode: '',
    venueRules: ''
  });

  const handleInputChange = (field: keyof VenueFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: keyof VenueFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }));
  };

  const addHall = () => {
    setFormData(prev => ({
      ...prev,
      halls: [...prev.halls, {
        hallName: '',
        spaceType: '',
        otherSpaceType: '',
        theatreCapacity: '',
        banquetCapacity: '',
        floatingCapacity: '',
        separateDining: false,
        diningCapacity: '',
        areaDimensions: '',
        acType: '',
        stageAvailable: false,
        stageDimensions: '',
        danceFloorAvailable: false,
        danceFloorSize: '',
        ambienceDescription: ''
      }]
    }));
  };

  const updateHall = (index: number, field: keyof HallDetails, value: any) => {
    setFormData(prev => ({
      ...prev,
      halls: prev.halls.map((hall, i) => 
        i === index ? { ...hall, [field]: value } : hall
      )
    }));
  };

  const removeHall = (index: number) => {
    if (formData.halls.length > 1) {
      setFormData(prev => ({
        ...prev,
        halls: prev.halls.filter((_, i) => i !== index)
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.venueName && formData.fullAddress && formData.contactPersonName && formData.phoneNumbers && formData.email);
      case 2:
        return formData.halls.every(hall => hall.hallName && hall.spaceType);
      case 3:
        return !!(formData.cateringOptions);
      case 4:
        return true; // Optional step
      case 5:
        return true; // Optional step
      case 6:
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
      // Prepare vendor data
      const vendorData = {
        vendor_name: formData.venueName,
        vendor_category: 'Venue',
        description: formData.uniqueFeatures,
        contact_email: formData.email,
        phone_number: formData.phoneNumbers,
        website_url: formData.websiteLinks || null,
        supabase_auth_uid: user.id,
        address: {
          full_address: formData.fullAddress,
          city: '', // Extract from address if needed
          state: '',
          country: 'India'
        },
        pricing_range: {
          min: formData.weekdayRate || '0',
          max: formData.festivalRate || '0',
          currency: 'INR'
        },
        details: {
          contact_person: formData.contactPersonName,
          years_in_operation: formData.yearsInOperation,
          halls: formData.halls,
          rental_policy: {
            rental_included_in_catering: formData.rentalIncludedInCatering,
            weekday_rate: formData.weekdayRate,
            weekend_rate: formData.weekendRate,
            festival_rate: formData.festivalRate,
            duration_options: formData.durationOptions,
            hourly_rate: formData.hourlyRate,
            basic_rental_includes: formData.basicRentalIncludes
          },
          catering: {
            options: formData.cateringOptions,
            outside_caterers_info: formData.outsideCaterersInfo,
            royalty_fee: formData.royaltyFee,
            kitchen_access: formData.kitchenAccess,
            veg_standard_range: formData.vegStandardRange,
            veg_deluxe_range: formData.vegDeluxeRange,
            nonveg_standard_range: formData.nonVegStandardRange,
            nonveg_deluxe_range: formData.nonVegDeluxeRange,
            cuisine_specialties: formData.cuisineSpecialties,
            menu_customization: formData.menuCustomization
          },
          alcohol_policy: {
            allowed: formData.alcoholAllowed,
            inhouse_bar: formData.inHouseBar,
            permit_required: formData.permitRequired,
            corkage_fee: formData.corkageFee
          },
          decoration: {
            options: formData.decorationOptions,
            restrictions: formData.outsideDecoratorRestrictions,
            basic_included: formData.basicDecorIncluded,
            basic_details: formData.basicDecorDetails,
            package_range: formData.decorPackageRange,
            themes: formData.decorThemes,
            customization: formData.decorCustomization,
            popular_themes: formData.popularThemes
          },
          payment: {
            gst_applied: formData.gstApplied,
            gst_percentage: formData.gstPercentage,
            other_charges: formData.otherCharges,
            advance_amount: formData.advanceAmount,
            payment_terms: formData.paymentTerms,
            cancellation_policy: formData.cancellationPolicy,
            payment_modes: formData.paymentModes
          },
          amenities: {
            parking: {
              car_capacity: formData.carParkingCapacity,
              bikes_capacity: formData.bikesParkingCapacity,
              valet_available: formData.valetParking,
              valet_cost: formData.valetCost
            },
            rooms: {
              total: formData.totalRooms,
              ac_rooms: formData.acRooms,
              non_ac_rooms: formData.nonAcRooms,
              complimentary: formData.complimentaryRooms,
              extra_charges: formData.extraRoomCharges,
              amenities: formData.roomAmenities
            },
            infrastructure: {
              generator_capacity: formData.generatorCapacity,
              backup_duration: formData.backupDuration,
              sound_system: formData.soundSystem,
              projector_screen: formData.projectorScreen,
              dj_services: formData.djServices,
              dj_cost: formData.djCost,
              washroom_count: formData.washroomCount,
              washroom_description: formData.washroomDescription,
              wheelchair_access: formData.wheelchairAccess,
              elevator_access: formData.elevatorAccess,
              staff_count: formData.staffCount,
              staff_services: formData.staffServices,
              wifi_available: formData.wifiAvailable
            }
          },
          cultural: {
            fire_ritual_allowed: formData.fireRitualAllowed,
            mandap_setup_info: formData.mandapSetupInfo
          },
          operational: {
            booking_system: formData.bookingSystem,
            ai_integration: formData.aiIntegration,
            ideal_client_profile: formData.idealClientProfile,
            flexibility_level: formData.flexibilityLevel,
            ai_suggestions: formData.aiSuggestions,
            preferred_lead_mode: formData.preferredLeadMode,
            venue_rules: formData.venueRules
          }
        }
      };

      console.log("Submitting venue onboarding data:", vendorData);

      const { error } = await supabase
        .from('vendors')
        .insert([vendorData]);

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      toast({
        title: "Venue onboarding completed!",
        description: "Welcome to SanskaraAi! Your venue profile has been created.",
      });

      await refreshVendorProfile();
      onComplete();
    } catch (error: any) {
      console.error('Venue onboarding error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete venue onboarding",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SanskaraAi Venue Onboarding
          </h1>
          <p className="text-gray-600">
            Welcome! Please provide complete details about your venue. This will take 15-20 minutes.
          </p>
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
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <CardTitle>Basic Information</CardTitle>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="venueName">Venue Name *</Label>
                    <Input
                      id="venueName"
                      value={formData.venueName}
                      onChange={(e) => handleInputChange('venueName', e.target.value)}
                      placeholder="Enter your venue name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="fullAddress">Full Address with Pin Code *</Label>
                    <Textarea
                      id="fullAddress"
                      value={formData.fullAddress}
                      onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                      placeholder="Enter complete address with pin code"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPersonName">Contact Person Name *</Label>
                      <Input
                        id="contactPersonName"
                        value={formData.contactPersonName}
                        onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                        placeholder="Owner/Manager name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phoneNumbers">Direct Phone Number(s) *</Label>
                      <Input
                        id="phoneNumbers"
                        value={formData.phoneNumbers}
                        onChange={(e) => handleInputChange('phoneNumbers', e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="venue@example.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="yearsInOperation">Years in Operation *</Label>
                      <Input
                        id="yearsInOperation"
                        value={formData.yearsInOperation}
                        onChange={(e) => handleInputChange('yearsInOperation', e.target.value)}
                        placeholder="e.g., 2015 or 8 years"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="websiteLinks">Website or Social Media Links</Label>
                    <Textarea
                      id="websiteLinks"
                      value={formData.websiteLinks}
                      onChange={(e) => handleInputChange('websiteLinks', e.target.value)}
                      placeholder="Website, Instagram, Facebook links (optional)"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Hall Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <CardTitle>Venue Space / Hall Details</CardTitle>
                  <Button onClick={addHall} variant="outline" size="sm">
                    Add Another Hall
                  </Button>
                </div>
                
                {formData.halls.map((hall, index) => (
                  <Card key={index} className="p-4 border-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Hall {index + 1}</h3>
                      {formData.halls.length > 1 && (
                        <Button onClick={() => removeHall(index)} variant="destructive" size="sm">
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Hall Name/Identifier *</Label>
                          <Input
                            value={hall.hallName}
                            onChange={(e) => updateHall(index, 'hallName', e.target.value)}
                            placeholder="e.g., Main Hall, Lawn 1"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label>Type of Space *</Label>
                          <Select value={hall.spaceType} onValueChange={(value) => updateHall(index, 'spaceType', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select space type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="banquet_hall">Banquet Hall</SelectItem>
                              <SelectItem value="open_lawn">Open Lawn</SelectItem>
                              <SelectItem value="rooftop">Rooftop</SelectItem>
                              <SelectItem value="auditorium">Auditorium</SelectItem>
                              <SelectItem value="poolside">Poolside</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {hall.spaceType === 'other' && (
                        <div>
                          <Label>Specify Other Space Type</Label>
                          <Input
                            value={hall.otherSpaceType}
                            onChange={(e) => updateHall(index, 'otherSpaceType', e.target.value)}
                            placeholder="Specify the space type"
                          />
                        </div>
                      )}
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Theatre Style Capacity</Label>
                          <Input
                            type="number"
                            value={hall.theatreCapacity}
                            onChange={(e) => updateHall(index, 'theatreCapacity', e.target.value)}
                            placeholder="Number of people"
                          />
                        </div>
                        
                        <div>
                          <Label>Round Table/Banquet Capacity</Label>
                          <Input
                            type="number"
                            value={hall.banquetCapacity}
                            onChange={(e) => updateHall(index, 'banquetCapacity', e.target.value)}
                            placeholder="Number of people"
                          />
                        </div>
                        
                        <div>
                          <Label>Floating Crowd Capacity</Label>
                          <Input
                            type="number"
                            value={hall.floatingCapacity}
                            onChange={(e) => updateHall(index, 'floatingCapacity', e.target.value)}
                            placeholder="Number of people"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`separateDining-${index}`}
                            checked={hall.separateDining}
                            onCheckedChange={(checked) => updateHall(index, 'separateDining', checked)}
                          />
                          <Label htmlFor={`separateDining-${index}`}>Separate Dining Hall?</Label>
                        </div>
                        
                        {hall.separateDining && (
                          <div>
                            <Label>Dining Capacity</Label>
                            <Input
                              type="number"
                              value={hall.diningCapacity}
                              onChange={(e) => updateHall(index, 'diningCapacity', e.target.value)}
                              placeholder="Number of people"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Area/Dimensions (Sq. Ft or Sq. M)</Label>
                          <Input
                            value={hall.areaDimensions}
                            onChange={(e) => updateHall(index, 'areaDimensions', e.target.value)}
                            placeholder="e.g., 2000 sq ft or 50x40 ft"
                          />
                        </div>
                        
                        <div>
                          <Label>Air Conditioning</Label>
                          <Select value={hall.acType} onValueChange={(value) => updateHall(index, 'acType', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select AC type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no_ac">No AC</SelectItem>
                              <SelectItem value="window_ac">Window ACs</SelectItem>
                              <SelectItem value="split_ac">Split ACs</SelectItem>
                              <SelectItem value="centralized_ac">Centralized AC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`stageAvailable-${index}`}
                            checked={hall.stageAvailable}
                            onCheckedChange={(checked) => updateHall(index, 'stageAvailable', checked)}
                          />
                          <Label htmlFor={`stageAvailable-${index}`}>Stage Available?</Label>
                        </div>
                        
                        {hall.stageAvailable && (
                          <div>
                            <Label>Stage Dimensions</Label>
                            <Input
                              value={hall.stageDimensions}
                              onChange={(e) => updateHall(index, 'stageDimensions', e.target.value)}
                              placeholder="e.g., 20x15 ft"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`danceFloorAvailable-${index}`}
                            checked={hall.danceFloorAvailable}
                            onCheckedChange={(checked) => updateHall(index, 'danceFloorAvailable', checked)}
                          />
                          <Label htmlFor={`danceFloorAvailable-${index}`}>Dance Floor Available?</Label>
                        </div>
                        
                        {hall.danceFloorAvailable && (
                          <div>
                            <Label>Dance Floor Size (Sq. Ft)</Label>
                            <Input
                              value={hall.danceFloorSize}
                              onChange={(e) => updateHall(index, 'danceFloorSize', e.target.value)}
                              placeholder="e.g., 400 sq ft"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label>Ambience/Lighting/Natural Light Description</Label>
                        <Textarea
                          value={hall.ambienceDescription}
                          onChange={(e) => updateHall(index, 'ambienceDescription', e.target.value)}
                          placeholder="Describe the ambience, lighting, natural light, pillars, etc."
                          rows={3}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Step 3: Pricing, Catering, and Packages */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <CardTitle>Pricing, Catering, and Packages</CardTitle>
                
                {/* Rental Charges */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Rental & Booking Charges</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rentalIncluded"
                        checked={formData.rentalIncludedInCatering}
                        onCheckedChange={(checked) => handleInputChange('rentalIncludedInCatering', checked)}
                      />
                      <Label htmlFor="rentalIncluded">Rental Included in Catering Charges?</Label>
                    </div>
                    
                    {!formData.rentalIncludedInCatering && (
                      <>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Weekday Rate (Mon-Thu) ₹</Label>
                            <Input
                              type="number"
                              value={formData.weekdayRate}
                              onChange={(e) => handleInputChange('weekdayRate', e.target.value)}
                              placeholder="Amount"
                            />
                          </div>
                          
                          <div>
                            <Label>Weekend Rate (Fri-Sun) ₹</Label>
                            <Input
                              type="number"
                              value={formData.weekendRate}
                              onChange={(e) => handleInputChange('weekendRate', e.target.value)}
                              placeholder="Amount"
                            />
                          </div>
                          
                          <div>
                            <Label>Auspicious/Festival Dates Rate ₹</Label>
                            <Input
                              type="number"
                              value={formData.festivalRate}
                              onChange={(e) => handleInputChange('festivalRate', e.target.value)}
                              placeholder="Amount"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Rental Duration Options</Label>
                          <div className="grid grid-cols-3 gap-4 mt-2">
                            {['Half Day', 'Full Day', 'Per Hour'].map(option => (
                              <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                  id={option}
                                  checked={formData.durationOptions.includes(option)}
                                  onCheckedChange={() => handleArrayToggle('durationOptions', option)}
                                />
                                <Label htmlFor={option}>{option}</Label>
                              </div>
                            ))}
                          </div>
                          
                          {formData.durationOptions.includes('Per Hour') && (
                            <div className="mt-2">
                              <Label>Rate per hour ₹</Label>
                              <Input
                                type="number"
                                value={formData.hourlyRate}
                                onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                                placeholder="Amount per hour"
                              />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <Label>What is Included in the Basic Rental?</Label>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            {['Tables & Chairs', 'Basic Lighting', 'Power Backup', 'Cleaning & Maintenance'].map(item => (
                              <div key={item} className="flex items-center space-x-2">
                                <Checkbox
                                  id={item}
                                  checked={formData.basicRentalIncludes.includes(item)}
                                  onCheckedChange={() => handleArrayToggle('basicRentalIncludes', item)}
                                />
                                <Label htmlFor={item}>{item}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
                
                {/* Food & Catering */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Food & Catering</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Catering Options Allowed *</Label>
                      <Select value={formData.cateringOptions} onValueChange={(value) => handleInputChange('cateringOptions', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select catering option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inhouse_only">In-house Catering Only</SelectItem>
                          <SelectItem value="outside_allowed">Outside Caterers Allowed</SelectItem>
                          <SelectItem value="both_allowed">Both Allowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {(formData.cateringOptions === 'outside_allowed' || formData.cateringOptions === 'both_allowed') && (
                      <>
                        <div>
                          <Label>Outside Caterers - Tie-ups or Approved Vendors</Label>
                          <Textarea
                            value={formData.outsideCaterersInfo}
                            onChange={(e) => handleInputChange('outsideCaterersInfo', e.target.value)}
                            placeholder="List any approved vendors or tie-ups"
                            rows={2}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="royaltyFee"
                              checked={formData.royaltyFee}
                              onCheckedChange={(checked) => handleInputChange('royaltyFee', checked)}
                            />
                            <Label htmlFor="royaltyFee">Royalty Fee Charged?</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="kitchenAccess"
                              checked={formData.kitchenAccess}
                              onCheckedChange={(checked) => handleInputChange('kitchenAccess', checked)}
                            />
                            <Label htmlFor="kitchenAccess">Kitchen Access Provided?</Label>
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Veg Standard Range ₹ (Min - Max)</Label>
                        <Input
                          value={formData.vegStandardRange}
                          onChange={(e) => handleInputChange('vegStandardRange', e.target.value)}
                          placeholder="e.g., 300 - 500"
                        />
                      </div>
                      
                      <div>
                        <Label>Veg Deluxe Range ₹ (Min - Max)</Label>
                        <Input
                          value={formData.vegDeluxeRange}
                          onChange={(e) => handleInputChange('vegDeluxeRange', e.target.value)}
                          placeholder="e.g., 500 - 800"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Non-Veg Standard Range ₹ (Min - Max)</Label>
                        <Input
                          value={formData.nonVegStandardRange}
                          onChange={(e) => handleInputChange('nonVegStandardRange', e.target.value)}
                          placeholder="e.g., 400 - 600"
                        />
                      </div>
                      
                      <div>
                        <Label>Non-Veg Deluxe Range ₹ (Min - Max)</Label>
                        <Input
                          value={formData.nonVegDeluxeRange}
                          onChange={(e) => handleInputChange('nonVegDeluxeRange', e.target.value)}
                          placeholder="e.g., 600 - 1000"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Cuisine Specialties Offered</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {['North Indian', 'South Indian', 'Chinese', 'Continental', 'Live Counters', 'Jain Food', 'Satvic Food'].map(cuisine => (
                          <div key={cuisine} className="flex items-center space-x-2">
                            <Checkbox
                              id={cuisine}
                              checked={formData.cuisineSpecialties.includes(cuisine)}
                              onCheckedChange={() => handleArrayToggle('cuisineSpecialties', cuisine)}
                            />
                            <Label htmlFor={cuisine}>{cuisine}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Menu Customization Allowed?</Label>
                      <RadioGroup value={formData.menuCustomization} onValueChange={(value) => handleInputChange('menuCustomization', value)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="customization-yes" />
                          <Label htmlFor="customization-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="customization-no" />
                          <Label htmlFor="customization-no">No</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="partial" id="customization-partial" />
                          <Label htmlFor="customization-partial">Partial</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 4: Alcohol & Decoration */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <CardTitle>Alcohol Policy & Decoration</CardTitle>
                
                {/* Alcohol Policy */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Alcohol Policy</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="alcoholAllowed"
                          checked={formData.alcoholAllowed}
                          onCheckedChange={(checked) => handleInputChange('alcoholAllowed', checked)}
                        />
                        <Label htmlFor="alcoholAllowed">Alcohol Allowed?</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inHouseBar"
                          checked={formData.inHouseBar}
                          onCheckedChange={(checked) => handleInputChange('inHouseBar', checked)}
                        />
                        <Label htmlFor="inHouseBar">In-house Bar Available?</Label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="permitRequired"
                          checked={formData.permitRequired}
                          onCheckedChange={(checked) => handleInputChange('permitRequired', checked)}
                        />
                        <Label htmlFor="permitRequired">Permit Required?</Label>
                      </div>
                      
                      <div>
                        <Label>Corkage Fee (if applicable)</Label>
                        <Input
                          value={formData.corkageFee}
                          onChange={(e) => handleInputChange('corkageFee', e.target.value)}
                          placeholder="e.g., ₹500 per bottle or No"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Decoration */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Decoration</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Decoration Options</Label>
                      <Select value={formData.decorationOptions} onValueChange={(value) => handleInputChange('decorationOptions', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select decoration option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inhouse_only">In-house Decorator Only</SelectItem>
                          <SelectItem value="outside_allowed">Outside Decorators Allowed</SelectItem>
                          <SelectItem value="both_allowed">Both Allowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {(formData.decorationOptions === 'outside_allowed' || formData.decorationOptions === 'both_allowed') && (
                      <div>
                        <Label>Restrictions for Outside Decorators</Label>
                        <Textarea
                          value={formData.outsideDecoratorRestrictions}
                          onChange={(e) => handleInputChange('outsideDecoratorRestrictions', e.target.value)}
                          placeholder="Any restrictions or guidelines for outside decorators"
                          rows={2}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="basicDecorIncluded"
                        checked={formData.basicDecorIncluded}
                        onCheckedChange={(checked) => handleInputChange('basicDecorIncluded', checked)}
                      />
                      <Label htmlFor="basicDecorIncluded">Basic Decor Included?</Label>
                    </div>
                    
                    {formData.basicDecorIncluded && (
                      <div>
                        <Label>What's Included in Basic Decor?</Label>
                        <Input
                          value={formData.basicDecorDetails}
                          onChange={(e) => handleInputChange('basicDecorDetails', e.target.value)}
                          placeholder="e.g., Basic lighting, table covers, centerpieces"
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Standard Decor Package Range ₹ (Min - Max)</Label>
                        <Input
                          value={formData.decorPackageRange}
                          onChange={(e) => handleInputChange('decorPackageRange', e.target.value)}
                          placeholder="e.g., 10000 - 50000"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-6">
                        <Checkbox
                          id="decorCustomization"
                          checked={formData.decorCustomization}
                          onCheckedChange={(checked) => handleInputChange('decorCustomization', checked)}
                        />
                        <Label htmlFor="decorCustomization">Customization Allowed?</Label>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Themes/Styles Offered</Label>
                      <Textarea
                        value={formData.decorThemes}
                        onChange={(e) => handleInputChange('decorThemes', e.target.value)}
                        placeholder="List themes and styles available"
                        rows={2}
                      />
                    </div>
                    
                    {formData.decorCustomization && (
                      <div>
                        <Label>Popular Themes with Price Range</Label>
                        <Textarea
                          value={formData.popularThemes}
                          onChange={(e) => handleInputChange('popularThemes', e.target.value)}
                          placeholder="e.g., Royal Theme (₹25000-50000), Garden Theme (₹15000-30000)"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Step 5: Taxes, Payment & Amenities */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <CardTitle>Taxes, Payment & Amenities</CardTitle>
                
                {/* Taxes & Payment */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Taxes & Payment</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="gstApplied"
                          checked={formData.gstApplied}
                          onCheckedChange={(checked) => handleInputChange('gstApplied', checked)}
                        />
                        <Label htmlFor="gstApplied">GST Applied?</Label>
                      </div>
                      
                      {formData.gstApplied && (
                        <div>
                          <Label>GST %</Label>
                          <Input
                            value={formData.gstPercentage}
                            onChange={(e) => handleInputChange('gstPercentage', e.target.value)}
                            placeholder="e.g., 18"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label>Other Charges/Hidden Fees (if any)</Label>
                      <Textarea
                        value={formData.otherCharges}
                        onChange={(e) => handleInputChange('otherCharges', e.target.value)}
                        placeholder="Any additional charges not mentioned above"
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Advance Booking Amount</Label>
                        <Input
                          value={formData.advanceAmount}
                          onChange={(e) => handleInputChange('advanceAmount', e.target.value)}
                          placeholder="e.g., 25% of total or ₹50000"
                        />
                      </div>
                      
                      <div>
                        <Label>Payment Terms & Schedule</Label>
                        <Textarea
                          value={formData.paymentTerms}
                          onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                          placeholder="When is payment due? (booking, before event, etc.)"
                          rows={2}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Cancellation & Refund Policy</Label>
                      <Textarea
                        value={formData.cancellationPolicy}
                        onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                        placeholder="Explain cancellation terms and refund policy"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Accepted Payment Modes</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {['UPI', 'Bank Transfer', 'Credit/Debit Cards', 'Cash', 'Cheque'].map(mode => (
                          <div key={mode} className="flex items-center space-x-2">
                            <Checkbox
                              id={mode}
                              checked={formData.paymentModes.includes(mode)}
                              onCheckedChange={() => handleArrayToggle('paymentModes', mode)}
                            />
                            <Label htmlFor={mode}>{mode}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Amenities */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Amenities & Facilities</h3>
                  
                  <div className="space-y-4">
                    {/* Parking */}
                    <div>
                      <h4 className="font-medium mb-2">Parking</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Car Parking Capacity</Label>
                          <Input
                            type="number"
                            value={formData.carParkingCapacity}
                            onChange={(e) => handleInputChange('carParkingCapacity', e.target.value)}
                            placeholder="Number of cars"
                          />
                        </div>
                        
                        <div>
                          <Label>2-Wheeler Parking Capacity</Label>
                          <Input
                            type="number"
                            value={formData.bikesParkingCapacity}
                            onChange={(e) => handleInputChange('bikesParkingCapacity', e.target.value)}
                            placeholder="Number of bikes"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="valetParking"
                            checked={formData.valetParking}
                            onCheckedChange={(checked) => handleInputChange('valetParking', checked)}
                          />
                          <Label htmlFor="valetParking">Valet Parking Available?</Label>
                        </div>
                        
                        {formData.valetParking && (
                          <div>
                            <Label>Valet Cost ₹</Label>
                            <Input
                              value={formData.valetCost}
                              onChange={(e) => handleInputChange('valetCost', e.target.value)}
                              placeholder="Additional cost for valet"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Rooms */}
                    <div>
                      <h4 className="font-medium mb-2">Rooms Availability</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Total Rooms</Label>
                          <Input
                            type="number"
                            value={formData.totalRooms}
                            onChange={(e) => handleInputChange('totalRooms', e.target.value)}
                            placeholder="Total rooms"
                          />
                        </div>
                        
                        <div>
                          <Label>AC Rooms</Label>
                          <Input
                            type="number"
                            value={formData.acRooms}
                            onChange={(e) => handleInputChange('acRooms', e.target.value)}
                            placeholder="AC rooms"
                          />
                        </div>
                        
                        <div>
                          <Label>Non-AC Rooms</Label>
                          <Input
                            type="number"
                            value={formData.nonAcRooms}
                            onChange={(e) => handleInputChange('nonAcRooms', e.target.value)}
                            placeholder="Non-AC rooms"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="complimentaryRooms"
                            checked={formData.complimentaryRooms}
                            onCheckedChange={(checked) => handleInputChange('complimentaryRooms', checked)}
                          />
                          <Label htmlFor="complimentaryRooms">Complimentary Rooms Offered?</Label>
                        </div>
                        
                        <div>
                          <Label>Extra Room Charges ₹</Label>
                          <Input
                            value={formData.extraRoomCharges}
                            onChange={(e) => handleInputChange('extraRoomCharges', e.target.value)}
                            placeholder="Per room charges"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <Label>Room Amenities</Label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          {['AC/Fan', 'Attached Washroom', 'Geyser', 'Wardrobe'].map(amenity => (
                            <div key={amenity} className="flex items-center space-x-2">
                              <Checkbox
                                id={amenity}
                                checked={formData.roomAmenities.includes(amenity)}
                                onCheckedChange={() => handleArrayToggle('roomAmenities', amenity)}
                              />
                              <Label htmlFor={amenity}>{amenity}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Other Amenities */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Generator Capacity (kVA)</Label>
                        <Input
                          value={formData.generatorCapacity}
                          onChange={(e) => handleInputChange('generatorCapacity', e.target.value)}
                          placeholder="e.g., 100 kVA"
                        />
                      </div>
                      
                      <div>
                        <Label>Backup Duration (Hours)</Label>
                        <Input
                          value={formData.backupDuration}
                          onChange={(e) => handleInputChange('backupDuration', e.target.value)}
                          placeholder="e.g., 8 hours"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="wheelchairAccess"
                          checked={formData.wheelchairAccess}
                          onCheckedChange={(checked) => handleInputChange('wheelchairAccess', checked)}
                        />
                        <Label htmlFor="wheelchairAccess">Wheelchair Access?</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="elevatorAccess"
                          checked={formData.elevatorAccess}
                          onCheckedChange={(checked) => handleInputChange('elevatorAccess', checked)}
                        />
                        <Label htmlFor="elevatorAccess">Elevator Access?</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="wifiAvailable"
                          checked={formData.wifiAvailable}
                          onCheckedChange={(checked) => handleInputChange('wifiAvailable', checked)}
                        />
                        <Label htmlFor="wifiAvailable">Wi-Fi Available?</Label>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 6: Cultural, AI & Final Details */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <CardTitle>Cultural Support & AI Integration</CardTitle>
                
                {/* Ritual & Cultural */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Ritual & Cultural Support</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Fire/Hawan Ritual Allowed?</Label>
                      <Select value={formData.fireRitualAllowed} onValueChange={(value) => handleInputChange('fireRitualAllowed', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indoor">Indoor</SelectItem>
                          <SelectItem value="outdoor">Outdoor</SelectItem>
                          <SelectItem value="not_allowed">Not Allowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Mandap Setup Location Preferences or Restrictions</Label>
                      <Textarea
                        value={formData.mandapSetupInfo}
                        onChange={(e) => handleInputChange('mandapSetupInfo', e.target.value)}
                        placeholder="Any specific locations or restrictions for mandap setup"
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
                
                {/* AI & Operational */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">AI Integration & Operations</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Current Booking & Calendar Management System</Label>
                      <Select value={formData.bookingSystem} onValueChange={(value) => handleInputChange('bookingSystem', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your current system" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual (Notebook/Phone)</SelectItem>
                          <SelectItem value="google_calendar">Google Calendar</SelectItem>
                          <SelectItem value="crm_software">CRM Software</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="aiIntegration"
                        checked={formData.aiIntegration}
                        onCheckedChange={(checked) => handleInputChange('aiIntegration', checked)}
                      />
                      <Label htmlFor="aiIntegration">Willing to Integrate with SanskaraAi App/Portal?</Label>
                    </div>
                    
                    <div>
                      <Label>Unique Features / Selling Points of Your Venue</Label>
                      <Textarea
                        value={formData.uniqueFeatures}
                        onChange={(e) => handleInputChange('uniqueFeatures', e.target.value)}
                        placeholder="What makes your venue special? List unique features and selling points"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Ideal Client Profile</Label>
                      <Textarea
                        value={formData.idealClientProfile}
                        onChange={(e) => handleInputChange('idealClientProfile', e.target.value)}
                        placeholder="Type of events, budget preferences, client demographics"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label>Flexibility Level (1 to 5)</Label>
                      <Select value={formData.flexibilityLevel} onValueChange={(value) => handleInputChange('flexibilityLevel', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Rate your flexibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Very Rigid</SelectItem>
                          <SelectItem value="2">2 - Somewhat Rigid</SelectItem>
                          <SelectItem value="3">3 - Moderate</SelectItem>
                          <SelectItem value="4">4 - Flexible</SelectItem>
                          <SelectItem value="5">5 - Very Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>AI Menu/Decor Suggestions</Label>
                      <RadioGroup value={formData.aiSuggestions} onValueChange={(value) => handleInputChange('aiSuggestions', value)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ai-yes" />
                          <Label htmlFor="ai-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ai-no" />
                          <Label htmlFor="ai-no">No</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="needs_approval" id="ai-approval" />
                          <Label htmlFor="ai-approval">Needs Approval</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <Label>Preferred Mode of Receiving Leads/Bookings</Label>
                      <Select value={formData.preferredLeadMode} onValueChange={(value) => handleInputChange('preferredLeadMode', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred communication mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone_call">Phone Call</SelectItem>
                          <SelectItem value="in_app_dashboard">In-App Dashboard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Venue Rules or Restrictions Clients Must Know</Label>
                      <Textarea
                        value={formData.venueRules}
                        onChange={(e) => handleInputChange('venueRules', e.target.value)}
                        placeholder="Music cutoff time, decor limitations, usage rules, etc."
                        rows={3}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
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
                        <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                        Completing Onboarding...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Onboarding
                      </>
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

export default VenueOnboardingForm;
