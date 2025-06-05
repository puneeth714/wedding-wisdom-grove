
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Bell, Shield, User } from 'lucide-react';

const StaffSettings: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences and notifications
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch id="emailNotifications" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="taskReminders">Task Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminders for upcoming tasks
                </p>
              </div>
              <Switch id="taskReminders" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="bookingAlerts">Booking Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Alert me about new bookings
                </p>
              </div>
              <Switch id="bookingAlerts" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Make your profile visible to other staff
                </p>
              </div>
              <Switch id="profileVisibility" />
            </div>
            
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Export My Data
            </Button>
            
            <Button variant="destructive" className="w-full">
              Deactivate Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffSettings;
