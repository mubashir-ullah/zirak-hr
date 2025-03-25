'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Define available languages
type Language = 'en' | 'de'

// Simple translation function
const translations: Record<Language, Record<string, string>> = {
  en: {
    'Account Settings': 'Account Settings',
    'Profile Information': 'Profile Information',
    'Name': 'Name',
    'Email': 'Email',
    'Role': 'Role',
    'Linked Accounts': 'Linked Accounts',
    'Link your account with these services to enable social login.': 'Link your account with these services to enable social login.',
    'Google': 'Google',
    'GitHub': 'GitHub',
    'LinkedIn': 'LinkedIn',
    'Apple': 'Apple',
    'Linked': 'Linked',
    'Linking...': 'Linking...',
    'Link': 'Link',
    'Linking accounts allows you to sign in using any of these providers.': 'Linking accounts allows you to sign in using any of these providers.'
  },
  de: {
    'Account Settings': 'Kontoeinstellungen',
    'Profile Information': 'Profilinformationen',
    'Name': 'Name',
    'Email': 'E-Mail',
    'Role': 'Rolle',
    'Linked Accounts': 'Verknüpfte Konten',
    'Link your account with these services to enable social login.': 'Verknüpfen Sie Ihr Konto mit diesen Diensten, um die soziale Anmeldung zu ermöglichen.',
    'Google': 'Google',
    'GitHub': 'GitHub',
    'LinkedIn': 'LinkedIn',
    'Apple': 'Apple',
    'Linked': 'Verknüpft',
    'Linking...': 'Verknüpfe...',
    'Link': 'Verknüpfen',
    'Linking accounts allows you to sign in using any of these providers.': 'Durch die Verknüpfung von Konten können Sie sich mit jedem dieser Anbieter anmelden.'
  }
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    // Try to get language preference from localStorage
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'de')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
