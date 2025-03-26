/**
 * User database operations for Zirak HR
 * 
 * This file contains functions for interacting with user-related tables
 * in the Supabase database.
 */

import supabase from '../supabase';
import { User, UserRole, UserSocialAccount } from './types';

/**
 * Create a new user in the database
 * @param userData User data to create
 * @returns The created user or null if an error occurred
 */
export async function createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & { id: string }): Promise<{ user: User | null, error: any }> {
  try {
    const newUser = {
      ...userData,
      id: userData.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating user with data:', JSON.stringify(newUser, null, 2));

    const { data, error } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return { user: null, error };
    }

    return { user: data, error: null };
  } catch (error) {
    console.error('Exception creating user:', error);
    return { user: null, error };
  }
}

/**
 * Find a user by email
 * @param email Email to search for
 * @returns The user or null if not found
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      console.error('Error finding user by email:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception finding user by email:', error);
    return null;
  }
}

/**
 * Find a user by ID
 * @param id User ID to search for
 * @returns The user or null if not found
 */
export async function findUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception finding user by ID:', error);
    return null;
  }
}

/**
 * Update a user's information
 * @param id User ID to update
 * @param userData User data to update
 * @returns The updated user or null if an error occurred
 */
export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception updating user:', error);
    return null;
  }
}

/**
 * Update a user's role
 * @param userId User ID to update
 * @param role New role to set
 * @returns The updated user or null if an error occurred
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        role, 
        needs_role_selection: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception updating user role:', error);
    return null;
  }
}

/**
 * Link a social account to a user
 * @param userId User ID to link to
 * @param socialAccount Social account data to link
 * @returns True if successful, false otherwise
 */
export async function linkSocialAccount(
  userId: string, 
  socialAccount: Omit<UserSocialAccount, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  try {
    // Check if this provider is already linked to this user
    const { data: existingAccount } = await supabase
      .from('user_social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', socialAccount.provider)
      .single();

    if (existingAccount) {
      // Update the existing account
      const { error } = await supabase
        .from('user_social_accounts')
        .update({
          provider_id: socialAccount.provider_id,
          provider_email: socialAccount.provider_email,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAccount.id);

      if (error) {
        console.error('Error updating social account:', error);
        return false;
      }
    } else {
      // Create a new account link
      const { error } = await supabase
        .from('user_social_accounts')
        .insert({
          user_id: userId,
          provider: socialAccount.provider,
          provider_id: socialAccount.provider_id,
          provider_email: socialAccount.provider_email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error linking social account:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Exception linking social account:', error);
    return false;
  }
}

/**
 * Get all social accounts linked to a user
 * @param userId User ID to get accounts for
 * @returns Array of social accounts or null if an error occurred
 */
export async function getUserSocialAccounts(userId: string): Promise<UserSocialAccount[] | null> {
  try {
    const { data, error } = await supabase
      .from('user_social_accounts')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user social accounts:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception getting user social accounts:', error);
    return null;
  }
}

/**
 * Find a user by social provider and provider ID
 * @param provider Social provider name
 * @param providerId Provider-specific ID
 * @returns The user or null if not found
 */
export async function findUserBySocialProvider(provider: string, providerId: string): Promise<User | null> {
  try {
    // First find the social account
    const { data: socialAccount, error: socialError } = await supabase
      .from('user_social_accounts')
      .select('user_id')
      .eq('provider', provider)
      .eq('provider_id', providerId)
      .single();

    if (socialError || !socialAccount) {
      return null;
    }

    // Then get the user
    return await findUserById(socialAccount.user_id);
  } catch (error) {
    console.error('Exception finding user by social provider:', error);
    return null;
  }
}

/**
 * Delete a user and all associated data
 * @param userId User ID to delete
 * @returns True if successful, false otherwise
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    // Delete the user - cascade will handle related records
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting user:', error);
    return false;
  }
}
