'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Session } from 'next-auth'
import { signIn, signOut } from 'next-auth/react'

// Conditionally import useSession to avoid build errors
let useSession: () => { data: Session | null; status: string; update: () => Promise<Session | null> }

try {
  // Dynamic import to avoid build errors
  if (typeof window !== 'undefined') {
    const nextAuth = require('next-auth/react')
    useSession = nextAuth.useSession
  } else {
    useSession = () => ({ data: null, status: 'loading', update: async () => null })
  }
} catch (error) {
  console.warn('next-auth not available:', error)
  useSession = () => ({ data: null, status: 'loading', update: async () => null })
}

interface AuthContextType {
  session: Session | null
  status: 'authenticated' | 'unauthenticated' | 'loading'
  login: (provider?: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: 'loading',
  login: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: sessionData, status: sessionStatus, update } = useSession()
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<'authenticated' | 'unauthenticated' | 'loading'>('loading')
  const router = useRouter()

  // Sync session state with next-auth
  useEffect(() => {
    setSession(sessionData)
    setStatus(sessionStatus as 'authenticated' | 'unauthenticated' | 'loading')
  }, [sessionData, sessionStatus])

  // Login function
  const login = async (provider?: string) => {
    try {
      if (provider) {
        await signIn(provider, { callbackUrl: '/dashboard' })
      } else {
        await signIn(undefined, { callbackUrl: '/dashboard' })
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  // Logout function with proper cleanup
  const logout = async () => {
    try {
      // First sign out with next-auth
      await signOut({ redirect: false })
      
      // Then call our custom logout endpoint to ensure all cookies are cleared
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      // Update local state
      setSession(null)
      setStatus('unauthenticated')
      
      // Force a router refresh to update UI
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Function to refresh session data
  const refreshSession = async () => {
    try {
      const updatedSession = await update()
      setSession(updatedSession)
      setStatus(updatedSession ? 'authenticated' : 'unauthenticated')
    } catch (error) {
      console.error('Session refresh error:', error)
    }
  }

  const value = {
    session,
    status,
    login,
    logout,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
