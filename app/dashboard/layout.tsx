'use client'

import React, { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, status } = useAuth()
  const router = useRouter()

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
        console.log('Dashboard: Unknown role, redirecting to role selection', userRole)
        router.push('/dashboard/role-selection')
      }
    }
  }, [router, session, status])

  // Show loading state during authentication check
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated or needs role selection, show nothing (will be redirected)
  if (status === 'unauthenticated' || !session || session.user?.needsRoleSelection) {
    return null
  }

  return <>{children}</>
}
