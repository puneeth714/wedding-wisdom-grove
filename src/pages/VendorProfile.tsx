
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Edit2, Save, X, Plus } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

const VendorProfile: React.FC = () => {
  const { user, vendorProfile, refreshVendorProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [venueData, setVenueData] = useState<any>(null);
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

      // Fetch vendor services
      const { data: servicesData, error: servicesError } = await supabase
        .from('vendor_services')
        .select('*')
        .eq('vendor_id', vendorProfile.vendor_id);

      if (servicesError) throw servicesError;

      setVenueData(vendorProfile);
      setServices(servicesData || []);
      setEditedData({
        vendor_name: vendorProfile.vendor_name,
        contact_email: vendorProfile.contact_email,
        phone_number: vendorProfile.phone_number,
        website_url: vendorProfile.website_url || '',
        description: vendorProfile.description || '',
        address: vendorProfile.address || {},
        details: vendorProfile.details || {}
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

  const renderPolicies = () => {
    const details = venueData?.details || {};
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Policies & Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Alcohol Policy */}
          {details.alcoholPolicy && (
            <div>
              <h4 className="font-medium mb-2">Alcohol Policy</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Allowed:</span> {details.alcoholPolicy.allowed ? 'Yes' : 'No'}</p>
                {details.alcoholPolicy.allowed && (
                  <>
                    <p><span className="font-medium">In-house Bar:</span> {details.alcoholPolicy.inHouseBar ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Permit Required:</span> {details.alcoholPolicy.permitRequired ? 'Yes' : 'No'}</p>
                    {details.alcoholPolicy.corkageFee?.applicable && (
                      <p><span className="font-medium">Corkage Fee:</span> ₹{details.alcoholPolicy.corkageFee.amount}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Fire Ritual */}
          {details.fireRitual && (
            <div>
              <h4 className="font-medium mb-2">Fire/Hawan Ritual</h4>
              <p className="text-sm capitalize">{details.fireRitual}</p>
            </div>
          )}

          {/* Mandap Setup */}
          {details.mandapSetup && (
            <div>
              <h4 className="font-medium mb-2">Mandap Setup</h4>
              <p className="text-sm">{details.mandapSetup}</p>
            </div>
          )}

          {/* Venue Rules */}
          {details.venueRules && (
            <div>
              <h4 className="font-medium mb-2">Venue Rules & Restrictions</h4>
              <p className="text-sm">{details.venueRules}</p>
            </div>
          )}

          {/* Payment Terms */}
          {details.payment && (
            <div>
              <h4 className="font-medium mb-2">Payment Terms</h4>
              <div className="space-y-1 text-sm">
                {details.payment.advanceBooking && (
                  <p><span className="font-medium">Advance Booking:</span> {details.payment.advanceBooking}</p>
                )}
                {details.payment.terms && (
                  <p><span className="font-medium">Terms:</span> {details.payment.terms}</p>
                )}
                {details.payment.cancellationPolicy && (
                  <p><span className="font-medium">Cancellation Policy:</span> {details.payment.cancellationPolicy}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          {renderBasicInfo()}
        </TabsContent>

        <TabsContent value="services">
          {renderServices()}
        </TabsContent>

        <TabsContent value="policies">
          {renderPolicies()}
        </TabsContent>

        <TabsContent value="photos">
          {renderPhotos()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorProfile;
