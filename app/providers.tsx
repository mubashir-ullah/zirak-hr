'use client'

import { ThemeProvider } from 'next-themes'
import { LanguageProvider } from './contexts/LanguageContext'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from './contexts/AuthContext'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="zirak-theme"
      forcedTheme={undefined}
    >
      <LanguageProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}