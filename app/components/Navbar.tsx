'use client'

import Image from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { MobileMenu } from "@/components/mobile-menu"
import { useLanguage } from "../contexts/LanguageContext"

export function Navbar() {
  const { t } = useLanguage()

  return (
    <header className="flex justify-between items-center mb-6 md:mb-8">
      <div className="flex items-center">
        <Link href="/">
          <Image
            src="/images/zirak-hr-logo.svg"
            alt="ZIRAK HR Logo"
            width={100}
            height={100}
            className="mr-2 md:mr-4 md:w-[140px] md:h-[140px] dark:invert"
          />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-12">
        <Link href="/" className="font-medium text-sm">
          {t('nav.home')}
        </Link>
        <Link href="/features" className="font-medium text-sm">
          {t('nav.features')}
        </Link>
        <Link href="/about" className="font-medium text-sm">
          {t('nav.about')}
        </Link>
      </nav>

      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="hidden md:block">
          <LanguageSelector />
        </div>

        {/* Always visible buttons */}
        <Link
          href="/register"
          className="bg-[#d6ff00] text-black font-medium px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2 rounded-full border-[1.5px] border-black dark:border-white text-xs sm:text-sm"
        >
          {t('auth.register')}
        </Link>
        <span className="hidden md:inline-block text-muted-foreground">|</span>
        <Link
          href="/login"
          className="bg-[#d6ff00] text-black font-medium px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2 rounded-full border-[1.5px] border-black dark:border-white text-xs sm:text-sm"
        >
          {t('auth.login')}
        </Link>

        <ThemeToggle />
        <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  )
} 