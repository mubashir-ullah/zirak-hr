/**
 * Supabase Admin Client
 * 
 * This file creates and exports a Supabase client with admin privileges (service role key)
 * ONLY to be used in server-side components for admin operations.
 * DO NOT USE THIS IN CLIENT COMPONENTS - it would expose the service role key.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

if (!supabaseServiceKey) {
  console.warn('Warning: Missing environment variable: SUPABASE_SERVICE_ROLE_KEY. Admin operations will fail.');
}

// Create a Supabase client with admin privileges
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Export the admin client
export default supabaseAdmin;
