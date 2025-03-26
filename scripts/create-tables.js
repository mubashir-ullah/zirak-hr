// Script to create the required tables in the Supabase database
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Create Supabase client with service role key for admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  try {
    console.log('Creating tables in Supabase...');
    
    // Read the schema.sql file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = schemaSql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute the first few statements to create the basic tables
    const usersTableSql = `
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        role TEXT CHECK (role IN ('talent', 'hiring_manager', 'admin')),
        organization TEXT,
        position TEXT,
        social_provider TEXT,
        needs_role_selection BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        needs_profile_completion BOOLEAN DEFAULT TRUE,
        resume_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;
    
    const emailVerificationTableSql = `
      CREATE TABLE IF NOT EXISTS public.email_verification (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        hashed_otp TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;
    
    console.log('Creating users table...');
    const { error: usersError } = await supabase.rpc('exec_sql', { sql: usersTableSql }).single();
    
    if (usersError) {
      if (usersError.message.includes('function "exec_sql" does not exist')) {
        console.log('The exec_sql function does not exist. You may need to create it or use the Supabase dashboard to run SQL queries.');
        console.log('Please copy the following SQL and run it in the Supabase SQL editor:');
        console.log('\n' + usersTableSql + '\n');
        console.log('\n' + emailVerificationTableSql + '\n');
      } else {
        console.error('Error creating users table:', usersError);
      }
    } else {
      console.log('✅ Users table created successfully');
      
      console.log('Creating email_verification table...');
      const { error: verificationError } = await supabase.rpc('exec_sql', { sql: emailVerificationTableSql }).single();
      
      if (verificationError) {
        console.error('Error creating email_verification table:', verificationError);
      } else {
        console.log('✅ Email verification table created successfully');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTables();
