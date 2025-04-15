import supabase from './supabase';
import { findUserByEmail, createUser, updateUser, UserData } from './supabaseDb';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

// Authentication with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
  role: 'talent' | 'hiring_manager' | 'admin' = 'talent',
  needsRoleSelection: boolean = true
): Promise<{ user: UserData | null; error: string | null }> => {
  try {
    // First, create the user in Supabase Auth with auto-confirmation
    // This prevents Supabase from sending confirmation emails
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Set emailRedirectTo to an empty string to prevent confirmation emails
        emailRedirectTo: '',
        // Set this to true to auto-confirm the user
        data: {
          name,
          role,
          needs_role_selection: needsRoleSelection,
          email_confirmed: true
        }
      }
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Failed to create user' };
    }

    // Use admin API to immediately confirm the user's email
    try {
      // Get the admin client
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
      
      // Update the user to confirm their email
      await supabaseAdmin.auth.admin.updateUserById(
        authData.user.id,
        { email_confirm: true }
      );
      
      console.log('User email auto-confirmed via admin API');
    } catch (confirmError) {
      console.error('Error auto-confirming email via admin API:', confirmError);
      // Continue with registration even if auto-confirmation fails
    }

    // Then, store additional user data in our users table
    const hashedPassword = await bcrypt.hash(password, 10);
    const { user: newUser, error: dbError } = await createUser({
      id: authData.user.id,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      needs_role_selection: needsRoleSelection,
    });

    if (dbError || !newUser) {
      console.error('Error creating user in database:', dbError);
      return { user: null, error: 'Failed to create user record' };
    }

    return { user: newUser, error: null };
  } catch (error) {
    console.error('Error signing up with email:', error);
    return { user: null, error: 'An unexpected error occurred' };
  }
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ user: UserData | null; error: string | null; session: any }> => {
  try {
    // First, sign in with Supabase Auth
    console.log('Attempting to sign in with email:', email);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Auth error during sign in:', authError.message);
      return { user: null, error: authError.message, session: null };
    }

    if (!authData?.user) {
      console.error('No user data returned from auth');
      return { user: null, error: 'Authentication failed', session: null };
    }

    console.log('Auth successful. User ID:', authData.user.id);

    // Then, get the user data from our users table
    const userData = await findUserByEmail(email.toLowerCase());
    
    // If user exists in Supabase but not in our database, create them
    if (!userData) {
      console.log('User not found in database, creating user record');
      try {
        const { user: newUser, error: createError } = await createUser({
          id: authData.user.id,
          name: authData.user.user_metadata?.name || email.split('@')[0],
          email: email.toLowerCase(),
          role: authData.user.user_metadata?.role || 'talent',
          needs_role_selection: !authData.user.user_metadata?.role || true,
          email_verified: true // Auto-verify for simplicity
        });
        
        if (createError || !newUser) {
          console.error('Error creating user in database:', createError);
          return { user: null, error: 'Failed to create user profile', session: null };
        }
        
        // Also update Supabase user metadata to match our database
        try {
          await supabase.auth.updateUser({
            data: {
              role: newUser.role,
              needs_role_selection: newUser.needs_role_selection
            }
          });
        } catch (updateError) {
          console.error('Error updating user metadata:', updateError);
          // Continue anyway since we've created the user in our database
        }
        
        console.log('User created in database:', newUser);
        return { user: newUser, error: null, session: authData.session };
      } catch (createError) {
        console.error('Exception creating user:', createError);
        return { user: null, error: 'An error occurred while creating user profile', session: null };
      }
    }

    // Check if we need to sync Supabase metadata with our database
    if (userData.role && userData.role !== authData.user.user_metadata?.role) {
      console.log('Syncing user metadata with our database...');
      try {
        await supabase.auth.updateUser({
          data: {
            role: userData.role,
            needs_role_selection: userData.needs_role_selection
          }
        });
      } catch (updateError) {
        console.error('Error updating user metadata:', updateError);
        // Continue anyway since we have the correct data in our database
      }
    }

    console.log('User found in database:', userData);
    return { user: userData, error: null, session: authData.session };
  } catch (error) {
    console.error('Unexpected error signing in with email:', error);
    return { user: null, error: 'An unexpected error occurred', session: null };
  }
};

// Social authentication
export const signInWithSocial = async (
  provider: 'google' | 'github' | 'linkedin' | 'apple'
): Promise<{ url: string | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      return { url: null, error: error.message };
    }

    return { url: data.url, error: null };
  } catch (error) {
    console.error(`Error signing in with ${provider}:`, error);
    return { url: null, error: 'An unexpected error occurred' };
  }
};

