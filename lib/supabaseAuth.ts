import supabase from './supabase';
import { findUserByEmail, createUser, updateUser, UserData } from './supabaseDb';
import bcrypt from 'bcryptjs';

// Authentication with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
  role: 'talent' | 'hiring_manager' | 'admin' = 'talent',
  needsRoleSelection: boolean = true
): Promise<{ user: UserData | null; error: string | null }> => {
  try {
    // First, create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Failed to create user' };
    }

    // Then, store additional user data in our users table
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = await createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      needs_role_selection: needsRoleSelection,
    });

    return { user: userData, error: null };
  } catch (error) {
    console.error('Error signing up with email:', error);
    return { user: null, error: 'An unexpected error occurred' };
  }
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ user: UserData | null; error: string | null }> => {
  try {
    // First, sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    // Then, get the user data from our users table
    const userData = await findUserByEmail(email.toLowerCase());
    if (!userData) {
      return { user: null, error: 'User not found' };
    }

    return { user: userData, error: null };
  } catch (error) {
    console.error('Error signing in with email:', error);
    return { user: null, error: 'An unexpected error occurred' };
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
      userData = await updateUser(userData.id!, {
        social_provider: supabaseUser.app_metadata.provider,
        updated_at: new Date().toISOString(),
      });
    } else {
      // Create new user in our database
      const randomPassword = Math.random().toString(36).slice(2, 10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      userData = await createUser({
        name: supabaseUser.user_metadata.full_name || email.split('@')[0],
        email,
        password: hashedPassword,
        role: 'talent', // Default role
        social_provider: supabaseUser.app_metadata.provider,
        needs_role_selection: true,
      });
    }

    return { user: userData, error: null };
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
