'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { 
  Home, 
  User, 
  Users, 
  Briefcase, 
  BarChart, 
  Settings,
  Menu,
  X,
  LogOut,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/theme-toggle'

// Dashboard sections
import HiringManagerOverview from '@/components/dashboard/hiring-manager/Overview'
import HiringManagerProfile from '@/components/dashboard/hiring-manager/Profile'
import HiringManagerTalentPool from '@/components/dashboard/hiring-manager/TalentPool'
import HiringManagerJobs from '@/components/dashboard/hiring-manager/Jobs'
import HiringManagerAnalytics from '@/components/dashboard/hiring-manager/Analytics'
import HiringManagerSettings from '@/components/dashboard/hiring-manager/Settings'

// Logo component that changes based on theme
function LogoWithTheme() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <div className="h-20 w-[240px]" />
    )
  }
  
  const currentTheme = theme === 'system' ? resolvedTheme : theme
  
  return (
    <>
      {/* Light mode logo - hidden in dark mode */}
      <Image 
        src="/images/zirak-hr-logo.svg" 
        alt="Zirak HR Logo" 
        width={240} 
        height={80} 
        className={`h-20 w-auto ${currentTheme === 'dark' ? 'hidden' : 'block'}`}
      />
      
      {/* Dark mode logo - hidden in light mode */}
      <Image 
        src="/images/zirak-hr-logo.svg" 
        alt="Zirak HR Logo" 
        width={240} 
        height={80} 
        className={`h-20 w-auto ${currentTheme === 'dark' ? 'block' : 'hidden'} invert`}
      />
    </>
  )
}

export default function HiringManagerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Extract the current section from the pathname
  const currentSection = pathname?.split('/').pop() || 'overview'

  useEffect(() => {
    // Redirect if not authenticated or not a hiring manager
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'hiring_manager') {
      // If user is not a hiring manager, redirect to appropriate dashboard
      router.push('/dashboard/talent')
    } else if (status === 'authenticated') {
      setLoading(false)
    }
  }, [status, session, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d6ff00]"></div>
      </div>
    )
  }

  // Render the appropriate section based on the current path
  const renderSection = () => {
    switch (currentSection) {
      case 'profile':
        return <HiringManagerProfile />
      case 'talent-pool':
        return <HiringManagerTalentPool />
      case 'jobs':
        return <HiringManagerJobs />
      case 'analytics':
        return <HiringManagerAnalytics />
      case 'settings':
        return <HiringManagerSettings />
      default:
        return <HiringManagerOverview />
    }
  }

  // Navigation items
  const navItems = [
    {
      name: 'Overview',
      path: '/dashboard/hiring-manager',
      icon: Home,
      active: currentSection === 'overview' || currentSection === 'hiring-manager'
    },
    {
      name: 'HR Profile',
      path: '/dashboard/hiring-manager/profile',
      icon: User,
      active: currentSection === 'profile'
    },
    {
      name: 'Talent Pool',
      path: '/dashboard/hiring-manager/talent-pool',
      icon: Users,
      active: currentSection === 'talent-pool'
    },
    {
      name: 'Jobs',
      path: '/dashboard/hiring-manager/jobs',
      icon: Briefcase,
      active: currentSection === 'jobs'
    },
    {
      name: 'Analytics',
      path: '/dashboard/hiring-manager/analytics',
      icon: BarChart,
      active: currentSection === 'analytics'
    },
    {
      name: 'Settings',
      path: '/dashboard/hiring-manager/settings',
      icon: Settings,
      active: currentSection === 'settings'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-full"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="cursor-default">
              <div className="flex items-center">
                <LogoWithTheme />
              </div>
            </div>
          </div>
          
          {/* User info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                  {session?.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || 'User'} 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-xl font-semibold">
                      {session?.user?.name?.charAt(0) || 'H'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{session?.user?.name || 'User'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hiring Manager</p>
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
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main content area with footer at the bottom */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderSection()}
          </div>
          
          {/* Footer - at the bottom of content */}
          <footer className="py-4 border-t border-gray-200 dark:border-gray-700 mt-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center">
                <p className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  Developed with ❤️ by Team Highlanders. All rights reserved © 2025.
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
      
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
