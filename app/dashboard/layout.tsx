'use client'

import React, { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, status, user, refreshSession } = useAuth()
  const router = useRouter()

  // Check authentication status and redirect if needed
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Skip during initial loading
      if (status === 'loading') {
        console.log('Dashboard: Authentication status is loading')
        return
      }

      // If not authenticated, redirect to login
      if (status === 'unauthenticated' || !session) {
        console.log('Dashboard: User not authenticated, redirecting to login')
        router.push('/login')
        return
      }

      console.log('Dashboard: User authenticated with session', {
        id: session.user?.id,
        email: session.user?.email
      })

      // Make sure we have the latest session data
      try {
        await refreshSession()
        console.log('Dashboard: Session refreshed')
      } catch (error) {
        console.error('Dashboard: Failed to refresh session:', error)
        // Continue anyway
      }

      // Check if user needs to select a role
      if (!user?.role || user?.needsRoleSelection) {
        console.log('Dashboard: User needs to select a role', {
          role: user?.role,
          needsRoleSelection: user?.needsRoleSelection
        })
        
        if (window.location.pathname !== '/dashboard/role-selection') {
          router.push('/dashboard/role-selection')
        }
        return
      }

      // If on the main dashboard, redirect to the specific dashboard
      if (window.location.pathname === '/dashboard' || window.location.pathname === '/dashboard/') {
        const userRole = user?.role
        
        console.log('Dashboard: Redirecting to role-specific dashboard', {
          role: userRole
        })
        
        if (userRole === 'talent') {
          router.push('/dashboard/talent')
        } else if (userRole === 'hiring_manager') {
          router.push('/dashboard/hiring-manager')
        } else if (userRole === 'admin') {
          router.push('/dashboard/admin')
        } else {
          console.log('Dashboard: Unknown role, redirecting to role selection')
          router.push('/dashboard/role-selection')
        }
      }
    }

    checkAuthAndRedirect()
  }, [router, session, status, user, refreshSession])

  // Show loading state during authentication check
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated or needs role selection, show nothing (will be redirected)
  if (status === 'unauthenticated' || !session || !user?.role || user?.user_metadata?.needs_role_selection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    )
  }

  return <>{children}</>
}
