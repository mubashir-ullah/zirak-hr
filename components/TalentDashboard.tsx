'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export default function TalentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect if not authenticated or not a talent
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'talent') {
      // If user is not a talent, redirect to appropriate dashboard
      router.push('/dashboard/hiring-manager')
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

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex-grow">
        <Navbar />
        
        <div className="max-w-7xl mx-auto mt-8 mb-16">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 className="text-3xl font-bold mb-6">Talent Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Profile Completion</h2>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                  <div className="bg-[#d6ff00] h-2.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">45% complete</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Job Matches</h2>
                <p className="text-3xl font-bold text-[#d6ff00]">12</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">New job matches based on your profile</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Applications</h2>
                <p className="text-3xl font-bold text-[#d6ff00]">3</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Active job applications</p>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg dark:border-gray-700">
                  <p className="font-medium">Your profile was viewed by 5 recruiters</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2 days ago</p>
                </div>
                <div className="p-4 border rounded-lg dark:border-gray-700">
                  <p className="font-medium">New job match: Senior Frontend Developer at TechCorp</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">3 days ago</p>
                </div>
                <div className="p-4 border rounded-lg dark:border-gray-700">
                  <p className="font-medium">Application status updated: Interview scheduled</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">5 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
