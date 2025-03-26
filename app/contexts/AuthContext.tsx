'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, AuthError, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  status: 'authenticated' | 'unauthenticated' | 'loading'
  login: (provider: 'google' | 'github' | 'linkedin' | 'apple') => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  status: 'loading',
  login: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<'authenticated' | 'unauthenticated' | 'loading'>('loading')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setUser(currentSession?.user ?? null)
      setSession(currentSession)
      setStatus(currentSession?.user ? 'authenticated' : 'unauthenticated')
    })

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setUser(currentSession?.user ?? null)
      setSession(currentSession)
      setStatus(currentSession?.user ? 'authenticated' : 'unauthenticated')
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const login = async (provider: 'google' | 'github' | 'linkedin' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error logging in:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
      throw error
    }
  }

  const refreshSession = async () => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.refreshSession()
      if (error) throw error
      setUser(currentSession?.user ?? null)
      setSession(currentSession)
      setStatus(currentSession?.user ? 'authenticated' : 'unauthenticated')
    } catch (error) {
      console.error('Error refreshing session:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, status, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}
