'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FaGithub, FaLinkedin, FaGoogle } from 'react-icons/fa'
import { SiApple } from 'react-icons/si'
import { linkSocialProvider } from '@/lib/supabaseAuth'
import supabase from '@/lib/supabase'
import { findUserByEmail } from '@/lib/supabaseDb'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const SettingsContent = () => {
  const router = useRouter()
  const { t } = useLanguage()
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
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d6ff00]"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t('Account Settings')}</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('Profile Information')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('Name')}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{user?.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('Email')}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{user?.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('Role')}
              </label>
              <p className="text-gray-900 dark:text-gray-100 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{t('Linked Accounts')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('Link your account with these services to enable social login.')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleLinkAccount('google')}
              disabled={linkingProvider !== null || linkedAccounts.includes('google')}
              className={`flex items-center justify-between px-4 py-3 border rounded-lg ${
                linkedAccounts.includes('google')
                  ? 'bg-gray-100 dark:bg-gray-700 border-green-500 dark:border-green-400'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <FaGoogle className="w-5 h-5 text-red-500 mr-3" />
                <span>{t('Google')}</span>
              </div>
              <span className="text-sm">
                {linkedAccounts.includes('google')
                  ? t('Linked')
                  : linkingProvider === 'google'
                  ? t('Linking...')
                  : t('Link')}
              </span>
            </button>
            
            <button
              onClick={() => handleLinkAccount('github')}
              disabled={linkingProvider !== null || linkedAccounts.includes('github')}
              className={`flex items-center justify-between px-4 py-3 border rounded-lg ${
                linkedAccounts.includes('github')
                  ? 'bg-gray-100 dark:bg-gray-700 border-green-500 dark:border-green-400'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <FaGithub className="w-5 h-5 mr-3" />
                <span>{t('GitHub')}</span>
              </div>
              <span className="text-sm">
                {linkedAccounts.includes('github')
                  ? t('Linked')
                  : linkingProvider === 'github'
                  ? t('Linking...')
                  : t('Link')}
              </span>
            </button>
            
            <button
              onClick={() => handleLinkAccount('linkedin')}
              disabled={linkingProvider !== null || linkedAccounts.includes('linkedin')}
              className={`flex items-center justify-between px-4 py-3 border rounded-lg ${
                linkedAccounts.includes('linkedin')
                  ? 'bg-gray-100 dark:bg-gray-700 border-green-500 dark:border-green-400'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <FaLinkedin className="w-5 h-5 text-blue-600 mr-3" />
                <span>{t('LinkedIn')}</span>
              </div>
              <span className="text-sm">
                {linkedAccounts.includes('linkedin')
                  ? t('Linked')
                  : linkingProvider === 'linkedin'
                  ? t('Linking...')
                  : t('Link')}
              </span>
            </button>
            
            <button
              onClick={() => handleLinkAccount('apple')}
              disabled={linkingProvider !== null || linkedAccounts.includes('apple')}
              className={`flex items-center justify-between px-4 py-3 border rounded-lg ${
                linkedAccounts.includes('apple')
                  ? 'bg-gray-100 dark:bg-gray-700 border-green-500 dark:border-green-400'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <SiApple className="w-5 h-5 mr-3" />
                <span>{t('Apple')}</span>
              </div>
              <span className="text-sm">
                {linkedAccounts.includes('apple')
                  ? t('Linked')
                  : linkingProvider === 'apple'
                  ? t('Linking...')
                  : t('Link')}
              </span>
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            <p>
              {t('Linking accounts allows you to sign in using any of these providers.')}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function SettingsPage() {
  return (
    <LanguageProvider>
      <SettingsContent />
    </LanguageProvider>
  )
}
