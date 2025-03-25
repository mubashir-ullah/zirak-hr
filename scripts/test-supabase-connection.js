/**
 * Test Supabase Connection
 * 
 * This script tests the connection to Supabase using the environment variables.
 * 
 * Usage:
 * node scripts/test-supabase-connection.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Error: Supabase environment variables are not properly set.');
  console.error('Please check your .env.local file and ensure all Supabase variables are defined.');
  process.exit(1);
}

console.log('Supabase environment variables found:');
console.log(`- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
console.log(`- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 10)}...`);
console.log(`- SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey.substring(0, 10)}...`);

// Initialize Supabase client with anon key (public)
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Supabase client with service role key (admin)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('\nTesting Supabase connection...');
  
  try {
    // Test public client connection
    const { data: publicData, error: publicError } = await supabasePublic.from('users').select('count').limit(1);
    
    if (publicError) {
      console.error('Error connecting to Supabase with public client:', publicError.message);
    } else {
      console.log('✅ Successfully connected to Supabase with public client');
    }
    
    // Test admin client connection
    const { data: adminData, error: adminError } = await supabaseAdmin.from('users').select('count').limit(1);
    
    if (adminError) {
      console.error('Error connecting to Supabase with admin client:', adminError.message);
    } else {
      console.log('✅ Successfully connected to Supabase with admin client');
    }
    
    // Test authentication
    console.log('\nTesting Supabase Auth...');
    const { data: authData, error: authError } = await supabasePublic.auth.getSession();
    
    if (authError) {
      console.error('Error accessing Supabase Auth:', authError.message);
    } else {
      console.log('✅ Successfully connected to Supabase Auth');
    }
    
    // Test storage
    console.log('\nTesting Supabase Storage...');
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error accessing Supabase Storage:', bucketsError.message);
    } else {
      console.log('✅ Successfully connected to Supabase Storage');
      console.log(`Found ${buckets.length} storage buckets`);
    }
    
    console.log('\nConnection test completed.');
  } catch (error) {
    console.error('Unexpected error during connection test:', error.message);
  }
}

testConnection();
