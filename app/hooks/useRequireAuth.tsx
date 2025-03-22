'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

interface UseRequireAuthOptions {
  redirectTo?: string
  requiredRole?: 'talent' | 'hiring_manager' | 'admin'
}

/**
 * A hook that ensures the user is authenticated before accessing a page
 * Redirects to login if not authenticated
 * Optionally checks for specific roles
 */
export function useRequireAuth({
  redirectTo = '/login',
  requiredRole
}: UseRequireAuthOptions = {}) {
  const { session, status } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Don't do anything during initial loading
    if (status === 'loading') {
      return
    }

    // Check if user is authenticated
    if (status !== 'authenticated' || !session) {
      console.log('User not authenticated, redirecting to', redirectTo)
      router.push(redirectTo)
      return
    }

    // If role check is required
    if (requiredRole && session.user?.role !== requiredRole) {
      console.log(`User role ${session.user?.role} doesn't match required role ${requiredRole}`)
      
      // Redirect based on the user's actual role
      if (session.user?.role === 'talent') {
        router.push('/dashboard/talent')
      } else if (session.user?.role === 'hiring_manager') {
        router.push('/dashboard/hiring-manager')
      } else if (session.user?.role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard/role-selection')
      }
      return
    }

    // User is authorized
    setIsAuthorized(true)
    setIsLoading(false)
  }, [status, session, router, redirectTo, requiredRole])

  return { isAuthorized, isLoading, session, status }
}
