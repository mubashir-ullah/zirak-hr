'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import axios from 'axios'

export default function ForgotPasswordPage() {
  const router = useRouter()
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
            <h1 className="text-3xl font-serif mb-2">Forgot Password</h1>
            <p className="text-gray-600 dark:text-gray-400">Enter your email address to receive a password reset link</p>
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
                  <p>{devInfo.emailError}</p>
                </div>
              )}
              
              {devInfo.token && (
                <div className="mb-2">
                  <p className="font-semibold">Reset Token:</p>
                  <p className="break-all">{devInfo.token}</p>
                </div>
              )}
              
              {devInfo.resetUrl && (
                <div className="mb-2">
                  <p className="font-semibold">Reset URL:</p>
                  <p className="break-all">{devInfo.resetUrl}</p>
                </div>
              )}
              
              {devInfo.previewUrl && (
                <div>
                  <p className="font-semibold">Email Preview URL:</p>
                  <p className="break-all">{devInfo.previewUrl}</p>
                  <Link 
                    href={devInfo.previewUrl} 
                    target="_blank" 
                    className="text-blue-600 hover:underline mt-1 inline-block"
                  >
                    Open Email Preview
                  </Link>
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="your@email.com"
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Send Reset Link'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <Link href="/login" className="text-primary hover:text-primary-dark">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
