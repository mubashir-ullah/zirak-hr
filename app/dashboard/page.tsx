'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    // Check if user needs to select a role
    if ((session?.user as any)?.needsRoleSelection) {
      router.push('/dashboard/role-selection')
      return
    }
    
    // Redirect based on user role
    const role = (session?.user as any)?.role
    if (role === 'talent') {
      router.push('/dashboard/talent')
    } else if (role === 'hiring_manager') {
      router.push('/dashboard/hiring-manager')
    } else {
      // If no role is found, redirect to role selection
      router.push('/dashboard/role-selection')
    }
  }, [status, session, router])
  
  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d6ff00]"></div>
    </div>
  )
}
