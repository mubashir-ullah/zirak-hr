'use client'

import { useState } from 'react'
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "../contexts/LanguageContext"
import { useRouter } from 'next/navigation'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { SocialLoginButtons } from '@/components/auth/social-login-buttons'
import { signIn } from 'next-auth/react'

type UserRole = 'talent' | 'hiring_manager'

export default function Register() {
  const router = useRouter()
  const { t } = useLanguage()
  const [role, setRole] = useState<UserRole>('talent')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    position: ''
  })

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

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          ...(role === 'hiring_manager' && {
            organization: formData.organization,
            position: formData.position
          })
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Sign in the user after successful registration
      const signInResult = await signIn('credentials', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.error) {
        throw new Error(signInResult.error || 'Login failed after registration')
      }

      // Registration and login successful - redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
            <h1 className="text-3xl font-serif mb-2">Create an Account</h1>
            <p className="text-gray-600 dark:text-gray-400">Join ZIRAK HR to get started</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl mb-8 border-2 border-[#d6ff00]">
            <h2 className="text-lg font-medium mb-4">I want to register as: <span className="text-red-500">*</span></h2>
            <div className="space-y-4">
              <label className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                role === 'talent' ? 'border-[#d6ff00] bg-[#d6ff00]/10' : 'border-gray-200 hover:border-[#d6ff00]/50'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="talent"
                  checked={role === 'talent'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="h-4 w-4 text-[#d6ff00]"
                  required
                />
                <div className="flex flex-col">
                  <span className="font-medium">I'm a Talent</span>
                  <span className="text-sm text-gray-500">Looking for job opportunities and want to showcase your skills</span>
                </div>
              </label>
              <label className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                role === 'hiring_manager' ? 'border-[#d6ff00] bg-[#d6ff00]/10' : 'border-gray-200 hover:border-[#d6ff00]/50'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="hiring_manager"
                  checked={role === 'hiring_manager'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="h-4 w-4 text-[#d6ff00]"
                  required
                />
                <div className="flex flex-col">
                  <span className="font-medium">I'm a Hiring Manager</span>
                  <span className="text-sm text-gray-500">Looking to hire talented professionals for your organization</span>
                </div>
              </label>
            </div>
          </div>

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
            <div className="mt-6">
              <SocialLoginButtons />
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6ff00] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6ff00] focus:border-transparent"
              />
            </div>

            {role === 'hiring_manager' && (
              <>
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium mb-2">Organization Name</label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6ff00] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium mb-2">Role/Position</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6ff00] focus:border-transparent"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6ff00] focus:border-transparent pr-10"
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6ff00] focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border-2 border-black dark:border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-[#d6ff00] hover:bg-[#b3e600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d6ff00] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}