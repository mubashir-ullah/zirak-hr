'use client'

import { useState } from 'react'
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { SocialLoginButtons } from '@/app/components/auth/social-login-buttons'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function Register() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' // Default to empty string
  })

  const supabase = createClientComponentClient()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate role selection
    if (!formData.role) {
      setError('Please select your role')
      setLoading(false)
      return
    }

    try {
      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        }
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      // Create user in our database
      const createUserResponse = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: authData.user.id,
          email: formData.email,
          name: formData.name,
          role: formData.role,
        }),
      });

      const createUserData = await createUserResponse.json();

      if (!createUserResponse.ok) {
        throw new Error(createUserData.message || 'Failed to create user record');
      }

      // Generate and send OTP for email verification
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code')
      }

      // Redirect to email verification page
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (err) {
      console.error('Registration error:', err)
      setError(err instanceof Error ? err.message : 'Registration failed')
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
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-black rounded-2xl shadow-xl p-8 space-y-8 transition-all duration-200 border border-gray-200 dark:border-gray-800">
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
                Register
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                Create an account to get started
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm font-medium transition-colors">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
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
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                    Email
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
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                    Password
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
                      placeholder="Enter your password"
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

                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
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
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                    Select Your Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
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
                  >
                    <option value="">Select a role</option>
                    <option value="talent">I am Talent</option>
                    <option value="hiring_manager">I am a Hiring Manager</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
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
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600 transition-colors" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 transition-colors">
                  or continue with
                </span>
              </div>
            </div>

            <SocialLoginButtons onProviderClick={handleSocialLogin} />

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Already have an account?
              </span>{' '}
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Login
              </Link>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                It only takes a minute to register
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}