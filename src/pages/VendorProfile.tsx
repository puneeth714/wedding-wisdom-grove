
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Edit2, Save, X, Plus } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

interface VendorDetails {
  establishment_year?: string;
  years_in_operation?: string;
  alcoholPolicy?: {
    allowed: boolean;
    inHouseBar?: boolean;
    permitRequired?: boolean;
    corkageFee?: {
      applicable: boolean;
      amount?: number;
    };
  };
  fireRitual?: string;
  mandapSetup?: string;
  venueRules?: string;
  payment?: {
    advanceBooking?: string;
    terms?: string;
    cancellationPolicy?: string;
  };
  pricing?: {
    rentalIncludedInCatering?: boolean;
    weekdayRate?: number;
    weekendRate?: number;
    auspiciousRate?: number;
    perHourRate?: number;
    vegStandardMin?: number;
    vegStandardMax?: number;
    vegDeluxeMin?: number;
    vegDeluxeMax?: number;
    nonVegStandardMin?: number;
    nonVegStandardMax?: number;
    nonVegDeluxeMin?: number;
    nonVegDeluxeMax?: number;
  };
  catering?: {
    options?: string;
    cuisineSpecialties?: string[];
    menuCustomization?: boolean;
  };
  decoration?: {
    options?: string;
    basicIncluded?: boolean;
    customization?: boolean;
  };
  amenities?: {
    parkingCars?: number;
    parkingTwoWheelers?: number;
    valetParking?: boolean;
    valetCost?: number;
    totalRooms?: number;
    acRooms?: number;
    nonAcRooms?: number;
    complimentaryRooms?: boolean;
    extraRoomCharges?: number;
    generatorCapacity?: string;
    generatorDuration?: string;
    soundSystem?: boolean;
    projectorScreen?: boolean;
    djServices?: string;
    djCost?: number;
    numberOfWashrooms?: string;
    wheelchairAccess?: boolean;
    elevator?: boolean;
    numberOfStaff?: string;
    wifiAvailability?: boolean;
  };
  [key: string]: any;
}

interface ExtendedVendorProfile {
  vendor_id: string;
  vendor_name: string;
  contact_email: string;
  phone_number: string;
  website_url?: string;
  description?: string;
  address?: any;
  portfolio_image_urls?: string[];
  details?: VendorDetails;
}

