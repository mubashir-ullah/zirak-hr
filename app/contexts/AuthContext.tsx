'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, AuthError, Session } from '@supabase/supabase-js'
import { findUserById, createUser } from '@/lib/supabaseDb'

interface AuthUser {
  // Original User properties
  id: string
  email?: string
  app_metadata: User['app_metadata']
  user_metadata: User['user_metadata']
  aud: User['aud']
  created_at: User['created_at']
  
  // Additional properties
  email_verified?: boolean
  role?: string | null
  needsRoleSelection?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  status: 'authenticated' | 'unauthenticated' | 'loading'
  login: (provider: 'google' | 'github' | 'linkedin' | 'apple') => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  isEmailVerified: () => boolean
  signOut: () => Promise<void>
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
    console.log('AuthContext: Initializing auth state')
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('AuthContext: Auth state changed', event)
      
      if (event === 'SIGNED_OUT') {
        console.log('AuthContext: User signed out, clearing state')
        setUser(null);
        setSession(null);
        setStatus('unauthenticated');
        return;
      }
      
      if (currentSession?.user) {
        console.log('AuthContext: Session exists, user ID:', currentSession.user.id)
        
        try {
          // Try to ensure the user is in our database
          const response = await fetch('/api/auth/get-user-role', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentSession.user.id,
              email: currentSession.user.email,
            }),
          });
          
          // Handle potential errors from API
          if (!response.ok && response.status !== 404) {
            console.error('AuthContext: Error from get-user-role API:', response.status);
            const errData = await response.json();
            console.error('Error details:', errData);
          }
          
          // Get user data directly from database as a backup
          const dbUser = await findUserById(currentSession.user.id);
          
          if (dbUser) {
            console.log('AuthContext: User found in database', {
              email: dbUser.email,
              role: dbUser.role,
              email_verified: dbUser.email_verified
            });
            
            // Merge Supabase user with our database user info
            const enhancedUser: AuthUser = {
              ...currentSession.user,
              email_verified: dbUser.email_verified || false,
              role: dbUser.role || currentSession.user.user_metadata?.role || null,
              needsRoleSelection: dbUser.needs_role_selection || !dbUser.role || false
            };
            
            // If there's a mismatch between Supabase and our DB, update Supabase metadata
            if (dbUser.role && dbUser.role !== currentSession.user.user_metadata?.role) {
              console.log('AuthContext: Role mismatch, updating Supabase metadata');
              await supabase.auth.updateUser({
                data: {
                  role: dbUser.role,
                  needs_role_selection: dbUser.needs_role_selection
                }
              });
            }
            
            setUser(enhancedUser);
            setSession(currentSession);
            setStatus('authenticated');
          } else {
            console.log('AuthContext: User not found in database, creating profile');
            
            // Create user in our database via API since findUserById didn't return results
            const createResponse = await fetch('/api/auth/create-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: currentSession.user.id,
                email: currentSession.user.email,
                name: currentSession.user.user_metadata?.name || currentSession.user.email?.split('@')[0] || 'User',
                role: currentSession.user.user_metadata?.role,
                needs_role_selection: !currentSession.user.user_metadata?.role || true,
              }),
            });
            
            if (!createResponse.ok) {
              console.error('AuthContext: Failed to create user:', await createResponse.text());
              // Still set user with just Supabase data as fallback
              const basicUser: AuthUser = {
                ...currentSession.user,
                email_verified: currentSession.user.email_confirmed_at ? true : false,
                role: currentSession.user.user_metadata?.role || null,
                needsRoleSelection: true
              };
              
              setUser(basicUser);
              setSession(currentSession);
              setStatus('authenticated');
            } else {
              // User created successfully
              const userData = await createResponse.json();
              console.log('AuthContext: User created:', userData);
              
              const enhancedUser: AuthUser = {
                ...currentSession.user,
                email_verified: true,
                role: userData.user?.role || currentSession.user.user_metadata?.role || null,
                needsRoleSelection: userData.user?.needs_role_selection || !userData.user?.role || true
              };
              
              setUser(enhancedUser);
              setSession(currentSession);
              setStatus('authenticated');
            }
          }
        } catch (error) {
          console.error('AuthContext: Error processing auth state change:', error);
          // Fallback to just using Supabase user data
          const basicUser: AuthUser = {
            ...currentSession.user,
            email_verified: currentSession.user.email_confirmed_at ? true : false,
            role: currentSession.user.user_metadata?.role || null,
            needsRoleSelection: currentSession.user.user_metadata?.needs_role_selection !== false
          };
          
          setUser(basicUser);
          setSession(currentSession);
          setStatus('authenticated');
        }
      } else {
        console.log('AuthContext: No session, setting unauthenticated')
        setUser(null);
        setSession(null);
        setStatus('unauthenticated');
      }
    })

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      try {
        if (currentSession?.user) {
          console.log('AuthContext: Initial session check - user found', currentSession.user.id);
          const dbUser = await findUserById(currentSession.user.id);
          
          if (dbUser) {
            console.log('AuthContext: User found in database', {
              email: dbUser.email,
              role: dbUser.role,
              email_verified: dbUser.email_verified
            })
            
            // Merge Supabase user with our database user info
            const enhancedUser: AuthUser = {
              ...currentSession.user,
              email_verified: dbUser.email_verified || false,
              role: dbUser.role || currentSession.user.user_metadata?.role || null,
              needsRoleSelection: dbUser.needs_role_selection || !dbUser.role || false
            };
            
            setUser(enhancedUser);
            setSession(currentSession);
            setStatus('authenticated');
          } else {
            console.warn('AuthContext: User found in session but not in database:', currentSession.user.id);
            // Create the user in the database if they don't exist
            const { user: newUser, error } = await createUser({
              id: currentSession.user.id,
              name: currentSession.user.user_metadata?.full_name || '',
              email: currentSession.user.email || '',
              role: currentSession.user.user_metadata?.role || 'talent',
              needs_role_selection: !currentSession.user.user_metadata?.role || true,
              email_verified: currentSession.user.email_confirmed_at ? true : false,
              social_provider: currentSession.user.app_metadata?.provider || undefined
            });
            
            if (newUser) {
              console.log('AuthContext: Created new user in database', {
                email: newUser.email,
                role: newUser.role
              })
              
              // Merge Supabase user with our new database user
              const enhancedUser: AuthUser = {
                ...currentSession.user,
                email_verified: newUser.email_verified || false,
                role: newUser.role || currentSession.user.user_metadata?.role || null,
                needsRoleSelection: newUser.needs_role_selection || !newUser.role || false
              };
              
              setUser(enhancedUser);
              setSession(currentSession);
              setStatus('authenticated');
            } else {
              console.error('AuthContext: Failed to create user in database:', error);
              setUser(null);
              setSession(null);
              setStatus('unauthenticated');
            }
          }
        } else {
          console.log('AuthContext: No session in initial check')
          setUser(null);
          setSession(null);
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('AuthContext: Error in auth session initialization:', error);
        setUser(null);
        setSession(null);
        setStatus('unauthenticated');
      }
    }).catch(error => {
      console.error('AuthContext: Error getting session:', error);
      setUser(null);
      setSession(null);
      setStatus('unauthenticated');
    });

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
      // Clear any local state first
      setUser(null);
      setSession(null);
      setStatus('unauthenticated');
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error during sign out:', error);
        throw error;
      }
      
      // Force navigation to home page
      router.push('/');
      router.refresh(); // Force a refresh to update the UI
    } catch (error) {
      console.error('Error logging out:', error)
      // Even if there's an error, we should still try to redirect
      router.push('/')
    }
  }

  // Alias for logout to maintain backward compatibility
  const signOut = logout;

  const refreshSession = async () => {
    try {
      console.log('AuthContext: Refreshing session...')
      const { data: { session: currentSession }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('AuthContext: Error refreshing session:', error)
        throw error
      }
      
      if (currentSession?.user) {
        console.log('AuthContext: Session refreshed, user ID:', currentSession.user.id)
        
        try {
          // First check if the user exists in our database
          const dbUser = await findUserById(currentSession.user.id);
          
          if (dbUser) {
            console.log('AuthContext: User found in database after refresh', {
              email: dbUser.email,
              role: dbUser.role,
              email_verified: dbUser.email_verified,
              needs_role_selection: dbUser.needs_role_selection
            })
            
            // Ensure Supabase user metadata is in sync with our database
            let needsMetadataUpdate = false;
            const metadataUpdateData: Record<string, any> = {};
            
            // Check if role needs updating
            if (dbUser.role && dbUser.role !== currentSession.user.user_metadata?.role) {
              console.log('AuthContext: Role mismatch, will update Supabase metadata');
              metadataUpdateData.role = dbUser.role;
              needsMetadataUpdate = true;
            }
            
            // Check if needs_role_selection needs updating
            if (dbUser.needs_role_selection !== currentSession.user.user_metadata?.needs_role_selection) {
              console.log('AuthContext: needs_role_selection mismatch, will update Supabase metadata');
              metadataUpdateData.needs_role_selection = dbUser.needs_role_selection;
              needsMetadataUpdate = true;
            }
            
            // Update Supabase metadata if needed
            if (needsMetadataUpdate) {
              try {
                console.log('AuthContext: Updating Supabase user metadata with data:', metadataUpdateData);
                await supabase.auth.updateUser({ data: metadataUpdateData });
                console.log('AuthContext: Supabase metadata updated successfully');
              } catch (updateError) {
                console.error('AuthContext: Error updating user metadata:', updateError);
                // Continue anyway, we have the correct data in our database
              }
            }
            
            // Merge Supabase user with our database user info (database info takes precedence)
            const enhancedUser: AuthUser = {
              ...currentSession.user,
              email_verified: dbUser.email_verified || false,
              role: dbUser.role || currentSession.user.user_metadata?.role || null,
              needsRoleSelection: dbUser.needs_role_selection || !dbUser.role || false
            };
            
            setUser(enhancedUser);
            setSession(currentSession);
            setStatus('authenticated');
            return;
          } else {
            console.log('AuthContext: User not found in database after refresh, creating user record');
            
            // User exists in Supabase but not in our database - create them
            try {
              const response = await fetch('/api/auth/create-user', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: currentSession.user.id,
                  email: currentSession.user.email,
                  name: currentSession.user.user_metadata?.name || currentSession.user.email?.split('@')[0] || 'User',
                  role: currentSession.user.user_metadata?.role || 'talent',
                  needs_role_selection: !currentSession.user.user_metadata?.role || true,
                }),
              });
              
              if (!response.ok) {
                console.error('AuthContext: Failed to create user record:', await response.text());
                
                // Create a basic user object from just Supabase data as fallback
                const basicUser: AuthUser = {
                  ...currentSession.user,
                  email_verified: currentSession.user.email_confirmed_at ? true : false,
                  role: currentSession.user.user_metadata?.role || null,
                  needsRoleSelection: !currentSession.user.user_metadata?.role || true
                };
                
                setUser(basicUser);
                setSession(currentSession);
                setStatus('authenticated');
                return;
              }
              
              const userData = await response.json();
              console.log('AuthContext: User record created:', userData.user);
              
              const enhancedUser: AuthUser = {
                ...currentSession.user,
                email_verified: true,
                role: userData.user?.role || currentSession.user.user_metadata?.role || null,
                needsRoleSelection: userData.user?.needs_role_selection || !userData.user?.role || true
              };
              
              setUser(enhancedUser);
              setSession(currentSession);
              setStatus('authenticated');
              return;
            } catch (createError) {
              console.error('AuthContext: Error creating user record:', createError);
              
              // Fallback to just Supabase user data
              const basicUser: AuthUser = {
                ...currentSession.user,
                email_verified: currentSession.user.email_confirmed_at ? true : false,
                role: currentSession.user.user_metadata?.role || null,
                needsRoleSelection: true
              };
              
              setUser(basicUser);
              setSession(currentSession);
              setStatus('authenticated');
              return;
            }
          }
        } catch (error) {
          console.error('AuthContext: Error in refreshSession:', error);
          
          // Fallback to just Supabase user data
          const basicUser: AuthUser = {
            ...currentSession.user,
            email_verified: currentSession.user.email_confirmed_at ? true : false,
            role: currentSession.user.user_metadata?.role || null,
            needsRoleSelection: true
          };
          
          setUser(basicUser);
          setSession(currentSession);
          setStatus('authenticated');
          return;
        }
      }
      
      // If we reach here, there's no session
      console.log('AuthContext: No session after refresh, setting unauthenticated');
      setUser(null);
      setSession(null);
      setStatus('unauthenticated');
    } catch (err) {
      console.error('AuthContext: Error in refreshSession:', err);
      setUser(null);
      setSession(null);
      setStatus('unauthenticated');
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
