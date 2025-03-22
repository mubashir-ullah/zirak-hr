'use client'

import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { cn } from '../lib/utils'
import { Language } from '../contexts/LanguageContext'

export function LanguageSelector() {
  const { language, setLanguage, availableLanguages } = useLanguage()
  const [isOpen, setIsOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  // Close the dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => setIsOpen(!isOpen)

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-accent transition-standard focus-visible"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">{language.toUpperCase()}</span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-1 w-32 rounded-md border bg-popover shadow-md z-10 animate-fade-in"
          role="listbox"
          aria-label="Languages"
        >
          <div className="py-1">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 text-sm text-left",
                  "hover:bg-accent hover:text-accent-foreground transition-standard",
                  language === lang && "bg-accent/50"
                )}
                onClick={() => handleLanguageChange(lang)}
                role="option"
                aria-selected={language === lang}
              >
                <span>{lang.toUpperCase()}</span>
                {language === lang && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