const VendorProfile: React.FC = () => {
  const { user, vendorProfile, refreshVendorProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [venueData, setVenueData] = useState<ExtendedVendorProfile | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [editedData, setEditedData] = useState<any>({});

  useEffect(() => {
    if (!user || !vendorProfile) {
      navigate('/login');
      return;
    }
    
    fetchVendorData();
  }, [user, vendorProfile, navigate]);

  const fetchVendorData = async () => {
    try {
      setIsLoading(true);
      
      if (!vendorProfile) return;

      const { data: servicesData, error: servicesError } = await supabase
        .from('vendor_services')
        .select('*')
        .eq('vendor_id', vendorProfile.vendor_id);

      if (servicesError) throw servicesError;

      const extendedVendorProfile = vendorProfile as ExtendedVendorProfile;
      
      setVenueData(extendedVendorProfile);
      setServices(servicesData || []);
      setEditedData({
        vendor_name: extendedVendorProfile.vendor_name,
        contact_email: extendedVendorProfile.contact_email,
        phone_number: extendedVendorProfile.phone_number,
        website_url: extendedVendorProfile.website_url || '',
        description: extendedVendorProfile.description || '',
        address: extendedVendorProfile.address || {},
        details: extendedVendorProfile.details || {}
      });
    } catch (error: any) {
      console.error('Error fetching vendor data:', error);
      toast({
        title: "Error",
        description: "Failed to load vendor data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!vendorProfile) return;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('vendors')
        .update({
          vendor_name: editedData.vendor_name,
          contact_email: editedData.contact_email,
          phone_number: editedData.phone_number,
          website_url: editedData.website_url,
          description: editedData.description,
          address: editedData.address,
          details: editedData.details,
          updated_at: new Date().toISOString()
        })
        .eq('vendor_id', vendorProfile.vendor_id);

      if (error) throw error;

      await refreshVendorProfile();
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!venueData) return;
    
    setEditedData({
      vendor_name: venueData.vendor_name,
      contact_email: venueData.contact_email,
      phone_number: venueData.phone_number,
      website_url: venueData.website_url || '',
      description: venueData.description || '',
      address: venueData.address || {},
      details: venueData.details || {}
    });
    setIsEditing(false);
  };

  const updateDetailField = (path: string, value: any) => {
    const pathArray = path.split('.');
    const newDetails = { ...editedData.details };
    
    let current = newDetails;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    current[pathArray[pathArray.length - 1]] = value;
    
    setEditedData(prev => ({ ...prev, details: newDetails }));
  };

  const getDetailValue = (path: string) => {
    const pathArray = path.split('.');
    let current = editedData.details || {};
    
    for (const key of pathArray) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return '';
      }
    }
    return current || '';
  };

  const renderBasicInfo = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Basic Information</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Venue Name</Label>
                <Input
                  value={editedData.vendor_name || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, vendor_name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={editedData.contact_email || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, contact_email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={editedData.phone_number || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, phone_number: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input
                  value={editedData.website_url || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, website_url: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Establishment Year</Label>
                <Input
                  value={getDetailValue('establishment_year')}
                  onChange={(e) => updateDetailField('establishment_year', e.target.value)}
                  placeholder="e.g., 2010"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editedData.description || ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea
                value={editedData.address?.full_address || ''}
                onChange={(e) => setEditedData(prev => ({
                  ...prev,
                  address: { ...prev.address, full_address: e.target.value }
                }))}
                rows={3}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Venue Name</Label>
                <p className="text-sm">{venueData?.vendor_name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Contact Email</Label>
                <p className="text-sm">{venueData?.contact_email}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                <p className="text-sm">{venueData?.phone_number}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Website</Label>
                <p className="text-sm">{venueData?.website_url || 'Not provided'}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Establishment Year</Label>
                <p className="text-sm">{venueData?.details?.establishment_year || 'Not provided'}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-500">Description</Label>
              <p className="text-sm mt-1">{venueData?.description || 'No description provided'}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-500">Address</Label>
              <p className="text-sm mt-1">{venueData?.address?.full_address || 'No address provided'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderPricingAndCatering = () => {
    const details = venueData?.details as VendorDetails || {};
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Catering</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={getDetailValue('pricing.rentalIncludedInCatering')}
                  onCheckedChange={(checked) => updateDetailField('pricing.rentalIncludedInCatering', checked)}
                />
                <Label>Rental included in catering charges</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Weekday Rate (₹)</Label>
                  <Input
                    type="number"
                    value={getDetailValue('pricing.weekdayRate')}
                    onChange={(e) => updateDetailField('pricing.weekdayRate', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Weekend Rate (₹)</Label>
                  <Input
                    type="number"
                    value={getDetailValue('pricing.weekendRate')}
                    onChange={(e) => updateDetailField('pricing.weekendRate', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Veg Standard (Min ₹)</Label>
                  <Input
                    type="number"
                    value={getDetailValue('pricing.vegStandardMin')}
                    onChange={(e) => updateDetailField('pricing.vegStandardMin', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Veg Standard (Max ₹)</Label>
                  <Input
                    type="number"
                    value={getDetailValue('pricing.vegStandardMax')}
                    onChange={(e) => updateDetailField('pricing.vegStandardMax', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label>Catering Options</Label>
                <Select
                  value={getDetailValue('catering.options')}
                  onValueChange={(value) => updateDetailField('catering.options', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select catering option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-house-only">In-house Catering Only</SelectItem>
                    <SelectItem value="outside-allowed">Outside Caterers Allowed</SelectItem>
                    <SelectItem value="both">Both Allowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {details.pricing?.rentalIncludedInCatering && (
                <div>
                  <Badge variant="secondary">Rental included in catering</Badge>
                </div>
              )}

              {(details.pricing?.weekdayRate || details.pricing?.weekendRate) && (
                <div>
                  <h4 className="font-medium mb-2">Rental Rates</h4>
                  <div className="space-y-1 text-sm">
                    {details.pricing?.weekdayRate && (
                      <p><span className="font-medium">Weekday:</span> ₹{details.pricing.weekdayRate}</p>
                    )}
                    {details.pricing?.weekendRate && (
                      <p><span className="font-medium">Weekend:</span> ₹{details.pricing.weekendRate}</p>
                    )}
                  </div>
                </div>
              )}

              {(details.pricing?.vegStandardMin || details.pricing?.vegStandardMax) && (
                <div>
                  <h4 className="font-medium mb-2">Food Pricing (Per Plate)</h4>
                  <div className="space-y-1 text-sm">
                    {(details.pricing?.vegStandardMin || details.pricing?.vegStandardMax) && (
                      <p>
                        <span className="font-medium">Veg Standard:</span> 
                        ₹{details.pricing?.vegStandardMin} - ₹{details.pricing?.vegStandardMax}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {details.catering?.options && (
                <div>
                  <h4 className="font-medium mb-2">Catering Options</h4>
                  <p className="text-sm capitalize">{details.catering.options.replace('-', ' ')}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderAmenities = () => {
    const details = venueData?.details as VendorDetails || {};
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Amenities & Facilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Parking (Cars)</Label>
                  <Input
                    type="number"
                    value={getDetailValue('amenities.parkingCars')}
                    onChange={(e) => updateDetailField('amenities.parkingCars', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Parking (2-Wheelers)</Label>
                  <Input
                    type="number"
                    value={getDetailValue('amenities.parkingTwoWheelers')}
                    onChange={(e) => updateDetailField('amenities.parkingTwoWheelers', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Rooms</Label>
                  <Input
                    type="number"
                    value={getDetailValue('amenities.totalRooms')}
                    onChange={(e) => updateDetailField('amenities.totalRooms', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>AC Rooms</Label>
                  <Input
                    type="number"
                    value={getDetailValue('amenities.acRooms')}
                    onChange={(e) => updateDetailField('amenities.acRooms', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={getDetailValue('amenities.wifiAvailability')}
                  onCheckedChange={(checked) => updateDetailField('amenities.wifiAvailability', checked)}
                />
                <Label>Wi-Fi Available</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={getDetailValue('amenities.wheelchairAccess')}
                  onCheckedChange={(checked) => updateDetailField('amenities.wheelchairAccess', checked)}
                />
                <Label>Wheelchair Access</Label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {(details.amenities?.parkingCars || details.amenities?.parkingTwoWheelers) && (
                <div>
                  <h4 className="font-medium mb-2">Parking</h4>
                  <div className="space-y-1 text-sm">
                    {details.amenities?.parkingCars && (
                      <p><span className="font-medium">Cars:</span> {details.amenities.parkingCars} spaces</p>
                    )}
                    {details.amenities?.parkingTwoWheelers && (
                      <p><span className="font-medium">2-Wheelers:</span> {details.amenities.parkingTwoWheelers} spaces</p>
                    )}
                  </div>
                </div>
              )}

              {(details.amenities?.totalRooms || details.amenities?.acRooms) && (
                <div>
                  <h4 className="font-medium mb-2">Accommodation</h4>
                  <div className="space-y-1 text-sm">
                    {details.amenities?.totalRooms && (
                      <p><span className="font-medium">Total Rooms:</span> {details.amenities.totalRooms}</p>
                    )}
                    {details.amenities?.acRooms && (
                      <p><span className="font-medium">AC Rooms:</span> {details.amenities.acRooms}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {details.amenities?.wifiAvailability && <Badge variant="secondary">Wi-Fi Available</Badge>}
                {details.amenities?.wheelchairAccess && <Badge variant="secondary">Wheelchair Accessible</Badge>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderServices = () => (
    <Card>
      <CardHeader>
        <CardTitle>Services & Spaces</CardTitle>
        <CardDescription>
          Manage your venue spaces and services
        </CardDescription>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No services found</p>
            <Button onClick={() => navigate('/services/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.service_id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{service.service_name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {service.service_category}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/services/edit/${service.service_id}`)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                
                {service.min_capacity && service.max_capacity && (
                  <p className="text-sm">
                    <span className="font-medium">Capacity:</span> {service.min_capacity} - {service.max_capacity} guests
                  </p>
                )}
                
                {service.base_price && (
                  <p className="text-sm">
                    <span className="font-medium">Price:</span> ₹{service.base_price} {service.price_unit || ''}
                  </p>
                )}
              </div>
            ))}
            
            <Button onClick={() => navigate('/services/add')} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Service
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderPhotos = () => (
    <Card>
      <CardHeader>
        <CardTitle>Venue Photos</CardTitle>
        <CardDescription>
          Manage your venue gallery
        </CardDescription>
      </CardHeader>
      <CardContent>
        {venueData?.portfolio_image_urls && venueData.portfolio_image_urls.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {venueData.portfolio_image_urls.map((url: string, index: number) => (
              <img
                key={index}
                src={url}
                alt={`Venue photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No photos uploaded</p>
            <Button onClick={() => setIsEditing(true)}>
              Upload Photos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!venueData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Complete Your Onboarding</h2>
          <p className="text-gray-600 mb-4">You need to complete the venue onboarding process first.</p>
          <Button onClick={() => navigate('/onboarding')}>
            Complete Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Venue Profile</h1>
        <p className="text-gray-600">Manage your venue information and settings</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          {renderBasicInfo()}
        </TabsContent>

        <TabsContent value="pricing">
          {renderPricingAndCatering()}
        </TabsContent>

        <TabsContent value="amenities">
          {renderAmenities()}
        </TabsContent>

        <TabsContent value="services">
          {renderServices()}
        </TabsContent>

        <TabsContent value="photos">
          {renderPhotos()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorProfile;
