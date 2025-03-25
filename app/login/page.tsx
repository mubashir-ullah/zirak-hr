'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { SocialLoginButtons } from '@/components/auth/social-login-buttons'
import { useLanguage } from "../contexts/LanguageContext"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const { login } = useAuth()
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) throw error

      // Get user profile to check role selection status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('needs_role_selection')
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError

      // Redirect based on role selection status
      if (profile?.needs_role_selection) {
        router.push('/dashboard/role-selection')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to log in')
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github' | 'linkedin' | 'apple') => {
    try {
      setError('')
      await login(provider)
    } catch (error: any) {
      setError(error.message || 'Failed to log in with social provider')
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
                {t('auth.login')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                {t('auth.loginDescription')}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={cn(
                      "w-full px-4 py-2 rounded-lg border",
                      "bg-white dark:bg-gray-800",
                      "border-gray-300 dark:border-gray-600",
                      "text-gray-900 dark:text-white",
                      "placeholder-gray-500 dark:placeholder-gray-400",
                      "focus:ring-2 focus:ring-[#D6FF00] focus:border-transparent",
                      "transition-all duration-200"
                    )}
                    placeholder={t('auth.enterEmail')}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className={cn(
                        "w-full px-4 py-2 rounded-lg border",
                        "bg-white dark:bg-gray-800",
                        "border-gray-300 dark:border-gray-600",
                        "text-gray-900 dark:text-white",
                        "placeholder-gray-500 dark:placeholder-gray-400",
                        "focus:ring-2 focus:ring-[#D6FF00] focus:border-transparent",
                        "pr-10 transition-all duration-200"
                      )}
                      placeholder={t('auth.enterPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    {t('auth.rememberMe')}
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || redirecting}
                className={cn(
                  "w-full px-4 py-2 rounded-lg",
                  "bg-[#D6FF00] hover:bg-[#c1e600]",
                  "text-black font-medium",
                  "border-2 border-black dark:border-[#D6FF00]",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D6FF00]",
                  "transform transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                {loading ? t('auth.loggingIn') : t('auth.login')}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600 transition-colors" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 transition-colors">
                  {t('auth.orContinueWith')}
                </span>
              </div>
            </div>

            <SocialLoginButtons onProviderClick={handleSocialLogin} />

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('auth.noAccount')}
              </span>{' '}
              <Link
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {t('auth.register')}
              </Link>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('auth.registerMinute')}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}