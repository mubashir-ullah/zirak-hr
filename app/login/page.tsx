'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { SocialLoginButtons } from '@/app/components/auth/social-login-buttons'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '@/lib/utils'

// Define the props for SocialLoginButtons component
interface SocialLoginButtonsProps {
  onProviderClick: (provider: 'google' | 'github' | 'linkedin' | 'apple') => Promise<void>;
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const { login, refreshSession } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    if (searchParams.get('registered')) {
      setSuccessMessage('Registration successful! Please log in.')
    }
    
    // Check if user was redirected after selecting a role
    if (searchParams.get('roleSelected') === 'true') {
      setRedirecting(true)
      
      // Get the stored redirect URL from localStorage
      const redirectUrl = localStorage.getItem('redirectAfterLogin')
      
      if (redirectUrl) {
        console.log('Role was selected, redirecting to:', redirectUrl)
        // Clear the stored URL
        localStorage.removeItem('redirectAfterLogin')
        
        // Auto sign in after role selection (this is just for UI feedback)
        setLoading(true)
        setSuccessMessage('Role selected successfully! Redirecting to dashboard...')
        
        // Redirect after a short delay to allow the user to see the message
        setTimeout(() => {
          window.location.href = redirectUrl
        }, 1500)
      }
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Attempting login with email:', formData.email)
      
      // Sign in with Supabase directly
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        console.error('Login error:', authError)
        setError('Invalid email or password. Please try again.')
        setLoading(false)
        return
      }

      if (!authData?.user || !authData?.session) {
        console.error('No user/session data returned')
        setError('Login failed. Please try again.')
        setLoading(false)
        return
      }

      console.log('Login successful with Supabase Auth:', authData.user.id)
      setSuccessMessage('Login successful! Redirecting...')

      // Now determine where to send the user based on their role
      const userRole = authData.user.user_metadata?.role
      
      // If role is missing, always redirect to role selection
      if (!userRole) {
        console.log('No role found in user metadata, redirecting to role selection')
        
        // Create user in database first to ensure they exist
        try {
          const createResponse = await fetch('/api/auth/create-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: authData.user.id,
              email: formData.email,
              name: authData.user.user_metadata?.name || formData.email.split('@')[0],
              needs_role_selection: true,
            }),
          })
          
          if (!createResponse.ok) {
            console.error('Failed to create/update user profile:', await createResponse.text())
          } else {
            console.log('User profile created/updated successfully')
          }
        } catch (err) {
          console.error('Error creating/updating user:', err)
          // Continue anyway - we'll redirect to role selection
        }
        
        window.location.href = '/dashboard/role-selection'
        return
      }

      // Normalize role - handle different formats of the same role
      const normalizedRole = userRole.replace('-', '_').toLowerCase()
      console.log('Normalized role:', normalizedRole)
      
      // If we have a role, get its canonical form and redirect
      let dashboardPath
      
      if (normalizedRole === 'talent') {
        dashboardPath = '/dashboard/talent'
      } else if (normalizedRole === 'hiring_manager') {
        dashboardPath = '/dashboard/hiring-manager'
      } else if (normalizedRole === 'admin') {
        dashboardPath = '/dashboard/admin'
      } else {
        // Unrecognized role - redirect to role selection
        console.log('Unrecognized role:', userRole, 'redirecting to role selection')
        window.location.href = '/dashboard/role-selection'
        return
      }

      console.log('Redirecting to dashboard:', dashboardPath)
      window.location.href = dashboardPath
      
    } catch (err) {
      console.error('Unexpected login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github' | 'linkedin' | 'apple') => {
    try {
      setLoading(true)
      setError('')

      // Sign in with Supabase OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      // If successful, Supabase will redirect to the URL specified in redirectTo
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(`Failed to get redirect URL from ${provider}`)
      }
    } catch (err) {
      console.error(`Error signing in with ${provider}:`, err)
      setError(err instanceof Error ? err.message : `Failed to sign in with ${provider}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black transition-colors duration-200">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-black rounded-2xl shadow-xl p-8 space-y-6 transition-all duration-200 border border-gray-200 dark:border-gray-800">
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <Image
                  src="/images/zirak-hr-logo.svg"
                  alt="ZIRAK HR Logo"
                  fill
                  className="object-contain dark:filter dark:brightness-0 dark:invert dark:sepia dark:hue-rotate-[60deg] dark:saturate-[1000%] transition-all duration-200"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                Login
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                Sign in to your account to continue
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm font-medium transition-colors">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-lg text-sm font-medium transition-colors">
                {successMessage}
              </div>
            )}

            {redirecting ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded transition-colors"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "w-full px-4 py-2.5 rounded-lg bg-[#D6FF00] hover:bg-[#c1e600] text-black font-medium border-2 border-black dark:border-[#D6FF00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D6FF00] transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]",
                      loading && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <SocialLoginButtons onProviderClick={handleSocialLogin} />
              </>
            )}

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium text-blue-500 hover:text-blue-700 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}