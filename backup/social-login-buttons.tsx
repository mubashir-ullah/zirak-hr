'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { FaGithub, FaLinkedin, FaGoogle } from 'react-icons/fa'
import { SiApple } from 'react-icons/si'
import { toast } from 'sonner'

export function SocialLoginButtons() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSocialLogin = async (provider: string) => {
    try {
      setIsLoading(provider)
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
      toast.error(`Failed to sign in with ${provider}. Please try again.`)
      setIsLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        disabled={isLoading !== null}
        onClick={() => handleSocialLogin('google')}
        className={`flex justify-center items-center gap-2 w-full py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
          isLoading === 'google' ? 'opacity-70 cursor-not-allowed' : ''
        }`}
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
      >
        <SiApple className="w-5 h-5" />
        <span className="text-sm font-medium">
          {isLoading === 'apple' ? 'Connecting...' : 'Apple'}
        </span>
      </button>
    </div>
  )
}
