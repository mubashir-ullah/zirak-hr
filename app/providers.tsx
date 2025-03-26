'use client'

import { ThemeProvider } from 'next-themes'
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
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}