'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, AuthError, Session } from '@supabase/supabase-js'
import { findUserById } from '@/lib/supabaseDb'

interface AuthUser {
  id: string;
  email?: string;
  email_verified?: boolean;
  role?: string | null;
  app_metadata: User['app_metadata'];
  user_metadata: User['user_metadata'];
  aud: User['aud'];
  created_at: User['created_at'];
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  status: 'authenticated' | 'unauthenticated' | 'loading'
  login: (provider: 'google' | 'github' | 'linkedin' | 'apple') => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  isEmailVerified: () => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  status: 'loading',
  login: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
  isEmailVerified: () => false,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<'authenticated' | 'unauthenticated' | 'loading'>('loading')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession?.user) {
        const dbUser = await findUserById(currentSession.user.id);
        setUser({
          ...currentSession.user,
          email_verified: dbUser?.email_verified || false,
          role: dbUser?.role || null
        } as AuthUser);
        setSession(currentSession);
        setStatus('authenticated');
      } else {
        setUser(null);
        setSession(null);
        setStatus('unauthenticated');
      }
    })

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (currentSession?.user) {
        const dbUser = await findUserById(currentSession.user.id);
        setUser({
          ...currentSession.user,
          email_verified: dbUser?.email_verified || false,
          role: dbUser?.role || null
        } as AuthUser);
        setSession(currentSession);
        setStatus('authenticated');
      } else {
        setUser(null);
        setSession(null);
        setStatus('unauthenticated');
      }
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

  // Alias for logout to maintain backward compatibility
  const signOut = logout;

  const refreshSession = async () => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.refreshSession()
      if (error) throw error
      
      if (currentSession?.user) {
        const dbUser = await findUserById(currentSession.user.id);
        setUser({
          ...currentSession.user,
          email_verified: dbUser?.email_verified || false,
          role: dbUser?.role || null
        } as AuthUser);
      } else {
        setUser(null);
      }
      
      setSession(currentSession)
      setStatus(currentSession?.user ? 'authenticated' : 'unauthenticated')
    } catch (error) {
      console.error('Error refreshing session:', error)
      throw error
    }
  }

  const isEmailVerified = () => {
    return user?.email_verified || false;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      status, 
      login, 
      logout, 
      refreshSession,
      isEmailVerified,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}
