"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
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
                Home
              </Link>
              <Link href="/features" className="font-medium text-lg py-2" onClick={() => setIsOpen(false)}>
                Features
              </Link>
              <Link href="/about" className="font-medium text-lg py-2" onClick={() => setIsOpen(false)}>
                About
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
