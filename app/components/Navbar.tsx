'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '../lib/utils'
import { MobileMenu } from './MobileMenu'
import { ThemeToggle } from './theme-toggle'
import { LanguageSelector } from './language-selector'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'

interface NavbarProps {
  transparent?: boolean
  className?: string
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/about', label: 'About Us' },
]

export function Navbar({ transparent = false, className }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()
  const { user, signOut } = useAuth()

  const dashboardLink = user?.role === 'talent' ? '/talent/dashboard' : '/hiring-manager/dashboard'

  const handleLogout = async () => {
    await signOut()
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 w-full transition-standard",
        transparent && !scrolled 
          ? "bg-transparent" 
          : "bg-background/80 backdrop-blur-sm border-b shadow-sm",
        className
      )}
      style={{ position: 'relative', zIndex: 50 }}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center focus-visible relative z-10">
          <Image
            src="/images/zirak-hr-logo.svg"
            alt="ZIRAK HR Logo"
            width={100}
            height={100}
            className="w-[85px] h-[85px] md:w-[100px] md:h-[100px] dark:filter dark:brightness-0 dark:[filter:invert(83%)_sepia(82%)_saturate(473%)_hue-rotate(24deg)_brightness(106%)_contrast(104%)] transition-standard"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 relative z-10">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href}
              className={cn(
                "font-medium text-sm relative px-2 py-1 transition-all duration-200",
                "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#D6FF00] after:transition-all after:duration-300",
                "hover:after:w-full hover:text-black dark:hover:text-white",
                pathname === link.href 
                  ? "text-black dark:text-white after:w-full after:bg-[#D6FF00]" 
                  : "text-gray-600 dark:text-gray-300"
              )}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side items */}
        <div className="flex items-center space-x-4 relative z-10">
          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            {user ? (
              <>
                <Link
                  href={dashboardLink}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-full border-2 border-black dark:border-[#D6FF00] bg-[#D6FF00] text-black hover:bg-[#c1e600] hover:border-[#c1e600] transition-colors relative z-10"
                >
                  {t('auth.login')}
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium px-4 py-2 rounded-full border-2 border-black dark:border-[#D6FF00] bg-[#D6FF00] text-black hover:bg-[#c1e600] hover:border-[#c1e600] transition-colors relative z-10"
                >
                  {t('auth.register')}
                </Link>
              </div>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Auth Buttons and Menu */}
          <div className="md:hidden flex items-center space-x-4">
            {!user && (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-full border-2 border-black dark:border-[#D6FF00] bg-[#D6FF00] text-black hover:bg-[#c1e600] hover:border-[#c1e600] transition-colors relative z-10"
                >
                  {t('auth.login')}
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium px-4 py-2 rounded-full border-2 border-black dark:border-[#D6FF00] bg-[#D6FF00] text-black hover:bg-[#c1e600] hover:border-[#c1e600] transition-colors relative z-10"
                >
                  {t('auth.register')}
                </Link>
              </>
            )}
            <div className="relative z-[60]">
              <MobileMenu 
                navLinks={navLinks} 
                isAuthenticated={!!user}
                dashboardLink={dashboardLink}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}