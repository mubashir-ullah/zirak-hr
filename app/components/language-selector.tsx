'use client'

import { useLanguage } from '../contexts/LanguageContext'
import { FlagIcon } from './ui/flag-icon'
import { cn } from '../lib/utils'

type Language = 'en' | 'de' | 'ur'

const languages = [
  { code: 'en' as const, name: 'English' },
  { code: 'de' as const, name: 'German' },
  { code: 'ur' as const, name: 'Urdu' },
] as const

interface LanguageSelectorProps {
  mobile?: boolean
}

export function LanguageSelector({ mobile = false }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="relative inline-block">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className={cn(
          "appearance-none cursor-pointer",
          mobile 
            ? "bg-transparent text-base font-medium text-black dark:text-white px-2 py-1"
            : "bg-transparent border-2 border-black dark:border-[#D6FF00] rounded-full pl-9 pr-8 py-1 text-sm font-medium text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D6FF00] focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        )}
      >
        {languages.map(({ code, name }) => (
          <option key={code} value={code}>
            {mobile ? code.toUpperCase() : name}
          </option>
        ))}
      </select>
      
      {!mobile && (
        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
          <FlagIcon code={language} size={16} />
        </div>
      )}
      
      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
        <svg 
          className="w-4 h-4 text-black dark:text-white"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </div>
    </div>
  )
}