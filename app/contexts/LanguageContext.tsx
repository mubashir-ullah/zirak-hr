'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { translations } from '../translations'

export type Language = 'en' | 'de' | 'ur'
type TranslationsType = typeof translations

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  availableLanguages: Language[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const availableLanguages: Language[] = ['en', 'de', 'ur']

  const t = (path: string) => {
    const keys = path.split('.')
    let current: any = translations[language]
    
    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Translation missing for key: ${path} in language: ${language}`)
        return path
      }
      current = current[key]
    }
    
    return current
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}