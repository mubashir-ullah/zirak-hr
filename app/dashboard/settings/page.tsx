'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FaGithub, FaLinkedin, FaGoogle } from 'react-icons/fa'
import { SiApple } from 'react-icons/si'
import { linkSocialProvider } from '@/lib/supabaseAuth'
import supabase from '@/lib/supabase'
import { findUserByEmail } from '@/lib/supabaseDb'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const SettingsContent = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null)
  const [linkedAccounts, setLinkedAccounts] = useState<string[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession()
        
        if (!sessionData.session || !sessionData.session.user) {
          router.push('/login')
          return
        }
        
        // Get user data from our database
        const userData = await findUserByEmail(sessionData.session.user.email!)
        
        if (userData) {
          setUser(userData)
          setLinkedAccounts(userData.linked_accounts || [])
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
    
    // Check URL for success or error messages
    const url = new URL(window.location.href)
    const success = url.searchParams.get('success')
    const error = url.searchParams.get('error')
    
    if (success) {
      toast.success(success)
      // Clean up URL
      url.searchParams.delete('success')
      window.history.replaceState({}, '', url.toString())
    }
    
    if (error) {
      toast.error(error)
      // Clean up URL
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [router])

  const handleLinkAccount = async (provider: 'google' | 'github' | 'linkedin' | 'apple') => {
    try {
      setLinkingProvider(provider)
      
      // Check if already linked
      if (linkedAccounts.includes(provider)) {
        toast.info(`Your account is already linked with ${provider}`)
        setLinkingProvider(null)
        return
      }
      
      const { url, error } = await linkSocialProvider(provider)
      
      if (error || !url) {
        toast.error(`Failed to link ${provider}: ${error}`)
        setLinkingProvider(null)
        return
      }
      
      // Redirect to provider's OAuth page
      window.location.href = url
    } catch (error) {
      console.error(`Error linking ${provider}:`, error)
      toast.error(`Failed to link ${provider}`)
      setLinkingProvider(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        
        {user && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="text-gray-900 dark:text-gray-100 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                {user.email}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <div className="text-gray-900 dark:text-gray-100 p-2 bg-gray-100 dark:bg-gray-700 rounded capitalize">
                {user.role === 'hiring_manager' ? 'Hiring Manager' : user.role}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Connect your account with these services to enable single sign-on.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center">
              <FaGoogle className="text-2xl text-red-500 mr-3" />
              <span>Google</span>
            </div>
            <button
              onClick={() => handleLinkAccount('google')}
              disabled={linkingProvider === 'google' || linkedAccounts.includes('google')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                linkedAccounts.includes('google')
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-primary text-white hover:bg-primary-dark'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {linkingProvider === 'google' ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : linkedAccounts.includes('google') ? (
                'Connected'
              ) : (
                'Connect'
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center">
              <FaGithub className="text-2xl text-gray-800 dark:text-white mr-3" />
              <span>GitHub</span>
            </div>
            <button
              onClick={() => handleLinkAccount('github')}
              disabled={linkingProvider === 'github' || linkedAccounts.includes('github')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                linkedAccounts.includes('github')
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-primary text-white hover:bg-primary-dark'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {linkingProvider === 'github' ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : linkedAccounts.includes('github') ? (
                'Connected'
              ) : (
                'Connect'
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center">
              <FaLinkedin className="text-2xl text-blue-600 mr-3" />
              <span>LinkedIn</span>
            </div>
            <button
              onClick={() => handleLinkAccount('linkedin')}
              disabled={linkingProvider === 'linkedin' || linkedAccounts.includes('linkedin')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                linkedAccounts.includes('linkedin')
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-primary text-white hover:bg-primary-dark'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {linkingProvider === 'linkedin' ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : linkedAccounts.includes('linkedin') ? (
                'Connected'
              ) : (
                'Connect'
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center">
              <SiApple className="text-2xl text-gray-800 dark:text-white mr-3" />
              <span>Apple</span>
            </div>
            <button
              onClick={() => handleLinkAccount('apple')}
              disabled={linkingProvider === 'apple' || linkedAccounts.includes('apple')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                linkedAccounts.includes('apple')
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-primary text-white hover:bg-primary-dark'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {linkingProvider === 'apple' ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : linkedAccounts.includes('apple') ? (
                'Connected'
              ) : (
                'Connect'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <SettingsContent />
    </DashboardLayout>
  )
}
