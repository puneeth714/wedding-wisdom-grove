
import React from 'react';
import { NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import StaffHeader from './StaffHeader';
import Logo from '../Logo';
import { useAuth } from '@/hooks/useAuthContext';
import {
  HomeIcon,
  BookOpen,
  ListTodo,
  Calendar,
  CheckCircle,
  BellRing,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/staff/dashboard', icon: <HomeIcon className="h-5 w-5 flex-shrink-0" /> },
  { name: 'Bookings', path: '/staff/bookings', icon: <BookOpen className="h-5 w-5 flex-shrink-0" /> },
  { name: 'Tasks', path: '/staff/tasks', icon: <ListTodo className="h-5 w-5 flex-shrink-0" /> },
  { name: 'Vendor Services', path: '/staff/services', icon: <CheckCircle className="h-5 w-5 flex-shrink-0" /> },
  { name: 'Notifications', path: '/staff/notifications', icon: <BellRing className="h-5 w-5 flex-shrink-0" /> },
  { name: 'Profile', path: '/staff/profile', icon: <User className="h-5 w-5 flex-shrink-0" /> },
  { name: 'Settings', path: '/staff/settings', icon: <Settings className="h-5 w-5 flex-shrink-0" /> },
];

const StaffSidebar: React.FC = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/staff/login');
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) => {
    return isActive
      ? "text-sanskara-red font-medium bg-sanskara-red/10 border-l-2 border-sanskara-red"
      : "hover:bg-sanskara-red/5 hover:text-sanskara-red";
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 bg-sanskara-cream shadow-lg border-r border-sanskara-red/10`}
      collapsible="icon"
    >
      <div className={`mt-4 mb-8 flex items-center ${collapsed ? "justify-center px-2" : "justify-center px-6"}`}>
        {collapsed ? (
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-sanskara-red rounded-full opacity-80"></div>
            <div className="absolute inset-1 bg-sanskara-gold rounded-full"></div>
            <div className="absolute inset-3 bg-sanskara-cream rounded-full flex items-center justify-center">
              <span className="text-sanskara-maroon text-xs font-bold">S</span>
            </div>
          </div>
        ) : (
          <Logo />
        )}
      </div>

      <SidebarContent className="px-2 flex-grow">
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "hidden" : "block"} text-sanskara-maroon`}>
            Staff Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} className={getNavClass} end={item.path === '/staff/dashboard'}>
                      <div className="flex items-center py-2 px-3 gap-3">
                        {item.icon}
                        {!collapsed && <span>{item.name}</span>}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={`p-2 ${collapsed ? 'items-center' : ''} flex flex-col`}>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 p-3 rounded-md w-full transition-colors
                      text-sanskara-maroon hover:bg-sanskara-red/10 hover:text-sanskara-red
                      ${collapsed ? 'justify-center' : 'justify-start'}`}
          title="Logout"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};

const StaffDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, vendorProfile, staffProfile, isLoading, isLoadingProfile } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Verifying staff access...</p>
        </div>
      </div>
    );
  }

  // If no user, redirect to staff login
  if (!user) {
    return <Navigate to="/staff/login" state={{ from: location }} replace />;
  }

  // If user is vendor (not staff), redirect to vendor portal
  if (vendorProfile && !staffProfile) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user doesn't have staff profile, redirect to staff login
  if (!staffProfile) {
    return <Navigate to="/staff/login" state={{ from: location }} replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50/50">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StaffDashboardLayout;
