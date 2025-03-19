'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { FaEye, FaEyeSlash } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
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

    console.log('Attempting login with:', { 
      email: email.trim().toLowerCase(),
      passwordLength: password.length 
    });

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password: password,
        redirect: false,
      })

      console.log('SignIn result:', result);

      if (!result) {
        console.log('No result returned from signIn');
        setError('Something went wrong. Please try again.')
        return
      }

      if (result.error) {
        console.log('SignIn error:', result.error);
        setError(result.error)
        return
      }

      console.log('SignIn successful, getting session...');
      setRedirecting(true)
      setSuccessMessage('Login successful! Redirecting...')

      // Get user session
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      
      console.log('Session data:', session);

      if (!session?.user) {
        console.log('No user in session');
        setError('Failed to get user session')
        return
      }

      console.log('User role:', session.user.role);
      
      // Force a hard navigation instead of using router.push
      const redirectPath = session.user.role === 'hiring_manager' 
        ? '/dashboard/hiring-manager' 
        : '/dashboard/talent';
      
      console.log('Redirecting to:', redirectPath);
      window.location.href = redirectPath;
      
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error?.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    try {
      setLoading(true)
      setError('')
      
      const result = await signIn(provider, {
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      // Get user session after social login
      const response = await fetch('/api/auth/session')
      const session = await response.json()

      if (!session?.user) {
        setError('Failed to get user session')
        return
      }

      setRedirecting(true)
      setSuccessMessage('Login successful! Redirecting...')

      // Redirect based on user role
      if (session.user.role === 'hiring_manager') {
        window.location.href = '/dashboard/hiring-manager'
      } else if (session.user.role === 'talent') {
        window.location.href = '/dashboard/talent'
      } else {
        setError('Invalid user role')
      }
    } catch (error) {
      setError('An error occurred during social login')
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
            <h1 className="text-3xl font-serif mb-2">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
          </div>

          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Social Login */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={loading || redirecting}
                className="flex items-center justify-center px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image src="/images/google.svg" alt="Google" width={20} height={20} className="mr-2" />
                Google
              </button>
              <button
                onClick={() => handleSocialLogin('linkedin')}
                disabled={loading || redirecting}
                className="flex items-center justify-center px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image src="/images/linkedin.svg" alt="LinkedIn" width={20} height={20} className="mr-2" />
                LinkedIn
              </button>
              <button
                onClick={() => handleSocialLogin('github')}
                disabled={loading || redirecting}
                className="flex items-center justify-center px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image src="/images/github.svg" alt="GitHub" width={20} height={20} className="mr-2" />
                GitHub
              </button>
              <button
                onClick={() => handleSocialLogin('apple')}
                disabled={loading || redirecting}
                className="flex items-center justify-center px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image src="/images/apple.svg" alt="Apple" width={20} height={20} className="mr-2" />
                Apple
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                disabled={loading || redirecting}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6ff00] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  disabled={loading || redirecting}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6ff00] focus:border-transparent pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || redirecting}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  disabled={loading || redirecting}
                  className="h-4 w-4 text-[#d6ff00] focus:ring-[#d6ff00] border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className={`font-medium text-blue-600 hover:text-blue-500 ${(loading || redirecting) ? 'pointer-events-none opacity-50' : ''}`}>
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || redirecting}
              className="w-full py-2 px-4 border-2 border-black dark:border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-[#d6ff00] hover:bg-[#b3e600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d6ff00] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : redirecting ? 'Redirecting...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className={`font-medium text-blue-600 hover:text-blue-500 ${(loading || redirecting) ? 'pointer-events-none opacity-50' : ''}`}>
                Register
              </Link>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              It will take less than a minute
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
} 