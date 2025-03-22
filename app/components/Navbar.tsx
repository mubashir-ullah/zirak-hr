'use client'

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { LanguageSelector } from "./language-selector"
import { MobileMenu } from "./MobileMenu"
import { useLanguage } from "../contexts/LanguageContext"
import { useAuth } from "../contexts/AuthContext"
import { cn } from "../lib/utils"
import { getDashboardUrl } from "../utils/auth"

interface NavbarProps {
  transparent?: boolean;
  className?: string;
}

export function Navbar({ transparent = false, className }: NavbarProps) {
  const { t } = useLanguage()
  const { session, status, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect for transparent navbar
  useEffect(() => {
    if (!transparent) return

    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled, transparent])

  // Define navigation links
  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/features', label: t('nav.features') },
    { href: '/about', label: t('nav.about') },
  ]

  // Determine if user is authenticated and their role
  const isAuthenticated = status === 'authenticated' && !!session?.user
  const userRole = session?.user?.role
  
  // Get the appropriate dashboard link
  const dashboardLink = getDashboardUrl(userRole)

  // Handle logout with page refresh to ensure state is reset
  const handleLogout = async () => {
    await logout()
    router.refresh()
  }

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 w-full transition-standard",
        transparent && !scrolled 
          ? "bg-transparent" 
          : "bg-background/80 backdrop-blur-sm border-b",
        className
      )}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center focus-visible">
            <Image
              src="/images/zirak-hr-logo.svg"
              alt="ZIRAK HR Logo"
              width={100}
              height={100}
              className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] dark:invert transition-standard"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
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

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden md:block">
            <LanguageSelector />
          </div>

          {/* Authentication Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link
                href={dashboardLink}
                className={cn(
                  "bg-[#D6FF00] text-black font-medium px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2",
                  "rounded-full border-2 border-black dark:border-white text-xs sm:text-sm",
                  "hover-scale transition-standard focus-visible"
                )}
              >
                {t('nav.myDashboard')}
              </Link>
              <button
                onClick={handleLogout}
                className={cn(
                  "bg-white text-black dark:bg-gray-800 dark:text-white font-medium px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2",
                  "rounded-full border-2 border-black dark:border-white text-xs sm:text-sm",
                  "hover:bg-red-500 hover:text-white hover:border-red-500 dark:hover:bg-red-500 dark:hover:text-white dark:hover:border-red-500",
                  "transition-all duration-300 focus-visible"
                )}
              >
                {t('auth.logout')}
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/register"
                className={cn(
                  "bg-[#D6FF00] text-black font-medium px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2",
                  "rounded-full border-2 border-black dark:border-white text-xs sm:text-sm",
                  "hover-scale transition-standard focus-visible"
                )}
              >
                {t('auth.register')}
              </Link>
              <span className="hidden md:inline-block text-muted-foreground">|</span>
              <Link
                href="/login"
                className={cn(
                  "bg-[#D6FF00] text-black font-medium px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2",
                  "rounded-full border-2 border-black dark:border-white text-xs sm:text-sm",
                  "hover-scale transition-standard focus-visible"
                )}
              >
                {t('auth.login')}
              </Link>
            </>
          )}

          <ThemeToggle />
          <div className="md:hidden">
            <MobileMenu isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />
          </div>
        </div>
      </div>
    </header>
  )
}