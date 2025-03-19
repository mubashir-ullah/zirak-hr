'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ThemeToggle } from './theme-toggle'
import { LanguageSelector } from './language-selector'

export default function Navbar() {
  const { theme } = useTheme()

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Zirak HR</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border-[2px] border-black dark:border-transparent text-sm font-medium rounded-md text-black bg-[#d6ff00] hover:bg-[#b3e600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d6ff00]"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-4 py-2 border-[2px] border-black dark:border-transparent text-sm font-medium rounded-md text-black bg-[#d6ff00] hover:bg-[#b3e600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d6ff00]"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 