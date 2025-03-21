'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import TalentDashboard from '@/app/components/TalentDashboard'

export default function TalentDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  useEffect(() => {
    // If the user is not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    
    // If the user is authenticated but not a talent, redirect to role selection
    if (status === 'authenticated' && session?.user?.role !== 'talent') {
      router.push('/select-role')
    }
  }, [status, session, router])
  
  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }
  
  // If authenticated and role is talent, show the dashboard
  if (status === 'authenticated' && session?.user?.role === 'talent') {
    return <TalentDashboard />
  }
  
  // Default return (should not reach here due to redirects)
  return null
}
