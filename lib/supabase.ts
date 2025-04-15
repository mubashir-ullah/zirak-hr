import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Invalid/Missing environment variable: "NEXT_PUBLIC_SUPABASE_URL"');
}

if (!supabaseAnonKey) {
  throw new Error('Invalid/Missing environment variable: "NEXT_PUBLIC_SUPABASE_ANON_KEY"');
}

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
});

console.log('Supabase client initialized with URL:', supabaseUrl.substring(0, 20) + '...');

export default supabase;
