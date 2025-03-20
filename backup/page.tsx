'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from "../../components/Navbar"
import { Footer } from "../../components/Footer"
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { SocialLoginButtons } from '@/components/auth/social-login-buttons'
import { Separator } from '@/components/ui/separator'
import { useLanguage } from "../contexts/LanguageContext"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (searchParams.get('registered')) {
      setSuccessMessage('Registration successful! Please log in.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password: password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      setSuccessMessage('Login successful! Redirecting...')
      setRedirecting(true)
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex-grow">
        <Navbar />
        
        <div className="max-w-md mx-auto mt-8 mb-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif mb-2">{t('Welcome back')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('Sign in to your account to continue')}</p>
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

          {/* Social Login Buttons */}
          <div className="mb-8">
            <SocialLoginButtons />
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">{t('Or continue with email')}</span>
            </div>
          </div>

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
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6ff00] focus:border-transparent"
                placeholder={t('Enter your email')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                {t('Password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6ff00] focus:border-transparent pr-10"
                  placeholder={t('Enter your password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || redirecting}
                className="w-full py-2 px-4 border-2 border-black dark:border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-[#d6ff00] hover:bg-[#b3e600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d6ff00] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('Signing in...') : redirecting ? t('Redirecting...') : t('Sign in')}
              </button>
            </div>

            <div className="text-center text-sm">
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-500"
              >
                {t('Forgot your password?')}
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("Don't have an account?")}{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  {t('Sign up')}
                </Link>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {t('It will take less than a minute')}
              </p>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}