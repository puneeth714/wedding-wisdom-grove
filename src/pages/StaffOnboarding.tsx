
import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Loader2, User, Phone, FileText, Camera } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import ImageUploader from '../components/ImageUploader';
import { uploadFile } from '../utils/uploadHelpers';

const StaffOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    password: '',
    display_name: '',
    phone_number: '',
    portfolio_title: '',
    portfolio_description: '',
    portfolio_type: 'general'
  });
  
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (staffId: string, vendorId: string) => {
    if (selectedFiles.length === 0) return [];

    setUploading(true);
    try {
      const uploadPromises = selectedFiles.map(file => 
        uploadFile(file, 'vendor-staff', `${vendorId}/${staffId}`)
      );

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      
      setPortfolioImages(validUrls);
      return validUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Upload Warning',
        description: 'Some images failed to upload, but your profile was created successfully.',
        variant: 'destructive'
      });
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user password and get user info
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
        data: { display_name: formData.display_name }
      });

      if (updateError) throw updateError;

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get staff profile
      const { data: staffData, error: staffError } = await supabase
        .from('vendor_staff')
        .select('staff_id, vendor_id, role')
        .eq('supabase_auth_uid', user.id)
        .single();

      if (staffError || !staffData) throw new Error('Staff profile not found');

      // Update staff profile with additional information
      const { error: staffUpdateError } = await supabase
        .from('vendor_staff')
        .update({
          display_name: formData.display_name,
          phone_number: formData.phone_number || null,
          invitation_status: 'accepted'
        })
        .eq('staff_id', staffData.staff_id);

      if (staffUpdateError) throw staffUpdateError;

      // Upload images
      const uploadedImageUrls = await uploadImages(staffData.staff_id, staffData.vendor_id);

      // Create portfolio entry
      if (formData.portfolio_title || formData.portfolio_description || uploadedImageUrls.length > 0) {
        const { error: portfolioError } = await supabase
          .from('staff_portfolios')
          .insert({
            staff_id: staffData.staff_id,
            vendor_id: staffData.vendor_id,
            portfolio_type: formData.portfolio_type,
            title: formData.portfolio_title,
            description: formData.portfolio_description,
            image_urls: uploadedImageUrls,
            video_urls: []
          });

        if (portfolioError) {
          console.error('Portfolio creation error:', portfolioError);
          // Don't fail the whole process for portfolio errors
        }
      }

      toast({
        title: 'Welcome!',
        description: 'Your profile has been set up successfully.'
      });

      navigate('/staff/dashboard');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Setup Failed',
        description: error.message || 'Failed to complete profile setup',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceedFromStep1 = formData.password && formData.display_name;
  const canProceedFromStep2 = formData.portfolio_title;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sanskara-amber/10 to-sanskara-red/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Staff Profile</CardTitle>
          <CardDescription>
            Step {currentStep} of 3 - Let's set up your profile information
          </CardDescription>
          
          {/* Progress indicator */}
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep
                      ? 'bg-sanskara-red text-white'
                      : step < currentStep
                      ? 'bg-sanskara-amber text-sanskara-maroon'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-sanskara-red" />
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="display_name">Full Name *</Label>
                  <Input
                    id="display_name"
                    name="display_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Set Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Portfolio Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-sanskara-red" />
                  <h3 className="text-lg font-semibold">Portfolio Information</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio_type">Your Role/Specialty *</Label>
                  <select
                    id="portfolio_type"
                    name="portfolio_type"
                    value={formData.portfolio_type}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="general">General Staff</option>
                    <option value="photographer">Photographer</option>
                    <option value="caterer">Caterer</option>
                    <option value="decorator">Decorator</option>
                    <option value="venue_manager">Venue Manager</option>
                    <option value="coordinator">Event Coordinator</option>
                    <option value="florist">Florist</option>
                    <option value="musician">Musician</option>
                    <option value="makeup_artist">Makeup Artist</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio_title">Portfolio Title *</Label>
                  <Input
                    id="portfolio_title"
                    name="portfolio_title"
                    type="text"
                    placeholder="e.g., 'Professional Wedding Photographer'"
                    value={formData.portfolio_title}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio_description">About Your Work</Label>
                  <Textarea
                    id="portfolio_description"
                    name="portfolio_description"
                    placeholder="Describe your experience, specialties, and what makes your work unique..."
                    value={formData.portfolio_description}
                    onChange={handleInputChange}
                    disabled={loading}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Portfolio Images */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="h-5 w-5 text-sanskara-red" />
                  <h3 className="text-lg font-semibold">Portfolio Images</h3>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Upload images that showcase your best work. These will be displayed in your portfolio.
                </p>

                <ImageUploader
                  onFileSelect={handleImageSelect}
                  maxFiles={10}
                  existingImages={[]}
                  uploading={uploading}
                />

                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Selected Images ({selectedFiles.length})</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Selected ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep} disabled={loading}>
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    loading ||
                    (currentStep === 1 && !canProceedFromStep1) ||
                    (currentStep === 2 && !canProceedFromStep2)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={loading || uploading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffOnboarding;
