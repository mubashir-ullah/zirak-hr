'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { useLanguage } from "../contexts/LanguageContext"
import axios from 'axios'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [devInfo, setDevInfo] = useState<{
    token?: string, 
    resetUrl?: string, 
    previewUrl?: string,
    emailError?: string
  }>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')
    setDevInfo({})

    if (!email) {
      setError('Email is required')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post('/api/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      })

      setSuccessMessage(response.data.message || 'If your email is registered, you will receive a password reset link shortly.')
      
      // For development mode, show the token, reset URL, and preview URL if provided
      if (response.data.devToken || response.data.resetUrl || response.data.previewUrl || response.data.emailError) {
        setDevInfo({
          token: response.data.devToken,
          resetUrl: response.data.resetUrl,
          previewUrl: response.data.previewUrl,
          emailError: response.data.emailError
        })
      }
      
      // Clear the form
      setEmail('')
    } catch (error: any) {
      console.error('Forgot password error:', error)
      
      if (error.response?.status === 500) {
        setError('Server error. Please try again later or contact support.')
      } else {
        setError(error.response?.data?.error || 'An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex-grow">
        <Navbar />
        
        <div className="max-w-md mx-auto mt-8 mb-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif mb-2">{t('Forgot Password')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('Enter your email address to receive a password reset link')}</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg mb-6">
              {successMessage}
            </div>
          )}
          
          {/* Development mode information */}
          {(devInfo.token || devInfo.resetUrl || devInfo.previewUrl || devInfo.emailError) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-4 rounded-lg mb-6 text-sm">
              <p className="font-bold mb-2">Development Mode Info:</p>
              
              {devInfo.emailError && (
                <div className="mb-3 p-2 bg-red-50 text-red-600 rounded">
                  <p className="font-semibold">Email Error:</p>
                  <p className="text-xs break-all">{devInfo.emailError}</p>
                  <p className="mt-1 text-xs">
                    See <code className="bg-gray-100 px-1 py-0.5 rounded">email-setup-instructions.md</code> for email configuration help.
                  </p>
                </div>
              )}
              
              {devInfo.token && (
                <p className="mb-2">
                  <span className="font-semibold">Token:</span> {devInfo.token.substring(0, 16)}...
                </p>
              )}
              
              {devInfo.resetUrl && (
                <p className="mb-2">
                  <span className="font-semibold">Reset URL:</span>{' '}
                  <a 
                    href={devInfo.resetUrl} 
                    className="underline"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Click here to reset your password
                  </a>
                </p>
              )}
              
              {devInfo.previewUrl && (
                <p className="mb-2">
                  <span className="font-semibold">Email Preview:</span>{' '}
                  <a 
                    href={devInfo.previewUrl} 
                    className="underline"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View the email
                  </a>
                </p>
              )}
              
              <p className="text-xs mt-3 italic">
                Note: In production, this information will not be displayed.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t('Email address')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6ff00] focus:border-transparent"
                placeholder={t('Enter your email')}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 border-2 border-black dark:border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-[#d6ff00] hover:bg-[#b3e600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d6ff00] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('Sending...') : t('Send Reset Link')}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('Remember your password?')}{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  {t('Sign in')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}
