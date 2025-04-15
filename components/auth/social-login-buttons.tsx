'use client'

import { useState } from 'react'
import { FaGithub, FaLinkedin, FaGoogle } from 'react-icons/fa'
import { SiApple } from 'react-icons/si'
import { toast } from 'sonner'
import supabase from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface SocialLoginButtonsProps {
  onProviderClick?: (provider: 'google' | 'github' | 'linkedin' | 'apple') => Promise<void>;
}

export function SocialLoginButtons({ onProviderClick }: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSocialLogin = async (provider: 'google' | 'github' | 'linkedin' | 'apple') => {
    try {
      setIsLoading(provider)
      setError(null)

      // If onProviderClick prop is provided, use that instead
      if (onProviderClick) {
        await onProviderClick(provider)
        return
      }

      // Use Supabase Auth for social login
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        console.error(`Error signing in with ${provider}:`, error)
        setError(`Failed to sign in with ${provider}. ${error.message}`)
        toast.error(`Failed to sign in with ${provider}. Please try again.`)
        setIsLoading(null)
        return
      }

      // If successful, Supabase will redirect to the URL specified in redirectTo
      if (data.url) {
        // Show success message before redirecting
        toast.success(`Connecting to ${provider}...`)
        window.location.href = data.url
      } else {
        setError(`Failed to get redirect URL from ${provider}`)
        toast.error(`Failed to sign in with ${provider}. Please try again.`)
        setIsLoading(null)
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
      setError(`An unexpected error occurred with ${provider}`)
      toast.error(`Failed to sign in with ${provider}. Please try again.`)
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={isLoading !== null}
          onClick={() => handleSocialLogin('google')}
          className={`flex justify-center items-center gap-2 w-full py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
            isLoading === 'google' ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          aria-label="Sign in with Google"
        >
          <FaGoogle className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium">
            {isLoading === 'google' ? 'Connecting...' : 'Google'}
          </span>
        </button>

        <button
          type="button"
          disabled={isLoading !== null}
          onClick={() => handleSocialLogin('github')}
          className={`flex justify-center items-center gap-2 w-full py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
            isLoading === 'github' ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          aria-label="Sign in with GitHub"
        >
          <FaGithub className="w-5 h-5" />
          <span className="text-sm font-medium">
            {isLoading === 'github' ? 'Connecting...' : 'GitHub'}
          </span>
        </button>

        <button
          type="button"
          disabled={isLoading !== null}
          onClick={() => handleSocialLogin('linkedin')}
          className={`flex justify-center items-center gap-2 w-full py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
            isLoading === 'linkedin' ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          aria-label="Sign in with LinkedIn"
        >
          <FaLinkedin className="w-5 h-5 text-blue-700" />
          <span className="text-sm font-medium">
            {isLoading === 'linkedin' ? 'Connecting...' : 'LinkedIn'}
          </span>
        </button>

        <button
          type="button"
          disabled={isLoading !== null}
          onClick={() => handleSocialLogin('apple')}
          className={`flex justify-center items-center gap-2 w-full py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
            isLoading === 'apple' ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          aria-label="Sign in with Apple"
        >
          <SiApple className="w-5 h-5" />
          <span className="text-sm font-medium">
            {isLoading === 'apple' ? 'Connecting...' : 'Apple'}
          </span>
        </button>
      </div>
    </div>
  )
}
