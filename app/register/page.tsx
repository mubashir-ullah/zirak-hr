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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function Register() {
  const router = useRouter()
  const { t } = useLanguage()
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
    organization: '',
    position: ''
  })

  const supabase = createClientComponentClient()

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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            organization: formData.organization,
            position: formData.position,
            needs_role_selection: true
          }
        }
      })

      if (signUpError) throw signUpError

      // Create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user?.id,
            name: formData.name,
            email: formData.email,
            organization: formData.organization,
            position: formData.position
          }
        ])

      if (profileError) throw profileError

      router.push('/dashboard/role-selection')
    } catch (error: any) {
      setError(error.message || 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github' | 'linkedin' | 'apple') => {
    try {
      setError('')
      await login(provider)
    } catch (error: any) {
      setError(error.message || 'An error occurred during social login')
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
                {t('auth.register')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                {t('auth.registerDescription')}
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
                    {t('auth.fullName')}
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
                    placeholder={t('auth.enterFullName')}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
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

                <div className="space-y-1">
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                    {t('auth.organization')}
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
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
                    placeholder={t('auth.enterOrganization')}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                    {t('auth.position')}
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
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
                    placeholder={t('auth.enterPosition')}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
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

                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                    {t('auth.confirmPassword')}
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
                      placeholder={t('auth.confirmPassword')}
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
                {loading ? t('auth.registering') : t('auth.register')}
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
                {t('auth.alreadyHaveAccount')}
              </span>{' '}
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {t('auth.login')}
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