'use client'

import React, { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../contexts/LanguageContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, status } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()

  // Check authentication status and redirect if needed
  useEffect(() => {
    // Skip during initial loading
    if (status === 'loading') return

    // If not authenticated, redirect to login
    if (status === 'unauthenticated' || !session) {
      console.log('Dashboard: User not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    // Check if user needs to select a role
    if (session.user?.needsRoleSelection) {
      console.log('Dashboard: User needs to select a role')
      if (window.location.pathname !== '/dashboard/role-selection') {
        router.push('/dashboard/role-selection')
      }
      return
    }

    // If on the main dashboard route, redirect to the appropriate dashboard
    if (window.location.pathname === '/dashboard' || window.location.pathname === '/dashboard/') {
      const userRole = session.user?.role
      
      if (userRole === 'talent') {
        console.log('Dashboard: Redirecting talent to talent dashboard')
        router.push('/dashboard/talent')
      } else if (userRole === 'hiring_manager') {
        console.log('Dashboard: Redirecting hiring manager to hiring manager dashboard')
        router.push('/dashboard/hiring-manager')
      } else if (userRole === 'admin') {
        console.log('Dashboard: Redirecting admin to admin dashboard')
        router.push('/dashboard/admin')
      } else {
        console.log('Dashboard: No role defined, redirecting to role selection')
        router.push('/dashboard/role-selection')
      }
    }
  }, [status, session, router])

  // Show loading state during authentication check
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show unauthorized message if not authenticated
  if (status === 'unauthenticated' || !session) {
    return null // Will redirect in the useEffect
  }

  return <>{children}</>
}
