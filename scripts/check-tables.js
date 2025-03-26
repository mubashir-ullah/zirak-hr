// Script to check if the required tables exist in the Supabase database
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  try {
    console.log('Checking Supabase tables...');
    
    // Check users table
    console.log('Checking users table...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError) {
      console.error('Error querying users table:', usersError);
    } else {
      console.log('✅ Users table exists and is accessible');
    }
    
    // Check email_verification table
    console.log('\nChecking email_verification table...');
    const { data: verificationData, error: verificationError } = await supabase
      .from('email_verification')
      .select('id')
      .limit(1);
    
    if (verificationError) {
      console.error('Error querying email_verification table:', verificationError);
    } else {
      console.log('✅ Email verification table exists and is accessible');
    }
    
    // Print Supabase connection info
    console.log('\nSupabase connection info:');
    console.log('URL:', supabaseUrl);
    console.log('Anon Key:', supabaseAnonKey.substring(0, 5) + '...' + supabaseAnonKey.substring(supabaseAnonKey.length - 5));
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTables();
