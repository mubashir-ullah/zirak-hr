'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { 
  Menu, X, Home, Users, Briefcase, FileText, BarChart3, Settings, LogOut,
  ChevronRight, Bell, Search, Globe, Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import Footer from '@/components/Footer'

// Placeholder for the logo component
const LogoWithTheme = () => {
  const { theme } = useTheme()
  
  return (
    <div className="flex items-center">
      <Image 
        src="/logo.svg" 
        alt="Zirak HR Logo" 
        width={120} 
        height={40} 
        className={theme === 'dark' ? 'invert' : ''}
      />
    </div>
  )
}

// Notification type
type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'application' | 'message' | 'system';
}

export default function HRDashboard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    position: '',
    profilePicture: ''
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard/hr',
      icon: Home,
      active: pathname === '/dashboard/hr'
    },
    {
      name: 'Candidates',
      path: '/dashboard/hr/candidates',
      icon: Users,
      active: pathname === '/dashboard/hr/candidates'
    },
    {
      name: 'Jobs',
      path: '/dashboard/hr/jobs',
      icon: Briefcase,
      active: pathname === '/dashboard/hr/jobs'
    },
    {
      name: 'Applications',
      path: '/dashboard/hr/applications',
      icon: FileText,
      active: pathname === '/dashboard/hr/applications'
    },
    {
      name: 'Analytics',
      path: '/dashboard/hr/analytics',
      icon: BarChart3,
      active: pathname === '/dashboard/hr/analytics'
    },
    {
      name: 'Profile',
      path: '/dashboard/hr/profile',
      icon: Settings,
      active: pathname === '/dashboard/hr/profile'
    }
  ]
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.email) return
      
      try {
        const response = await fetch('/api/user/profile')
        const data = await response.json()
        
        if (data.success) {
          setProfileData({
            name: data.userProfile?.name || session?.user?.name || '',
            position: data.userProfile?.position || 'HR Manager',
            profilePicture: data.userProfile?.profilePicture || ''
          })
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      }
    }
    
    fetchProfileData()
  }, [session])
  
  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.email) return
      
      try {
        const response = await fetch('/api/hr/notifications')
        const data = await response.json()
        
        if (data.success) {
          setNotifications(data.notifications || [])
          setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
        // Use mock data if API fails
        const mockNotifications = [
          {
            id: '1',
            title: 'New Application',
            message: 'John Doe applied for Frontend Developer position',
            time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            read: false,
            type: 'application'
          },
          {
            id: '2',
            title: 'Interview Scheduled',
            message: 'Interview with Sarah Smith scheduled for tomorrow at 2 PM',
            time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            read: false,
            type: 'message'
          },
          {
            id: '3',
            title: 'Profile Update',
            message: 'Your company profile has been updated successfully',
            time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            read: true,
            type: 'system'
          }
        ]
        setNotifications(mockNotifications)
        setUnreadCount(mockNotifications.filter(n => !n.read).length)
      }
    }
    
    fetchNotifications()
    
    // Set up polling for new notifications (every 30 seconds)
    const intervalId = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(intervalId)
  }, [session])
  
  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/hr/notifications/${id}/read`, {
        method: 'PATCH'
      })
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // Update local state anyway for better UX
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }
  
  // Format notification time
  const formatNotificationTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    }
  }
  
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  if (!session) {
    return <div className="flex items-center justify-center min-h-screen">Please sign in to access the dashboard</div>
  }
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="cursor-default">
                <LogoWithTheme />
              </div>
              <button 
                className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            {/* User Profile */}
            <div className="mt-6 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#d6ff00] flex items-center justify-center text-black overflow-hidden">
                  {profileData.profilePicture ? (
                    <Image 
                      src={profileData.profilePicture} 
                      alt={profileData.name || 'User'} 
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-semibold">
                      {session?.user?.name?.charAt(0) || 'H'}
                    </span>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{session?.user?.name || 'User'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">HR Manager</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div 
                  className={`flex items-center px-4 py-3 rounded-md cursor-pointer ${
                    item.active 
                      ? 'bg-gray-100 dark:bg-gray-700 text-[#d6ff00]' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon size={20} className="mr-3" />
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
          </nav>
          
          {/* Language Switcher */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Globe size={16} className="mr-2" />
                  {language === 'en' ? 'English' : language === 'de' ? 'Deutsch' : 'اردو'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  <span className={language === 'en' ? 'font-bold' : ''}>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('de')}>
                  <span className={language === 'de' ? 'font-bold' : ''}>Deutsch</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ur')}>
                  <span className={language === 'ur' ? 'font-bold' : ''}>اردو</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Logout button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              className="w-full justify-start text-sm py-2 text-rose-600 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-400 border-rose-200 hover:border-rose-300 dark:border-rose-800 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button 
                className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              <div className="relative w-64 hidden md:block">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 bg-gray-50 dark:bg-gray-700 border-none"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Post Job Button */}
              <Link href="/dashboard/hr/jobs/create">
                <Button size="sm" className="hidden md:flex items-center gap-1">
                  <Plus size={16} />
                  Post Job
                </Button>
              </Link>
              
              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white" 
                        variant="destructive"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    {notifications.length > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs">
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <span className="text-xs text-gray-500">{formatNotificationTime(notification.time)}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
                      <Link href="/dashboard/hr/notifications" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        View all notifications
                      </Link>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              
              {/* User Menu */}
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={profileData.profilePicture} alt={profileData.name} />
                <AvatarFallback className="bg-[#d6ff00] text-black">
                  {session?.user?.name?.charAt(0) || 'H'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
