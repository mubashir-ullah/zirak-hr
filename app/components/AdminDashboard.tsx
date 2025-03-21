'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { 
  User, Users, Briefcase, BarChart, 
  LogOut, Moon, Sun, Bell, Settings,
  Plus, Search, Filter, Shield
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { logoutUser } from '@/lib/auth'

// Import dashboard sections - these will need to be created or adapted from HR components
import AdminProfileSection from './admin/AdminProfileSection'
import UserManagementSection from './admin/UserManagementSection'
import SystemConfigSection from './admin/SystemConfigSection'
import AnalyticsSection from './admin/AnalyticsSection'
import SettingsSection from './admin/SettingsSection'
import { Footer } from './Footer'

export default function AdminDashboard() {
  const { theme, setTheme } = useTheme()
  const [isOnline, setIsOnline] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [isStatusUpdating, setIsStatusUpdating] = useState(false)
  const { toast } = useToast()
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    company: '',
    email: '',
    role: '',
    about: '',
    linkedin: '',
    profileImage: '/images/default-avatar.png',
    status: 'online'
  })

  // Simulate loading profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // In a real app, this would be an API call
        // await fetch('/api/admin/profile')
        
        // Simulate API delay
        setTimeout(() => {
          const data = {
            fullName: 'Syed Ali',
            company: 'Zirak HR',
            email: 'admin@zirak-hr.com',
            role: 'System Administrator',
            about: 'Managing the entire Zirak HR platform and ensuring smooth operations.',
            linkedin: 'linkedin.com/in/syedali',
            profileImage: '/images/default-avatar.png',
            status: 'online'
          };
          
          setProfileData(data);
          setIsOnline(data.status === 'online');
          setIsLoading(false);
        }, 1000)
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load profile data. Please try again.',
          variant: 'destructive'
        })
        setIsLoading(false)
      }
    }
    
    fetchProfileData()
  }, [toast])

  const handleStatusToggle = async () => {
    try {
      setIsStatusUpdating(true);
      const newStatus = !isOnline;
      
      // Optimistic UI update
      setIsOnline(newStatus);
      
      // In a real app, this would be an API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the profile data with new status
      setProfileData(prev => ({
        ...prev,
        status: newStatus ? 'online' : 'offline'
      }));
      
      // Show success toast
      toast({
        title: 'Status Updated',
        description: `You are now ${newStatus ? 'online' : 'offline'}`,
      });
    } catch (error) {
      // Revert the optimistic update on error
      setIsOnline(!isOnline);
      console.error('Failed to update status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your status. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsStatusUpdating(false);
    }
  }

  const handleLogout = async () => {
    try {
      toast({
        title: 'Logging out',
        description: 'You will be redirected to the login page.',
      });
      
      // Call the logout utility function
      const result = await logoutUser();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to logout');
      }
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive'
      });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Image 
              src="/images/zirak-hr-logo.svg" 
              alt="Zirak HR" 
              width={100} 
              height={32} 
              className="dark:invert"
            />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-72">
                  <div className="p-2 text-center text-muted-foreground">
                    No new notifications
                  </div>
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Select defaultValue="en">
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="ur">اردو</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex flex-col lg:flex-row gap-8 w-full"
        >
          {/* Sidebar */}
          <aside className="w-full lg:w-64 lg:flex-shrink-0">
            <Card className="p-4 dark:bg-gray-800 shadow-md">
              <div className="bg-[#d6ff00] dark:bg-gray-700 rounded-lg p-4 text-center mb-6 relative overflow-hidden">
                {/* Background pattern for visual interest */}
                <div className="absolute inset-0 opacity-10 dark:opacity-5">
                  <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100" height="100" fill="url(#grid)" />
                  </svg>
                </div>
                
                {isLoading ? (
                  <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ) : (
                  <>
                    <div className="relative w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full shadow-inner"></div>
                      <Avatar className="h-full w-full border-2 border-white dark:border-gray-800 shadow-lg">
                        <AvatarImage 
                          src={profileData.profileImage} 
                          alt={profileData.fullName}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                          {profileData.fullName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Status indicator */}
                      <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    </div>
                    
                    <h2 className="text-lg lg:text-xl font-bold text-black dark:text-white">{profileData.fullName}</h2>
                    <p className="text-sm text-black dark:text-gray-200 mb-2">{profileData.company}</p>
                    
                    <div className="flex items-center justify-center mt-2 bg-white dark:bg-gray-800 rounded-full py-1 px-3 shadow-sm mx-auto w-fit">
                      <Switch 
                        checked={isOnline}
                        onCheckedChange={handleStatusToggle}
                        disabled={isStatusUpdating}
                        className="data-[state=checked]:bg-green-500 dark:data-[state=checked]:bg-green-600"
                      />
                      <span className={`ml-2 text-sm font-medium ${
                        isStatusUpdating 
                          ? 'text-gray-400 dark:text-gray-500' 
                          : isOnline 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {isStatusUpdating 
                          ? 'Updating...' 
                          : isOnline 
                            ? 'Online' 
                            : 'Offline'
                        }
                      </span>
                    </div>
                  </>
                )}
              </div>

              <TabsList className="flex flex-col h-auto bg-transparent space-y-1">
                <TabsTrigger 
                  value="profile" 
                  className="w-full justify-start data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="user-management" 
                  className="w-full justify-start data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  <Users className="mr-2 h-4 w-4" />
                  User Management
                </TabsTrigger>
                <TabsTrigger 
                  value="system-config" 
                  className="w-full justify-start data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  System Configuration
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="w-full justify-start data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="w-full justify-start data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 pt-6 border-t">
                <Button 
                  variant="outline" 
                  className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 dark:hover:text-red-400"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <TabsContent value="profile" className="mt-0">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-32 w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>
              ) : (
                <AdminProfileSection profileData={profileData} />
              )}
            </TabsContent>
            
            <TabsContent value="user-management" className="mt-0">
              <UserManagementSection />
            </TabsContent>
            
            <TabsContent value="system-config" className="mt-0">
              <SystemConfigSection />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0">
              <AnalyticsSection />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0">
              <SettingsSection />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}
