'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'ur'
type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    nav: {
      home: 'Home',
      features: 'Features',
      about: 'About',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      dashboard: 'Dashboard'
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      organization: 'Organization',
      position: 'Position',
      enterEmail: 'Enter your email',
      enterPassword: 'Enter your password',
      enterFullName: 'Enter your full name',
      enterOrganization: 'Enter your organization',
      enterPosition: 'Enter your position',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      loggingIn: 'Logging in...',
      registering: 'Registering...',
      orContinueWith: 'Or continue with',
      noAccount: "Don't have an account?",
      registerMinute: "It will take less than a minute",
      alreadyHaveAccount: 'Already have an account?',
      loginDescription: 'Sign in to your account',
      registerDescription: 'Create a new account'
    }
  },
  ur: {
    nav: {
      home: 'ہوم',
      features: 'خصوصیات',
      about: 'ہمارے بارے میں',
      login: 'لاگ ان',
      register: 'رجسٹر',
      logout: 'لاگ آؤٹ',
      dashboard: 'ڈیش بورڈ'
    },
    auth: {
      login: 'لاگ ان',
      register: 'رجسٹر',
      logout: 'لاگ آؤٹ',
      email: 'ای میل',
      password: 'پاس ورڈ',
      confirmPassword: 'پاس ورڈ کی تصدیق کریں',
      fullName: 'پورا نام',
      organization: 'تنظیم',
      position: 'عہدہ',
      enterEmail: 'ای میل درج کریں',
      enterPassword: 'پاس ورڈ درج کریں',
      enterFullName: 'پورا نام درج کریں',
      enterOrganization: 'تنظیم درج کریں',
      enterPosition: 'عہدہ درج کریں',
      rememberMe: 'مجھے یاد رکھیں',
      forgotPassword: 'پاس ورڈ بھول گئے؟',
      loggingIn: 'لاگ ان ہو رہا ہے...',
      registering: 'رجسٹر ہو رہا ہے...',
      orContinueWith: 'یا جاری رکھیں',
      noAccount: 'اکاؤنٹ نہیں ہے؟',
      registerMinute: "یہ ایک منٹ سے بھی کم وقت لے گا",
      alreadyHaveAccount: 'پہلے سے اکاؤنٹ ہے؟',
      loginDescription: 'اپنے اکاؤنٹ میں لاگ ان کریں',
      registerDescription: 'نیا اکاؤنٹ بنائیں'
    }
  }
}

export type TranslationKeys = keyof typeof translations.en.nav | keyof typeof translations.en.auth

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k as keyof typeof value]
      } else {
        return key
      }
    }
    
    return value || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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