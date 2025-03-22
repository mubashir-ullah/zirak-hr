import { signOut } from 'next-auth/react'

/**
 * Logs the user out and clears all authentication data
 * @param callbackUrl - URL to redirect to after logout (default: '/')
 * @returns Promise that resolves when logout is complete
 */
export async function logout(callbackUrl: string = '/') {
  try {
    // First sign out with next-auth
    await signOut({ redirect: false })
    
    // Then call our custom logout endpoint to ensure all cookies are cleared
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
    
    // Force a full page refresh to clear any client-side state
    window.location.href = callbackUrl
    
    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    return { success: false, error }
  }
}

/**
 * Checks if the user is authenticated
 * @param session - The user's session
 * @returns Boolean indicating if the user is authenticated
 */
export function isAuthenticated(session: any) {
  return !!session?.user
}

/**
 * Gets the appropriate dashboard URL based on user role
 * @param userRole - The user's role
 * @returns The dashboard URL
 */
export function getDashboardUrl(userRole?: string) {
  if (!userRole) return '/dashboard'
  
  switch(userRole) {
    case 'talent':
      return '/dashboard/talent'
    case 'hiring_manager':
      return '/dashboard/hiring-manager'
    case 'admin':
      return '/dashboard/admin'
    default:
      return '/dashboard'
  }
}