// Handle social auth callback and create/update user in our database
export const handleAuthCallback = async (): Promise<{ user: UserData | null; error: string | null }> => {
  try {
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData.session || !authData.session.user) {
      return { user: null, error: 'No authenticated user found' };
    }
    
    const supabaseUser = authData.session.user;
    const email = supabaseUser.email?.toLowerCase();
    
    if (!email) {
      return { user: null, error: 'No email found for user' };
    }

    // Check if user exists in our database
    let userData = await findUserByEmail(email);
    
    if (userData) {
      // Update existing user with latest info
      const updatedUser = await updateUser(userData.id!, {
        social_provider: supabaseUser.app_metadata.provider,
        updated_at: new Date().toISOString(),
      });
      
      if (!updatedUser) {
        return { user: null, error: 'Failed to update user' };
      }
      
      return { user: updatedUser, error: null };
    } else {
      // Create new user in our database
      const randomPassword = Math.random().toString(36).slice(2, 10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      const { user: newUser, error: createError } = await createUser({
        id: supabaseUser.id,
        name: supabaseUser.user_metadata.full_name || email.split('@')[0],
        email,
        password: hashedPassword,
        role: 'talent', // Default role
        social_provider: supabaseUser.app_metadata.provider,
        needs_role_selection: true,
      });
      
      if (createError || !newUser) {
        return { user: null, error: 'Failed to create user record' };
      }
      
      return { user: newUser, error: null };
    }
  } catch (error) {
    console.error('Error handling auth callback:', error);
    return { user: null, error: 'An unexpected error occurred' };
  }
};

// Sign out
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error: 'An unexpected error occurred' };
  }
};

// Get current user
export const getCurrentUser = async (): Promise<{ user: UserData | null; error: string | null }> => {
  try {
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData.session || !authData.session.user) {
      return { user: null, error: null }; // Not an error, just no user is logged in
    }
    
    const supabaseUser = authData.session.user;
    const email = supabaseUser.email?.toLowerCase();
    
    if (!email) {
      return { user: null, error: 'No email found for user' };
    }

    const userData = await findUserByEmail(email);
    
    if (!userData) {
      // Create user in our database if they exist in Supabase but not in our DB
      console.log('User exists in Supabase but not in database, creating user record');
      const { user: newUser, error: createError } = await createUser({
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || email.split('@')[0],
        email: email,
        role: supabaseUser.user_metadata?.role || 'talent',
        needs_role_selection: !supabaseUser.user_metadata?.role || true,
        email_verified: true
      });
      
      if (createError || !newUser) {
        console.error('Error creating user in database:', createError);
        return { user: null, error: 'Failed to create user profile' };
      }
      
      return { user: newUser, error: null };
    }
    
    // Sync Supabase metadata with our database if needed
    if (userData.role && userData.role !== supabaseUser.user_metadata?.role) {
      try {
        await supabase.auth.updateUser({
          data: {
            role: userData.role,
            needs_role_selection: userData.needs_role_selection
          }
        });
      } catch (updateError) {
        console.error('Error updating user metadata:', updateError);
        // Continue anyway
      }
    }
    
    return { user: userData, error: null };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null, error: 'An unexpected error occurred' };
  }
};

// Set user role
export const setUserRole = async (
  userId: string,
  role: 'talent' | 'hiring_manager' | 'admin'
): Promise<{ user: UserData | null; error: string | null }> => {
  try {
    const updatedUser = await updateUser(userId, { 
      role, 
      needs_role_selection: false 
    });
    
    if (!updatedUser) {
      return { user: null, error: 'Failed to update user role' };
    }
    
    // Also update Supabase user metadata
    try {
      await supabase.auth.updateUser({
        data: { 
          role: role,
          needs_role_selection: false 
        }
      });
    } catch (updateError) {
      console.error('Error updating user metadata:', updateError);
      // Continue anyway since we've updated our database
    }
    
    return { user: updatedUser, error: null };
  } catch (error) {
    console.error('Error setting user role:', error);
    return { user: null, error: 'An unexpected error occurred' };
  }
};

// Link a social provider to an existing account
export const linkSocialProvider = async (
  provider: 'google' | 'github' | 'linkedin' | 'apple'
): Promise<{ url: string | null; error: string | null }> => {
  try {
    // Get the current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      return { url: null, error: 'You must be logged in to link accounts' };
    }
    
    // Generate the OAuth URL with the current user's session
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/link-callback`,
        scopes: 'email profile',
      },
    });

    if (error) {
      return { url: null, error: error.message };
    }

    return { url: data.url, error: null };
  } catch (error) {
    console.error(`Error linking ${provider}:`, error);
    return { url: null, error: 'An unexpected error occurred' };
  }
};

// Handle account linking callback
export const handleLinkCallback = async (): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Get the current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      return { success: false, error: 'Authentication session not found' };
    }
    
    const user = sessionData.session.user;
    
    // Get the user's identities (linked accounts)
    const { data } = await supabase.auth.admin.getUserById(user.id);
    
    if (!data || !data.user || !data.user.identities || data.user.identities.length === 0) {
      return { success: false, error: 'No identities found for user' };
    }
    
    // Get the user from our database
    const dbUser = await findUserByEmail(user.email!.toLowerCase());
    
    if (!dbUser) {
      return { success: false, error: 'User not found in database' };
    }
    
    // Extract the provider names from identities
    const linkedProviders = data.user.identities.map((identity: { provider: string }) => identity.provider);
    
    // Update the user's linked accounts in our database
    const updatedUser = await updateUser(dbUser.id!, {
      linked_accounts: linkedProviders
    });
    
    if (!updatedUser) {
      return { success: false, error: 'Failed to update user' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error handling link callback:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
