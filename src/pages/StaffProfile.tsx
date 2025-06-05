
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuthContext';
import { User, Mail, Phone, Briefcase } from 'lucide-react';

const StaffProfile: React.FC = () => {
  const { staffProfile, user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile information and settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input 
                id="displayName" 
                value={staffProfile?.display_name || ''} 
                placeholder="Enter your display name"
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  value={staffProfile?.email || user?.email || ''} 
                  placeholder="Enter your email"
                  readOnly
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input 
                  id="phone" 
                  value={staffProfile?.phone_number || ''} 
                  placeholder="Enter your phone number"
                  readOnly
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role" 
                value={staffProfile?.role || ''} 
                placeholder="Your role"
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input 
                id="status" 
                value={staffProfile?.is_active ? 'Active' : 'Inactive'} 
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invitationStatus">Invitation Status</Label>
              <Input 
                id="invitationStatus" 
                value={staffProfile?.invitation_status || ''} 
                readOnly
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Tell us about yourself..."
            className="min-h-[100px]"
            readOnly
          />
          <p className="text-sm text-muted-foreground mt-2">
            Profile editing functionality will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffProfile;
