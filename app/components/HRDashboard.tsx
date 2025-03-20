'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { 
  User, Users, Briefcase, BarChart, 
  LogOut, Moon, Sun, Bell, Settings,
  Plus, Search, Filter
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

// Import dashboard sections
import HRProfileSection from './hr/HRProfileSection'
import TalentPoolSection from './hr/TalentPoolSection'
import JobManagementSection from './hr/JobManagementSection'
import AnalyticsSection from './hr/AnalyticsSection'
import SettingsSection from './hr/SettingsSection'

export default function HRDashboard() {
  const { theme, setTheme } = useTheme()
  const [isOnline, setIsOnline] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    company: '',
    email: '',
    role: '',
    about: '',
    linkedin: '',
    profileImage: '/images/default-avatar.png'
  })

  // Simulate loading profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // In a real app, this would be an API call
        // await fetch('/api/hr/profile')
        
        // Simulate API delay
        setTimeout(() => {
          setProfileData({
            fullName: 'Ahmed Khan',
            company: 'Tech Innovations Ltd',
            email: 'ahmed.khan@techinnovations.com',
            role: 'HR Manager',
            about: 'Experienced HR professional with 5+ years in tech recruitment.',
            linkedin: 'linkedin.com/in/ahmedkhan',
            profileImage: '/images/default-avatar.png'
          })
          setIsLoading(false)
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
    const newStatus = !isOnline
    setIsOnline(newStatus)
    
    // In a real app, this would be an API call
    // await fetch('/api/hr/status', {
    //   method: 'PATCH',
    //   body: JSON.stringify({ status: newStatus ? 'online' : 'offline' })
    // })
    
    toast({
      title: 'Status Updated',
      description: `You are now ${newStatus ? 'online' : 'offline'}`,
    })
  }

  const handleLogout = () => {
    // In a real app, this would clear the auth token and redirect
    toast({
      title: 'Logging out',
      description: 'You will be redirected to the login page.',
    })
    // In production: router.push('/login')
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
          <h1 className="text-xl lg:text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">HR Dashboard</h1>
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
            <Card className="p-4">
              <div className="bg-[#d6ff00] rounded-lg p-4 text-center mb-6">
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
                      <Avatar className="h-full w-full">
                        <AvatarImage src={profileData.profileImage} alt={profileData.fullName} />
                        <AvatarFallback>{profileData.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                    <h2 className="text-lg lg:text-xl font-bold text-black">{profileData.fullName}</h2>
                    <p className="text-sm text-black">{profileData.company}</p>
                    <div className="flex items-center justify-center mt-2">
                      <Switch 
                        checked={isOnline}
                        onCheckedChange={handleStatusToggle}
                        className="data-[state=checked]:bg-black"
                      />
                      <span className="ml-2 text-sm text-black">{isOnline ? 'Online' : 'Offline'}</span>
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
                  value="talent-pool" 
                  className="w-full justify-start data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  <div className="flex justify-between w-full">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Talent Pool
                    </div>
                    <div className="flex items-center">
                      <Image
                        src="/images/robot.svg"
                        alt="AI"
                        width={20}
                        height={20}
                        className="dark:invert"
                      />
                    </div>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="job-management" 
                  className="w-full justify-start data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Job Management
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

              <Separator className="my-4" />

              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Post Job Button - Fixed at bottom right */}
            {activeTab === 'job-management' && (
              <Button 
                className="fixed bottom-8 right-8 bg-[#d6ff00] text-black hover:bg-[#c2eb00] rounded-full h-14 w-14 p-0 shadow-lg z-10"
                size="icon"
              >
                <Plus className="h-6 w-6" />
              </Button>
            )}
            
            {/* Dynamic Content based on active tab */}
            <TabsContent value="profile" className="mt-0 border-none">
              <HRProfileSection 
                profileData={profileData} 
                setProfileData={setProfileData} 
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="talent-pool" className="mt-0 border-none">
              <TalentPoolSection isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="job-management" className="mt-0 border-none">
              <JobManagementSection isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0 border-none">
              <AnalyticsSection isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0 border-none">
              <SettingsSection isLoading={isLoading} />
            </TabsContent>
          </main>
        </Tabs>
      </div>
    </div>
  )
}
