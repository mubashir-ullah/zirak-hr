'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations } from '../translations'

type Language = 'en' | 'de' | 'ur'
type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K
      : never
    }[keyof T]
  : never

type TranslationKey = NestedKeyOf<typeof translations['en']>

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const savedLang = localStorage.getItem('language')
    if (savedLang && ['en', 'de', 'ur'].includes(savedLang)) {
      setLanguage(savedLang as Language)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: TranslationKey): string => {
    const keys = key.split('.')
    let current: any = translations[language]
    
    for (const k of keys) {
      if (current?.[k] === undefined) {
        console.warn(`Translation missing for key: ${key} in language: ${language}`)
        return key
      }
      current = current[k]
    }
    
    return current
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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