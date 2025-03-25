/**
 * Simple Supabase Connection Test
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Checking Supabase environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Found' : '✗ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Found' : '✗ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Some Supabase environment variables are missing.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\nTesting Supabase connection...');
    
    // Simple health check
    const { data, error } = await supabase.from('users').select('count');
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      if (error.message.includes('relation "users" does not exist')) {
        console.log('\nThe "users" table might not exist yet. This is normal if you haven\'t created it.');
        console.log('Connection to Supabase appears to be working, but schema setup is needed.');
      }
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('Data:', data);
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

testConnection();
