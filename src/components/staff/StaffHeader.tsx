
import React, { useState } from 'react';
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';

const StaffHeader: React.FC = () => {
  const [notificationCount, setNotificationCount] = useState(2);
  const { staffProfile, user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Get initials for avatar fallback
  const getInitials = () => {
    if (staffProfile?.display_name) {
      return staffProfile.display_name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return "ST";
  };

  const handleProfileClick = () => {
    navigate('/staff/profile');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/staff/login');
  };
  
  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-sanskara-maroon hover:text-sanskara-red transition-colors" />
          <span className="text-xl font-semibold hidden sm:block gradient-text">Staff Portal</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell 
              className="h-5 w-5 text-sanskara-maroon hover:text-sanskara-red cursor-pointer transition-colors" 
              onClick={() => setNotificationCount(0)} 
            />
            {notificationCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-sanskara-red text-white">
                {notificationCount}
              </Badge>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
              <Avatar className="h-8 w-8 border border-sanskara-gold/50">
                <AvatarImage src="" />
                <AvatarFallback className="bg-sanskara-amber text-sanskara-maroon">{getInitials()}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm hidden md:block">
                {staffProfile?.display_name || user?.email || 'Staff Member'}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <div className="rounded-full bg-sanskara-amber/20 p-1">
                  <User className="h-4 w-4 text-sanskara-maroon" />
                </div>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">{staffProfile?.display_name || 'Staff Member'}</p>
                  <p className="text-xs text-muted-foreground">{staffProfile?.email || user?.email || ''}</p>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer" onClick={handleProfileClick}>
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/staff/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="text-red-500 cursor-pointer flex items-center gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default StaffHeader;
