'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function RedirectToHiringManager() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  useEffect(() => {
    // If the user is authenticated, update their role to hiring_manager and redirect
    if (status === 'authenticated') {
      // First update the user's role to hiring_manager
      fetch('/api/auth/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'hiring_manager' }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // After role is updated, redirect to the hiring manager dashboard
            router.push('/dashboard/hiring-manager')
          } else {
            console.error('Failed to update role:', data.error)
          }
        })
        .catch(error => {
          console.error('Error updating role:', error)
        })
    } else if (status === 'unauthenticated') {
      // If not authenticated, redirect to login
      router.push('/login?callbackUrl=/dashboard/hiring-manager')
    }
  }, [status, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d6ff00] mb-4"></div>
      <p className="text-lg">Redirecting to Hiring Manager Dashboard...</p>
    </div>
  )
}
