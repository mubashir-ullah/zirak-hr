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
import JobsPage from './talent/JobsPage'
import MyApplications from './talent/jobs/MyApplications'
import SettingsPage from './talent/SettingsPage'
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
import { useAuth } from '../contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function TalentDashboard() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, status, signOut } = useAuth()
  const [isOnline, setIsOnline] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'jobs' | 'applications' | 'skills' | 'settings'>('profile')
  const [profileSummary, setProfileSummary] = useState({
    fullName: '',
    title: '',
    profilePicture: '/images/default-avatar.png'
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  // Check auth status and redirect if needed
  useEffect(() => {
    const checkAuth = async () => {
      console.log('TalentDashboard: Checking auth state...')
      
      // If still loading auth state, wait
      if (status === 'loading') {
        console.log('TalentDashboard: Auth state is still loading')
        return
      }
      
      // When auth state is resolved, handle it
      if (status === 'unauthenticated' || !user) {
        console.log('TalentDashboard: User is not authenticated, redirecting to login')
        window.location.href = '/login'
        return
      }
      
      console.log('TalentDashboard: User authenticated:', {
        id: user.id,
        role: user.role
      })
      
      // Check for correct role
      if (user.role !== 'talent') {
        console.log('TalentDashboard: User has incorrect role:', user.role)
        
        if (user.needsRoleSelection) {
          console.log('TalentDashboard: User needs to select a role, redirecting')
          window.location.href = '/dashboard/role-selection'
          return
        }
        
        if (user.role === 'hiring_manager') {
          console.log('TalentDashboard: User is hiring manager, redirecting')
          window.location.href = '/dashboard/hiring-manager'
          return
        }
        
        if (user.role === 'admin') {
          console.log('TalentDashboard: User is admin, redirecting')
          window.location.href = '/dashboard/admin'
          return
        }
        
        // If we reach here, redirect to role selection as fallback
        console.log('TalentDashboard: Role is invalid, redirecting to role selection')
        window.location.href = '/dashboard/role-selection'
        return
      }
      
      // If we get here, the user is authenticated as a talent
      console.log('TalentDashboard: Authentication verified, user is talent')
      setLoading(false)
      
      // Get profile data
      fetchProfileSummary()
    }
    
    checkAuth()
  }, [status, user, router])

  // Also listen for auth state changes with Supabase directly
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('TalentDashboard: Auth state changed:', event)
      
      if (event === 'SIGNED_OUT') {
        window.location.href = '/login'
      }
    })
    
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

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
  const fetchProfileSummary = async () => {
    try {
      console.log('Fetching profile summary data');
      const response = await fetch('/api/talent/profile/summary');
      
      if (!response.ok) {
        console.error('Profile summary response not OK:', response.status);
        
        if (response.status === 401) {
          console.log('Unauthorized, redirecting to login');
          window.location.href = '/login';
          return;
        }
        
        // Use default values if API fails
        setProfileSummary({
          fullName: user?.email?.split('@')[0] || 'User',
          title: 'Talent',
          profilePicture: '/images/default-avatar.png'
        });
        return;
      }
      
      const data = await response.json();
      console.log('Profile summary data received:', data);
      
      if (data.profile) {
        setProfileSummary({
          fullName: data.profile.fullName || user?.email?.split('@')[0] || 'User',
          title: data.profile.title || 'Talent',
          profilePicture: data.profile.profilePicture || '/images/default-avatar.png'
        });
      } else {
        // Fallback to default values with user's email
        setProfileSummary({
          fullName: user?.email?.split('@')[0] || 'User',
          title: 'Talent',
          profilePicture: '/images/default-avatar.png'
        });
      }
    } catch (error) {
      console.error('Error fetching profile summary:', error);
      // Use default values with user's email
      setProfileSummary({
        fullName: user?.email?.split('@')[0] || 'User',
        title: 'Talent',
        profilePicture: '/images/default-avatar.png'
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setLoading(true)
      await signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
      // Try fallback to direct Supabase signout
      await supabase.auth.signOut()
      window.location.href = '/login'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d6ff00]"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex-grow">
        <Navbar />
        
        <div className="max-w-7xl mx-auto mt-8 mb-16">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 className="text-3xl font-bold mb-6">Talent Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Profile Completion</h2>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                  <div className="bg-[#d6ff00] h-2.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">45% complete</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Job Matches</h2>
                <p className="text-3xl font-bold text-[#d6ff00]">12</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">New job matches based on your profile</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Applications</h2>
                <p className="text-3xl font-bold text-[#d6ff00]">3</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Active job applications</p>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg dark:border-gray-700">
                  <p className="font-medium">Your profile was viewed by 5 recruiters</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2 days ago</p>
                </div>
                <div className="p-4 border rounded-lg dark:border-gray-700">
                  <p className="font-medium">New job match: Senior Frontend Developer at TechCorp</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">3 days ago</p>
                </div>
                <div className="p-4 border rounded-lg dark:border-gray-700">
                  <p className="font-medium">Application status updated: Interview scheduled</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">5 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
