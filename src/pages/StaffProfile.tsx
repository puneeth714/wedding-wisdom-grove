
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Loader2, Edit3, Save, X, User, Phone, Mail, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuthContext';
import { toast } from '../hooks/use-toast';
import ImageUploader from '../components/ImageUploader';
import { uploadFile, deleteFile } from '../utils/uploadHelpers';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';

interface StaffProfileData {
  staff_id: string;
  vendor_id: string;
  display_name: string;
  email: string;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StaffPortfolioData {
  portfolio_id?: string;
  title: string;
  description: string;
  image_urls: string[];
  video_urls: string[];
  portfolio_type: string;
}

const StaffProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, staffProfile: authStaffProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [profileData, setProfileData] = useState<StaffProfileData | null>(null);
  const [portfolioData, setPortfolioData] = useState<StaffPortfolioData>({
    title: '',
    description: '',
    image_urls: [],
    video_urls: [],
    portfolio_type: 'general'
  });

  const [editForm, setEditForm] = useState({
    display_name: '',
    phone_number: '',
    title: '',
    description: '',
    portfolio_type: 'general'
  });

  useEffect(() => {
    fetchStaffData();
  }, [user]);

  const fetchStaffData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch staff profile
      const { data: staffData, error: staffError } = await supabase
        .from('vendor_staff')
        .select('*')
        .eq('supabase_auth_uid', user.id)
        .single();

      if (staffError) throw staffError;
      
      setProfileData(staffData);
      setEditForm({
        display_name: staffData.display_name || '',
        phone_number: staffData.phone_number || '',
        title: '',
        description: '',
        portfolio_type: 'general'
      });

      // Fetch portfolio data
      const { data: portfolioResult, error: portfolioError } = await supabase
        .from('staff_portfolios')
        .select('*')
        .eq('staff_id', staffData.staff_id)
        .maybeSingle();

