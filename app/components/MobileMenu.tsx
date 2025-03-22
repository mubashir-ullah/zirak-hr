'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { LanguageSelector } from './language-selector'
import { cn } from '../lib/utils'
import { usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { getDashboardUrl } from '../utils/auth'

interface MobileMenuProps {
  isAuthenticated: boolean;
  userRole?: string;
  onLogout: () => void;
}

export function MobileMenu({ isAuthenticated, userRole, onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()
  const pathname = usePathname()
  const dashboardLink = getDashboardUrl(userRole)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    // Prevent scrolling when menu is open
    if (!isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }

  const closeMenu = () => {
    setIsOpen(false)
    document.body.style.overflow = 'auto'
  }

  // Common navigation links
  const commonNavLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/features', label: t('nav.features') },
    { href: '/about', label: t('nav.about') },
  ]

  // Authentication-specific links
  const authLinks = isAuthenticated
    ? [
        { href: dashboardLink, label: t('nav.myDashboard') },
        { href: '#', label: t('auth.logout'), onClick: () => { closeMenu(); onLogout(); } }
      ]
    : [
        { href: '/login', label: t('auth.login') },
        { href: '/register', label: t('auth.register') }
      ]

  // Combine all navigation links
  const navLinks = [...commonNavLinks, ...authLinks]

  return (
    <>
      <button 
        onClick={toggleMenu} 
        className="p-2 focus-visible"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile menu overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile menu panel */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-3/4 max-w-sm bg-background p-6 shadow-lg transition-standard",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!isOpen}
      >
        <div className="flex justify-end mb-8">
          <button 
            onClick={closeMenu} 
            className="p-2 focus-visible"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col space-y-6">
          {navLinks.map((link, index) => (
            link.onClick ? (
              <button
                key={index}
                onClick={link.onClick}
                className={cn(
                  "text-lg font-medium transition-standard hover:text-primary text-left",
                  pathname === link.href && "text-primary font-semibold"
                )}
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-lg font-medium transition-standard hover:text-primary",
                  pathname === link.href && "text-primary font-semibold"
                )}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            )
          ))}
          <div className="pt-4">
            <LanguageSelector />
          </div>
        </nav>
      </div>
    </>
  )
}
