'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { ThemeToggle } from './theme-toggle'
import { useAuth } from '../contexts/AuthContext'

interface MobileMenuProps {
  navLinks?: Array<{ href: string; label: string }>
}

const defaultNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/about', label: 'About Us' },
]

export function MobileMenu({ 
  navLinks = defaultNavLinks
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, isEmailVerified } = useAuth()

  const dashboardLink = user?.role === 'talent' ? '/talent/dashboard' : '/hiring-manager/dashboard'

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Check if email is verified
    if (!isEmailVerified()) {
      // Redirect to email verification page if email is not verified
      router.push(`/verify-email?email=${encodeURIComponent(user?.email || '')}`)
    } else {
      // If email is verified, proceed to dashboard
      router.push(dashboardLink)
    }
    
    // Close the menu
    toggleMenu()
  }

  const handleLogout = async () => {
    await signOut()
    toggleMenu()
  }

  return (
    <>
      <button
        onClick={toggleMenu}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100]" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={toggleMenu}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
          />
          
          {/* Menu Content */}
          <div 
            className="absolute right-0 top-0 h-[100vh] w-[300px] bg-background shadow-xl overflow-y-auto"
            style={{ position: 'fixed', top: 0, right: 0, height: '100vh' }}
          >
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b p-4">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <button
                  onClick={toggleMenu}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <nav className="relative z-10 p-6">
              <ul className="space-y-6">
                {/* Navigation Links */}
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "block text-lg font-medium transition-colors",
                        pathname === link.href
                          ? "text-black dark:text-white"
                          : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                      )}
                      onClick={toggleMenu}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}

                {/* Auth Links */}
                {user ? (
                  <>
                    <li className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleDashboardClick}
                        className="block text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                      >
                        Dashboard
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="block text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                      >
                        Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        href="/login"
                        className="block text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                        onClick={toggleMenu}
                      >
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/register"
                        className="block text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                        onClick={toggleMenu}
                      >
                        Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