      if (!portfolioError && portfolioResult) {
        setPortfolioData(portfolioResult);
        setEditForm(prev => ({
          ...prev,
          title: portfolioResult.title || '',
          description: portfolioResult.description || '',
          portfolio_type: portfolioResult.portfolio_type || 'general'
        }));
      }
    } catch (error: any) {
      console.error('Error fetching staff data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profileData) return;

    setSaving(true);
    try {
      // Update staff profile
      const { error: staffError } = await supabase
        .from('vendor_staff')
        .update({
          display_name: editForm.display_name,
          phone_number: editForm.phone_number || null
        })
        .eq('staff_id', profileData.staff_id);

      if (staffError) throw staffError;

      // Update or create portfolio
      const portfolioPayload = {
        staff_id: profileData.staff_id,
        vendor_id: profileData.vendor_id,
        title: editForm.title,
        description: editForm.description,
        portfolio_type: editForm.portfolio_type,
        image_urls: portfolioData.image_urls,
        video_urls: portfolioData.video_urls
      };

      if (portfolioData.portfolio_id) {
        const { error: portfolioError } = await supabase
          .from('staff_portfolios')
          .update(portfolioPayload)
          .eq('portfolio_id', portfolioData.portfolio_id);
        
        if (portfolioError) throw portfolioError;
      } else {
        const { data: newPortfolio, error: portfolioError } = await supabase
          .from('staff_portfolios')
          .insert([portfolioPayload])
          .select()
          .single();
        
        if (portfolioError) throw portfolioError;
        
        setPortfolioData(prev => ({ ...prev, portfolio_id: newPortfolio.portfolio_id }));
      }

      // Update local state
      setProfileData(prev => prev ? {
        ...prev,
        display_name: editForm.display_name,
        phone_number: editForm.phone_number || null
      } : null);

      setPortfolioData(prev => ({
        ...prev,
        title: editForm.title,
        description: editForm.description,
        portfolio_type: editForm.portfolio_type
      }));

      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (!user || !profileData) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        uploadFile(file, 'vendor-staff', `${profileData.vendor_id}/${profileData.staff_id}`)
      );

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];

      if (validUrls.length > 0) {
        setPortfolioData(prev => ({
          ...prev,
          image_urls: [...prev.image_urls, ...validUrls]
        }));

        toast({
          title: 'Success',
          description: `${validUrls.length} image(s) uploaded successfully`
        });
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (!user || !profileData) return;

    try {
      // Remove from local state immediately
      setPortfolioData(prev => ({
        ...prev,
        image_urls: prev.image_urls.filter(url => url !== imageUrl)
      }));

      // Delete from storage
      await deleteFile(imageUrl, 'vendor-staff', `${profileData.vendor_id}/${profileData.staff_id}`);

      toast({
        title: 'Success',
        description: 'Image removed successfully'
      });
    } catch (error: any) {
      console.error('Error removing image:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove image',
        variant: 'destructive'
      });
    }
  };

  const getInitials = () => {
    if (profileData?.display_name) {
      return profileData.display_name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return "S";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <StaffDashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading profile...</p>
        </div>
      </StaffDashboardLayout>
    );
  }

  if (!profileData) {
    return (
      <StaffDashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-red-600 mb-4">Profile not found</p>
          <Button onClick={() => navigate('/staff/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout>
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Staff Profile</h1>
            <p className="text-muted-foreground">Manage your profile information and portfolio</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      display_name: profileData.display_name || '',
                      phone_number: profileData.phone_number || '',
                      title: portfolioData.title || '',
                      description: portfolioData.description || '',
                      portfolio_type: portfolioData.portfolio_type || 'general'
                    });
                  }}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg font-semibold bg-sanskara-amber text-sanskara-maroon">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-semibold mb-1">
                    {profileData.display_name || 'Staff Member'}
                  </h2>
                  
                  <Badge variant="secondary" className="mb-4">
                    {profileData.role}
                  </Badge>

                  <div className="w-full space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{profileData.email}</span>
                    </div>
                    
                    {profileData.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profileData.phone_number}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {formatDate(profileData.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Badge variant={profileData.is_active ? "default" : "secondary"}>
                        {profileData.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={editForm.display_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder="Enter your display name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                        id="phone_number"
                        value={editForm.phone_number}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Display Name</Label>
                      <p className="mt-1">{profileData.display_name || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                      <p className="mt-1">{profileData.phone_number || 'Not set'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio Section */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="title">Portfolio Title</Label>
                      <Input
                        id="title"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter portfolio title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="portfolio_type">Portfolio Type</Label>
                      <select
                        id="portfolio_type"
                        value={editForm.portfolio_type}
                        onChange={(e) => setEditForm(prev => ({ ...prev, portfolio_type: e.target.value }))}
                        className="w-full border rounded-md px-3 py-2"
                      >
                        <option value="general">General</option>
                        <option value="photographer">Photographer</option>
                        <option value="caterer">Caterer</option>
                        <option value="decorator">Decorator</option>
                        <option value="venue_manager">Venue Manager</option>
                        <option value="coordinator">Coordinator</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your expertise and experience"
                        rows={4}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                      <p className="mt-1">{portfolioData.title || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                      <p className="mt-1 capitalize">{portfolioData.portfolio_type?.replace('_', ' ') || 'General'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <p className="mt-1 whitespace-pre-wrap">{portfolioData.description || 'No description provided'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio Images */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Images</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <ImageUploader
                    onFileSelect={handleImageUpload}
                    maxFiles={10}
                    existingImages={portfolioData.image_urls}
                    onRemoveExisting={handleRemoveImage}
                    uploading={uploading}
                  />
                ) : (
                  <div>
                    {portfolioData.image_urls.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {portfolioData.image_urls.map((url, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                            <img
                              src={url}
                              alt={`Portfolio image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No portfolio images uploaded yet
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
};

export default StaffProfile;
