import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface HallDetails {
  name: string;
  type: string;
  custom_type?: string;
  seating_capacity: {
    theatre_style: number;
    round_table: number;
    floating_crowd: number;
  };
  dining: {
    separate_dining_hall: boolean;
    dining_capacity: number;
  };
  area_sqft: string;
  air_conditioning: string;
  stage: {
    available: boolean;
    dimensions?: string;
  };
  dance_floor: {
    available: boolean;
    size_sqft?: string;
  };
  ambience_description: string;
}

interface VenueOnboardingFormProps {
  onComplete: () => void;
}

const VenueOnboardingForm: React.FC<VenueOnboardingFormProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Basic Information
  const [venueName, setVenueName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [yearsInOperation, setYearsInOperation] = useState('');

  // Hall Details
  const [halls, setHalls] = useState<HallDetails[]>([{
    name: '',
    type: '',
    custom_type: '',
    seating_capacity: {
      theatre_style: 0,
      round_table: 0,
      floating_crowd: 0
    },
    dining: {
      separate_dining_hall: false,
      dining_capacity: 0
    },
    area_sqft: '',
    air_conditioning: '',
    stage: {
      available: false,
      dimensions: ''
    },
    dance_floor: {
      available: false,
      size_sqft: ''
    },
    ambience_description: ''
  }]);

  // Pricing & Packages
  const [rentalIncludedInCatering, setRentalIncludedInCatering] = useState(false);
  const [weekdayRate, setWeekdayRate] = useState('');
  const [weekendRate, setWeekendRate] = useState('');
  const [festivalRate, setFestivalRate] = useState('');
  const [durationOptions, setDurationOptions] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [basicRentalIncludes, setBasicRentalIncludes] = useState<string[]>([]);

  // Catering
  const [cateringOptions, setCateringOptions] = useState('');
  const [approvedVendors, setApprovedVendors] = useState('');
  const [royaltyFee, setRoyaltyFee] = useState(false);
  const [kitchenAccess, setKitchenAccess] = useState(false);
  const [vegPriceMin, setVegPriceMin] = useState('');
  const [vegPriceMax, setVegPriceMax] = useState('');
  const [nonVegPriceMin, setNonVegPriceMin] = useState('');
  const [nonVegPriceMax, setNonVegPriceMax] = useState('');
  const [cuisineSpecialties, setCuisineSpecialties] = useState<string[]>([]);
  const [menuCustomization, setMenuCustomization] = useState('');

  // Alcohol Policy
  const [alcoholAllowed, setAlcoholAllowed] = useState(false);
  const [inHouseBar, setInHouseBar] = useState(false);
  const [permitRequired, setPermitRequired] = useState(false);
  const [corkageFee, setCorkageFee] = useState('');

  // Decoration
  const [decorationOptions, setDecorationOptions] = useState('');
  const [decoratorRestrictions, setDecoratorRestrictions] = useState('');
  const [basicDecorIncluded, setBasicDecorIncluded] = useState(false);
  const [basicDecorDetails, setBasicDecorDetails] = useState('');
  const [decorPriceMin, setDecorPriceMin] = useState('');
  const [decorPriceMax, setDecorPriceMax] = useState('');
  const [decorThemes, setDecorThemes] = useState('');
  const [decorCustomization, setDecorCustomization] = useState(false);
  const [popularThemes, setPopularThemes] = useState('');

  // Taxes & Payment
  const [gstApplied, setGstApplied] = useState(false);
  const [gstPercentage, setGstPercentage] = useState('');
  const [otherCharges, setOtherCharges] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [paymentModes, setPaymentModes] = useState<string[]>([]);

  // Amenities
  const [carCapacity, setCarCapacity] = useState('');
  const [twoWheelerCapacity, setTwoWheelerCapacity] = useState('');
  const [valetParking, setValetParking] = useState(false);
  const [valetCost, setValetCost] = useState('');
  const [totalRooms, setTotalRooms] = useState('');
  const [acRooms, setAcRooms] = useState('');
  const [nonAcRooms, setNonAcRooms] = useState('');
  const [complimentaryRooms, setComplimentaryRooms] = useState(false);
  const [extraRoomCharges, setExtraRoomCharges] = useState('');
  const [roomAmenities, setRoomAmenities] = useState<string[]>([]);
  const [generatorCapacity, setGeneratorCapacity] = useState('');
  const [backupDuration, setBackupDuration] = useState('');
  const [soundSystem, setSoundSystem] = useState('');
  const [projectorScreen, setProjectorScreen] = useState('');
  const [djServices, setDjServices] = useState('');
  const [djCost, setDjCost] = useState('');
  const [numberOfWashrooms, setNumberOfWashrooms] = useState('');
  const [washroomDescription, setWashroomDescription] = useState('');
  const [wheelchairAccess, setWheelchairAccess] = useState(false);
  const [elevator, setElevator] = useState(false);
  const [staffProvided, setStaffProvided] = useState('');
  const [staffServices, setStaffServices] = useState('');
  const [wifiAvailable, setWifiAvailable] = useState(false);

  // Ritual & Cultural
  const [fireRitualAllowed, setFireRitualAllowed] = useState('');
  const [mandapSetup, setMandapSetup] = useState('');

  // AI & Operational
  const [currentBookingSystem, setCurrentBookingSystem] = useState('');
  const [sanskaraIntegration, setSanskaraIntegration] = useState(false);
  const [uniqueFeatures, setUniqueFeatures] = useState('');
  const [idealClientProfile, setIdealClientProfile] = useState('');
  const [flexibilityLevel, setFlexibilityLevel] = useState(3);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [preferredLeadMode, setPreferredLeadMode] = useState('');
  const [venueRules, setVenueRules] = useState('');

  const addHall = () => {
    setHalls([...halls, {
      name: '',
      type: '',
      custom_type: '',
      seating_capacity: {
        theatre_style: 0,
        round_table: 0,
        floating_crowd: 0
      },
      dining: {
        separate_dining_hall: false,
        dining_capacity: 0
      },
      area_sqft: '',
      air_conditioning: '',
      stage: {
        available: false,
        dimensions: ''
      },
      dance_floor: {
        available: false,
        size_sqft: ''
      },
      ambience_description: ''
    }]);
  };

  const removeHall = (index: number) => {
    if (halls.length > 1) {
      setHalls(halls.filter((_, i) => i !== index));
    }
  };

  const updateHall = (index: number, field: string, value: any) => {
    const updatedHalls = [...halls];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentObj = updatedHalls[index][parent as keyof HallDetails];
      if (typeof parentObj === 'object' && parentObj !== null) {
        updatedHalls[index] = {
          ...updatedHalls[index],
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      }
    } else {
      updatedHalls[index] = {
        ...updatedHalls[index],
        [field]: value
      };
    }
    setHalls(updatedHalls);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(venueName && fullAddress && contactPerson && phoneNumber && email);
      case 2:
        return halls.every(hall => hall.name && hall.type);
      case 3:
        return true; // Pricing is optional in many cases
      case 4:
        return true; // Amenities are optional
      case 5:
        return true; // Ritual support is optional
      case 6:
        return true; // AI section is optional
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
      const venueData = {
        vendor_name: venueName,
        vendor_category: 'Venue',
        description: uniqueFeatures || `${venueName} - Complete venue facility`,
        contact_email: email,
        phone_number: phoneNumber,
        website_url: website || null,
        supabase_auth_uid: user.id,
        address: {
          full_address: fullAddress,
          city: '',
          state: '',
          country: 'India'
        },
        pricing_range: {
          min: vegPriceMin ? parseFloat(vegPriceMin) : 0,
          max: vegPriceMax ? parseFloat(vegPriceMax) : 0,
          currency: 'INR'
        },
        details: {
          contact_person: contactPerson,
          years_in_operation: yearsInOperation,
          halls: halls,
          rental_policy: {
            rental_included_in_catering: rentalIncludedInCatering,
            weekday_rate: weekdayRate,
            weekend_rate: weekendRate,
            festival_rate: festivalRate,
            duration_options: durationOptions,
            hourly_rate: hourlyRate,
            basic_rental_includes: basicRentalIncludes
          },
          catering: {
            options: cateringOptions,
            approved_vendors: approvedVendors,
            royalty_fee: royaltyFee,
            kitchen_access: kitchenAccess,
            veg_price_range: {
              min: vegPriceMin,
              max: vegPriceMax
            },
            non_veg_price_range: {
              min: nonVegPriceMin,
              max: nonVegPriceMax
            },
            cuisine_specialties: cuisineSpecialties,
            menu_customization: menuCustomization
          },
          alcohol_policy: {
            allowed: alcoholAllowed,
            in_house_bar: inHouseBar,
            permit_required: permitRequired,
            corkage_fee: corkageFee
          },
          decoration: {
            options: decorationOptions,
            restrictions: decoratorRestrictions,
            basic_included: basicDecorIncluded,
            basic_details: basicDecorDetails,
            price_range: {
              min: decorPriceMin,
              max: decorPriceMax
            },
            themes: decorThemes,
            customization: decorCustomization,
            popular_themes: popularThemes
          },
          taxes_payment: {
            gst_applied: gstApplied,
            gst_percentage: gstPercentage,
            other_charges: otherCharges,
            advance_amount: advanceAmount,
            payment_terms: paymentTerms,
            cancellation_policy: cancellationPolicy,
            payment_modes: paymentModes
          },
          amenities: {
            parking: {
              car_capacity: carCapacity,
              two_wheeler_capacity: twoWheelerCapacity,
              valet_available: valetParking,
              valet_cost: valetCost
            },
            rooms: {
              total_rooms: totalRooms,
              ac_rooms: acRooms,
              non_ac_rooms: nonAcRooms,
              complimentary_rooms: complimentaryRooms,
              extra_room_charges: extraRoomCharges,
              amenities: roomAmenities
            },
            power_backup: {
              generator_capacity: generatorCapacity,
              duration: backupDuration
            },
            av_equipment: {
              sound_system: soundSystem,
              projector_screen: projectorScreen,
              dj_services: djServices,
              dj_cost: djCost
            },
            facilities: {
              washrooms: numberOfWashrooms,
              washroom_description: washroomDescription,
              wheelchair_access: wheelchairAccess,
              elevator: elevator,
              staff_provided: staffProvided,
              staff_services: staffServices,
              wifi_available: wifiAvailable
            }
          },
          ritual_cultural: {
            fire_ritual_allowed: fireRitualAllowed,
            mandap_setup: mandapSetup
          },
          operational: {
            current_booking_system: currentBookingSystem,
            sanskara_integration: sanskaraIntegration,
            unique_features: uniqueFeatures,
            ideal_client_profile: idealClientProfile,
            flexibility_level: flexibilityLevel,
            ai_suggestions: aiSuggestions,
            preferred_lead_mode: preferredLeadMode,
            venue_rules: venueRules
          }
        }
      };

      console.log("Submitting venue data:", venueData);

      const { error } = await supabase
        .from('vendors')
        .insert([venueData as any]);

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      toast({
        title: "Venue onboarding completed!",
        description: "Your venue has been successfully registered with SanskaraAI.",
      });

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

  const handleArrayToggle = (value: string, array: string[], setter: (arr: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  const handleBooleanChange = (checked: boolean | "indeterminate", setter: (value: boolean) => void) => {
    setter(checked === true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SanskaraAI Venue Onboarding Form
          </h1>
          <p className="text-gray-600">
            Welcome! This form collects complete details about your venue for onboarding into SanskaraAI's platform.
            Please take 15–20 minutes to fill out this form accurately.
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
                {i + 1}
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
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="Enter venue name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="fullAddress">Full Address with Pin Code *</Label>
                    <Textarea
                      id="fullAddress"
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder="Complete address with pin code"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPerson">Contact Person Name *</Label>
                      <Input
                        id="contactPerson"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="Owner/Manager name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber">Direct Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Contact number"
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contact@venue.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Website or Social Media Links</Label>
                      <Input
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="Website URL or social media"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="yearsInOperation">Years in Operation / Establishment Year *</Label>
                    <Input
                      id="yearsInOperation"
                      value={yearsInOperation}
                      onChange={(e) => setYearsInOperation(e.target.value)}
                      placeholder="e.g., 2010 or 15 years"
                      required
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
                  <Button onClick={addHall} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hall
                  </Button>
                </div>

                {halls.map((hall, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Hall {index + 1}</h3>
                      {halls.length > 1 && (
                        <Button onClick={() => removeHall(index)} size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Name/Identifier of Hall *</Label>
                          <Input
                            value={hall.name}
                            onChange={(e) => updateHall(index, 'name', e.target.value)}
                            placeholder="e.g., Main Hall, Lawn 1"
                          />
                        </div>

                        <div>
                          <Label>Type of Space *</Label>
                          <Select value={hall.type} onValueChange={(value) => updateHall(index, 'type', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select space type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Banquet Hall">Banquet Hall</SelectItem>
                              <SelectItem value="Open Lawn">Open Lawn</SelectItem>
                              <SelectItem value="Rooftop">Rooftop</SelectItem>
                              <SelectItem value="Auditorium">Auditorium</SelectItem>
                              <SelectItem value="Poolside">Poolside</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {hall.type === 'Other' && (
                        <div>
                          <Label>Specify Other Type</Label>
                          <Input
                            value={hall.custom_type}
                            onChange={(e) => updateHall(index, 'custom_type', e.target.value)}
                            placeholder="Specify the type of space"
                          />
                        </div>
                      )}

                      <div>
                        <Label>Seating Capacity</Label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div>
                            <Label className="text-sm">Theatre Style</Label>
                            <Input
                              type="number"
                              value={hall.seating_capacity.theatre_style}
                              onChange={(e) => updateHall(index, 'seating_capacity.theatre_style', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Round Table</Label>
                            <Input
                              type="number"
                              value={hall.seating_capacity.round_table}
                              onChange={(e) => updateHall(index, 'seating_capacity.round_table', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Floating Crowd</Label>
                            <Input
                              type="number"
                              value={hall.seating_capacity.floating_crowd}
                              onChange={(e) => updateHall(index, 'seating_capacity.floating_crowd', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`dining-${index}`}
                            checked={hall.dining.separate_dining_hall}
                            onCheckedChange={(checked) => handleBooleanChange(checked, (value) => updateHall(index, 'dining.separate_dining_hall', value))}
                          />
                          <Label htmlFor={`dining-${index}`}>Separate Dining Hall</Label>
                        </div>
                        {hall.dining.separate_dining_hall && (
                          <div>
                            <Label>Dining Capacity</Label>
                            <Input
                              type="number"
                              value={hall.dining.dining_capacity}
                              onChange={(e) => updateHall(index, 'dining.dining_capacity', parseInt(e.target.value) || 0)}
                              placeholder="Dining capacity"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Area/Dimensions (Sq. Ft.)</Label>
                          <Input
                            value={hall.area_sqft}
                            onChange={(e) => updateHall(index, 'area_sqft', e.target.value)}
                            placeholder="e.g., 2000 sq ft"
                          />
                        </div>

                        <div>
                          <Label>Air Conditioning</Label>
                          <Select value={hall.air_conditioning} onValueChange={(value) => updateHall(index, 'air_conditioning', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select AC type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="No AC">No AC</SelectItem>
                              <SelectItem value="Window ACs">Window ACs</SelectItem>
                              <SelectItem value="Split ACs">Split ACs</SelectItem>
                              <SelectItem value="Centralized AC">Centralized AC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`stage-${index}`}
                            checked={hall.stage.available}
                            onCheckedChange={(checked) => handleBooleanChange(checked, (value) => updateHall(index, 'stage.available', value))}
                          />
                          <Label htmlFor={`stage-${index}`}>Stage Available</Label>
                        </div>
                        {hall.stage.available && (
                          <div>
                            <Label>Stage Dimensions</Label>
                            <Input
                              value={hall.stage.dimensions}
                              onChange={(e) => updateHall(index, 'stage.dimensions', e.target.value)}
                              placeholder="e.g., 20ft x 15ft"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`dance-${index}`}
                            checked={hall.dance_floor.available}
                            onCheckedChange={(checked) => handleBooleanChange(checked, (value) => updateHall(index, 'dance_floor.available', value))}
                          />
                          <Label htmlFor={`dance-${index}`}>Dance Floor Available</Label>
                        </div>
                        {hall.dance_floor.available && (
                          <div>
                            <Label>Dance Floor Size (Sq. Ft.)</Label>
                            <Input
                              value={hall.dance_floor.size_sqft}
                              onChange={(e) => updateHall(index, 'dance_floor.size_sqft', e.target.value)}
                              placeholder="e.g., 400 sq ft"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>Ambience/Lighting/Natural Light Description</Label>
                        <Textarea
                          value={hall.ambience_description}
                          onChange={(e) => updateHall(index, 'ambience_description', e.target.value)}
                          placeholder="Describe the ambience, lighting, and natural light features"
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
                        checked={rentalIncludedInCatering}
                        onCheckedChange={(checked) => handleBooleanChange(checked, setRentalIncludedInCatering)}
                      />
                      <Label htmlFor="rentalIncluded">Is Rental Included in Catering Charges?</Label>
                    </div>

                    {!rentalIncludedInCatering && (
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Weekday Rate (Mon–Thu) ₹</Label>
                          <Input
                            value={weekdayRate}
                            onChange={(e) => setWeekdayRate(e.target.value)}
                            placeholder="e.g., 50000"
                          />
                        </div>
                        <div>
                          <Label>Weekend Rate (Fri–Sun) ₹</Label>
                          <Input
                            value={weekendRate}
                            onChange={(e) => setWeekendRate(e.target.value)}
                            placeholder="e.g., 75000"
                          />
                        </div>
                        <div>
                          <Label>Auspicious/Festival Dates Rate ₹</Label>
                          <Input
                            value={festivalRate}
                            onChange={(e) => setFestivalRate(e.target.value)}
                            placeholder="e.g., 100000"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Rental Duration Options</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {['Half Day', 'Full Day', 'Per Hour'].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={option}
                              checked={durationOptions.includes(option)}
                              onCheckedChange={() => handleArrayToggle(option, durationOptions, setDurationOptions)}
                            />
                            <Label htmlFor={option}>{option}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {durationOptions.includes('Per Hour') && (
                      <div>
                        <Label>Rate per hour ₹</Label>
                        <Input
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          placeholder="e.g., 5000"
                        />
                      </div>
                    )}

                    <div>
                      <Label>What is Included in the Basic Rental?</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {['Tables & Chairs', 'Basic Lighting', 'Power Backup', 'Cleaning & Maintenance'].map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={item}
                              checked={basicRentalIncludes.includes(item)}
                              onCheckedChange={() => handleArrayToggle(item, basicRentalIncludes, setBasicRentalIncludes)}
                            />
                            <Label htmlFor={item}>{item}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Food & Catering */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Food & Catering</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Catering Options Allowed</Label>
                      <Select value={cateringOptions} onValueChange={setCateringOptions}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select catering option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="In-house Catering Only">In-house Catering Only</SelectItem>
                          <SelectItem value="Outside Caterers Allowed">Outside Caterers Allowed</SelectItem>
                          <SelectItem value="Both Allowed">Both Allowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(cateringOptions === 'Outside Caterers Allowed' || cateringOptions === 'Both Allowed') && (
                      <div className="space-y-4">
                        <div>
                          <Label>Any Tie-Ups or Approved Vendors?</Label>
                          <Textarea
                            value={approvedVendors}
                            onChange={(e) => setApprovedVendors(e.target.value)}
                            placeholder="List approved caterers or mention tie-ups"
                            rows={2}
                          />
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="royaltyFee"
                              checked={royaltyFee}
                              onCheckedChange={setRoyaltyFee}
                            />
                            <Label htmlFor="royaltyFee">Royalty Fee Charged?</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="kitchenAccess"
                              checked={kitchenAccess}
                              onCheckedChange={setKitchenAccess}
                            />
                            <Label htmlFor="kitchenAccess">Kitchen Access Provided?</Label>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Price Per Plate (Veg)</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label className="text-sm">Standard Range Min ₹</Label>
                          <Input
                            value={vegPriceMin}
                            onChange={(e) => setVegPriceMin(e.target.value)}
                            placeholder="e.g., 300"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Standard Range Max ₹</Label>
                          <Input
                            value={vegPriceMax}
                            onChange={(e) => setVegPriceMax(e.target.value)}
                            placeholder="e.g., 500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Price Per Plate (Non-Veg)</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label className="text-sm">Standard Range Min ₹</Label>
                          <Input
                            value={nonVegPriceMin}
                            onChange={(e) => setNonVegPriceMin(e.target.value)}
                            placeholder="e.g., 400"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Standard Range Max ₹</Label>
                          <Input
                            value={nonVegPriceMax}
                            onChange={(e) => setNonVegPriceMax(e.target.value)}
                            placeholder="e.g., 700"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Cuisine Specialties Offered</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {['North Indian', 'South Indian', 'Chinese', 'Continental', 'Live Counters', 'Jain Food', 'Satvic Food'].map((cuisine) => (
                          <div key={cuisine} className="flex items-center space-x-2">
                            <Checkbox
                              id={cuisine}
                              checked={cuisineSpecialties.includes(cuisine)}
                              onCheckedChange={() => handleArrayToggle(cuisine, cuisineSpecialties, setCuisineSpecialties)}
                            />
                            <Label htmlFor={cuisine}>{cuisine}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Menu Customization Allowed?</Label>
                      <Select value={menuCustomization} onValueChange={setMenuCustomization}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customization level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Partial">Partial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 4: Amenities & Event Services */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <CardTitle>Amenities & Event Services</CardTitle>

                {/* Parking */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Parking</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Capacity (Cars)</Label>
                      <Input
                        type="number"
                        value={carCapacity}
                        onChange={(e) => setCarCapacity(e.target.value)}
                        placeholder="e.g., 50"
                      />
                    </div>
                    <div>
                      <Label>Capacity (2-Wheelers)</Label>
                      <Input
                        type="number"
                        value={twoWheelerCapacity}
                        onChange={(e) => setTwoWheelerCapacity(e.target.value)}
                        placeholder="e.g., 100"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="valetParking"
                        checked={valetParking}
                        onCheckedChange={setValetParking}
                      />
                      <Label htmlFor="valetParking">Valet Parking Available?</Label>
                    </div>
                    
                    {valetParking && (
                      <div>
                        <Label>Additional Cost ₹</Label>
                        <Input
                          value={valetCost}
                          onChange={(e) => setValetCost(e.target.value)}
                          placeholder="e.g., 100 per car"
                        />
                      </div>
                    )}
                  </div>
                </Card>

                {/* Rooms */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Rooms Availability</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Total Rooms Available</Label>
                      <Input
                        type="number"
                        value={totalRooms}
                        onChange={(e) => setTotalRooms(e.target.value)}
                        placeholder="e.g., 10"
                      />
                    </div>
                    <div>
                      <Label>AC Rooms</Label>
                      <Input
                        type="number"
                        value={acRooms}
                        onChange={(e) => setAcRooms(e.target.value)}
                        placeholder="e.g., 6"
                      />
                    </div>
                    <div>
                      <Label>Non-AC Rooms</Label>
                      <Input
                        type="number"
                        value={nonAcRooms}
                        onChange={(e) => setNonAcRooms(e.target.value)}
                        placeholder="e.g., 4"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="complimentaryRooms"
                        checked={complimentaryRooms}
                        onCheckedChange={setComplimentaryRooms}
                      />
                      <Label htmlFor="complimentaryRooms">Complimentary Rooms Offered?</Label>
                    </div>

                    <div>
                      <Label>Extra Room Charges ₹</Label>
                      <Input
                        value={extraRoomCharges}
                        onChange={(e) => setExtraRoomCharges(e.target.value)}
                        placeholder="e.g., 2000 per night"
                      />
                    </div>

                    <div>
                      <Label>Room Amenities</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {['AC/Fan', 'Attached Washroom', 'Geyser', 'Wardrobe'].map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              id={amenity}
                              checked={roomAmenities.includes(amenity)}
                              onCheckedChange={() => handleArrayToggle(amenity, roomAmenities, setRoomAmenities)}
                            />
                            <Label htmlFor={amenity}>{amenity}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Power Backup */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Power Backup Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Generator Capacity (kVA)</Label>
                      <Input
                        value={generatorCapacity}
                        onChange={(e) => setGeneratorCapacity(e.target.value)}
                        placeholder="e.g., 100 kVA"
                      />
                    </div>
                    <div>
                      <Label>Duration Supported (Hours)</Label>
                      <Input
                        value={backupDuration}
                        onChange={(e) => setBackupDuration(e.target.value)}
                        placeholder="e.g., 8 hours"
                      />
                    </div>
                  </div>
                </Card>

                {/* Audio/Visual Equipment */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Audio/Visual Equipment</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Sound System</Label>
                      <Select value={soundSystem} onValueChange={setSoundSystem}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sound system option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Included">Included</SelectItem>
                          <SelectItem value="Extra Cost">Extra Cost</SelectItem>
                          <SelectItem value="Not Available">Not Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Projector & Screen</Label>
                      <Select value={projectorScreen} onValueChange={setProjectorScreen}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select projector option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Included">Included</SelectItem>
                          <SelectItem value="Extra Cost">Extra Cost</SelectItem>
                          <SelectItem value="Not Available">Not Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>DJ Services</Label>
                      <Select value={djServices} onValueChange={setDjServices}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select DJ option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="In-house">In-house</SelectItem>
                          <SelectItem value="Outside Allowed">Outside Allowed</SelectItem>
                          <SelectItem value="Not Allowed">Not Allowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {djServices === 'In-house' && (
                      <div>
                        <Label>DJ Cost if In-house ₹</Label>
                        <Input
                          value={djCost}
                          onChange={(e) => setDjCost(e.target.value)}
                          placeholder="e.g., 15000"
                        />
                      </div>
                    )}
                  </div>
                </Card>

                {/* Other Facilities */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Other Facilities</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Number of Washrooms</Label>
                      <Input
                        value={numberOfWashrooms}
                        onChange={(e) => setNumberOfWashrooms(e.target.value)}
                        placeholder="e.g., 8"
                      />
                    </div>

                    <div>
                      <Label>Cleanliness & Accessibility Description</Label>
                      <Textarea
                        value={washroomDescription}
                        onChange={(e) => setWashroomDescription(e.target.value)}
                        placeholder="Describe washroom facilities and accessibility"
                        rows={2}
                      />
                    </div>

                    <div className="flex space-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="wheelchairAccess"
                          checked={wheelchairAccess}
                          onCheckedChange={setWheelchairAccess}
                        />
                        <Label htmlFor="wheelchairAccess">Wheelchair Access Available?</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="elevator"
                          checked={elevator}
                          onCheckedChange={setElevator}
                        />
                        <Label htmlFor="elevator">Elevator for Guests</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="wifiAvailable"
                          checked={wifiAvailable}
                          onCheckedChange={setWifiAvailable}
                        />
                        <Label htmlFor="wifiAvailable">Wi-Fi Available?</Label>
                      </div>
                    </div>

                    <div>
                      <Label>Number of Staff Provided</Label>
                      <Input
                        value={staffProvided}
                        onChange={(e) => setStaffProvided(e.target.value)}
                        placeholder="e.g., 10 staff members"
                      />
                    </div>

                    <div>
                      <Label>Services Covered by Staff</Label>
                      <Textarea
                        value={staffServices}
                        onChange={(e) => setStaffServices(e.target.value)}
                        placeholder="Describe what services the staff provides"
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 5: Ritual & Cultural Support */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <CardTitle>Ritual & Cultural Support</CardTitle>

                <Card className="p-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Is Fire/Hawan Ritual Allowed?</Label>
                      <Select value={fireRitualAllowed} onValueChange={setFireRitualAllowed}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fire ritual policy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Indoor">Indoor</SelectItem>
                          <SelectItem value="Outdoor">Outdoor</SelectItem>
                          <SelectItem value="Not Allowed">Not Allowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Mandap Setup Location Preferences or Restrictions</Label>
                      <Textarea
                        value={mandapSetup}
                        onChange={(e) => setMandapSetup(e.target.value)}
                        placeholder="Describe mandap setup preferences, restrictions, or guidelines"
                        rows={3}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 6: AI-Specific + Operational Data */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <CardTitle>AI-Specific + Operational Data</CardTitle>

                <Card className="p-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Current Booking & Calendar Management System</Label>
                      <Select value={currentBookingSystem} onValueChange={setCurrentBookingSystem}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select current system" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Manual (Notebook/Phone)">Manual (Notebook/Phone)</SelectItem>
                          <SelectItem value="Google Calendar">Google Calendar</SelectItem>
                          <SelectItem value="CRM Software">CRM Software</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sanskaraIntegration"
                        checked={sanskaraIntegration}
                        onCheckedChange={setSanskaraIntegration}
                      />
                      <Label htmlFor="sanskaraIntegration">Willing to Integrate with SanskaraAi App/Portal?</Label>
                    </div>

                    <div>
                      <Label>Unique Features / Selling Points of Your Venue</Label>
                      <Textarea
                        value={uniqueFeatures}
                        onChange={(e) => setUniqueFeatures(e.target.value)}
                        placeholder="What makes your venue special?"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Ideal Client Profile (type of events, budget preferences)</Label>
                      <Textarea
                        value={idealClientProfile}
                        onChange={(e) => setIdealClientProfile(e.target.value)}
                        placeholder="Describe your ideal clients and events"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Flexibility Level (1 to 5): {flexibilityLevel}</Label>
                      <div className="mt-2">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={flexibilityLevel}
                          onChange={(e) => setFlexibilityLevel(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>Very Rigid</span>
                          <span>Very Flexible</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Would You Consider Allowing AI to Suggest Menu or Decor?</Label>
                      <Select value={aiSuggestions} onValueChange={setAiSuggestions}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Needs Approval">Needs Approval</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Preferred Mode of Receiving Leads/Bookings</Label>
                      <Select value={preferredLeadMode} onValueChange={setPreferredLeadMode}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Phone Call">Phone Call</SelectItem>
                          <SelectItem value="In-App Dashboard">In-App Dashboard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Any Venue Rules or Restrictions Clients Must Know?</Label>
                      <Textarea
                        value={venueRules}
                        onChange={(e) => setVenueRules(e.target.value)}
                        placeholder="e.g., music cutoff time, decor limitations, usage rules, etc."
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
                Previous
              </Button>
              
              <div className="flex space-x-2">
                {currentStep < totalSteps ? (
                  <Button onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Complete Venue Onboarding'
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
