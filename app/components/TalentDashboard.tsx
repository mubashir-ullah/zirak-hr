'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { 
  User, FileText, Briefcase, ClipboardList, 
  Wrench, Settings, LogOut, Menu, X, Bell,
  Moon, Sun
} from 'lucide-react'
import ProfilePage from './talent/ProfilePage'
import ResumePage from './talent/ResumePage'
import SkillsPage from './talent/SkillsPage'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Footer } from './Footer'

export default function TalentDashboard() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isOnline, setIsOnline] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'jobs' | 'applications' | 'skills' | 'settings'>('profile')
  const [profileSummary, setProfileSummary] = useState({
    fullName: '',
    title: '',
    profilePicture: '/images/default-avatar.png'
  })

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Fetch profile summary data
  useEffect(() => {
    const fetchProfileSummary = async () => {
      try {
        const response = await fetch('/api/talent/profile/summary')
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch profile summary')
        }
        
        const data = await response.json()
        
        if (data.profile) {
          setProfileSummary({
            fullName: data.profile.fullName || '',
            title: data.profile.title || '',
            profilePicture: data.profile.profilePicture || '/images/default-avatar.png'
          })
        }
      } catch (error) {
        console.error('Error fetching profile summary:', error)
      }
    }
    
    fetchProfileSummary()
  }, [router])

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Logout failed:', error)
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
          <h1 className="text-xl lg:text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">Talent Dashboard</h1>
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
          onValueChange={(value) => setActiveTab(value as any)}
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
                
                <div className="relative w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full shadow-inner"></div>
                  <Avatar className="h-full w-full border-2 border-white dark:border-gray-800 shadow-lg">
                    <AvatarImage 
                      src={profileSummary.profilePicture} 
                      alt={profileSummary.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                      {profileSummary.fullName ? profileSummary.fullName.substring(0, 2).toUpperCase() : 'TA'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Status indicator */}
                  <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                </div>
                
                <h2 className="text-lg lg:text-xl font-bold text-black dark:text-white">{profileSummary.fullName}</h2>
                <p className="text-sm text-black dark:text-gray-200 mb-2">{profileSummary.title}</p>
                
                <div className="flex items-center justify-center mt-2 bg-white dark:bg-gray-800 rounded-full py-1 px-3 shadow-sm mx-auto w-fit">
                  <Switch 
                    checked={isOnline}
                    onCheckedChange={setIsOnline}
                    className="data-[state=checked]:bg-green-500 dark:data-[state=checked]:bg-green-600"
                  />
                  <span className={`ml-2 text-sm font-medium ${
                    isOnline 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
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
                  value="resume" 
                  className="w-full justify-start data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  My Resume
                </TabsTrigger>
                <TabsTrigger 
                  value="jobs" 
                  className="w-full justify-start data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Jobs
                </TabsTrigger>
                <TabsTrigger 
                  value="applications" 
                  className="w-full justify-start data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Applications
                </TabsTrigger>
                <TabsTrigger 
                  value="skills" 
                  className="w-full justify-start data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  Skill Tests
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
            <TabsContent value="profile" className="mt-0 border-none">
              <ProfilePage />
            </TabsContent>
            
            <TabsContent value="resume" className="mt-0 border-none">
              <ResumePage />
            </TabsContent>
            
            <TabsContent value="jobs" className="mt-0 border-none">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl lg:text-2xl font-bold mb-6">Job Matches</h2>
                <p className="text-gray-500">Job matching functionality coming soon...</p>
              </div>
            </TabsContent>
            
            <TabsContent value="applications" className="mt-0 border-none">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl lg:text-2xl font-bold mb-6">My Applications</h2>
                <p className="text-gray-500">Application tracking functionality coming soon...</p>
              </div>
            </TabsContent>
            
            <TabsContent value="skills" className="mt-0 border-none">
              <SkillsPage />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0 border-none">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl lg:text-2xl font-bold mb-6">Account Settings</h2>
                <p className="text-gray-500">Settings functionality coming soon...</p>
              </div>
            </TabsContent>
          </main>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}