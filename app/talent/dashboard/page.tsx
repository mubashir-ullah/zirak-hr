'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TalentDashboard from '@/app/components/TalentDashboard'
import { useAuth } from '@/app/contexts/AuthContext'

export default function TalentDashboardPage() {
  const router = useRouter()
  const { user, status } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // If the user is not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    // If the user is authenticated but not a talent, redirect to role selection
    if (status === 'authenticated' && user?.role !== 'talent') {
      router.push('/role-selection')
      return
    }

    // If authentication check is complete, set loading to false
    if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [status, user, router])
  
  // Show loading state while checking authentication
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D6FF00]"></div>
        <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
      </div>
    )
  }
  
  // If authenticated and role is talent, show the dashboard
  if (status === 'authenticated' && user?.role === 'talent') {
    return <TalentDashboard />
  }
  
  // Default loading state (should not reach here due to redirects)
  return (
    <div className="min-h-screen flex justify-center items-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D6FF00]"></div>
    </div>
  )
}
