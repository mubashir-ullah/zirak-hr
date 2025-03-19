"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { LanguageSelector } from "./language-selector"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-1"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 top-[72px] z-50 bg-background border-t">
          <div className="container px-4 py-6 flex flex-col h-full">
            <nav className="flex flex-col space-y-6 text-center">
              <Link href="/" className="font-medium text-lg py-2" onClick={() => setIsOpen(false)}>
                HOME
              </Link>
              <Link href="/features" className="font-medium text-lg py-2" onClick={() => setIsOpen(false)}>
                FEATURES
              </Link>
              <Link href="/pricing" className="font-medium text-lg py-2" onClick={() => setIsOpen(false)}>
                PRICING
              </Link>
              <Link href="/about" className="font-medium text-lg py-2" onClick={() => setIsOpen(false)}>
                ABOUT US
              </Link>

              <div className="flex flex-col space-y-4 mt-4">
                <div className="flex justify-center">
                  <LanguageSelector />
                </div>
                <Link
                  href="/register"
                  className="bg-[#d6ff00] text-black font-medium px-6 py-2 rounded-full border-[1.5px] border-black dark:border-white text-sm mx-auto"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="bg-[#d6ff00] text-black font-medium px-6 py-2 rounded-full border-[1.5px] border-black dark:border-white text-sm mx-auto"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}

