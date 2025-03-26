// Script to check and create the email_verification table if it doesn't exist
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
  process.exit(1);
}

// Create Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateTable() {
  console.log('Checking for email_verification table...');
  
  try {
    // Check if the table exists
    const { data, error } = await supabase
      .from('email_verification')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      // Table doesn't exist (PostgreSQL error code for undefined_table)
      console.log('email_verification table does not exist. Creating it now...');
      
      // Create the table using SQL
      const { error: createError } = await supabase.rpc('create_email_verification_table');
      
      if (createError) {
        console.error('Error creating table:', createError);
        
        // Try direct SQL approach as fallback
        console.log('Trying direct SQL approach...');
        const { error: sqlError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.email_verification (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              email TEXT UNIQUE NOT NULL,
              hashed_otp TEXT NOT NULL,
              expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
              verified BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
            
            ALTER TABLE public.email_verification ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Allow public access for email verification" ON public.email_verification
              FOR ALL USING (true);
          `
        });
        
        if (sqlError) {
          console.error('Error with direct SQL approach:', sqlError);
          return false;
        } else {
          console.log('Table created successfully with direct SQL!');
          return true;
        }
      } else {
        console.log('Table created successfully!');
        return true;
      }
    } else if (error) {
      // Some other error occurred
      console.error('Error checking table:', error);
      return false;
    } else {
      // Table exists
      console.log('email_verification table already exists!');
      return true;
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
}

// Create the stored procedure first
async function createStoredProcedures() {
  console.log('Creating stored procedures...');
  
  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION create_email_verification_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS public.email_verification (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email TEXT UNIQUE NOT NULL,
            hashed_otp TEXT NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          ALTER TABLE public.email_verification ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Allow public access for email verification" ON public.email_verification
            FOR ALL USING (true);
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
        RETURNS void AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (error) {
      console.error('Error creating stored procedures:', error);
      return false;
    }
    
    console.log('Stored procedures created successfully!');
    return true;
  } catch (err) {
    console.error('Unexpected error creating stored procedures:', err);
    return false;
  }
}

async function main() {
  // First create the stored procedures
  const proceduresCreated = await createStoredProcedures();
  
  if (!proceduresCreated) {
    console.error('Failed to create stored procedures. Exiting...');
    process.exit(1);
  }
  
  // Then check and create the table
  const tableCreated = await checkAndCreateTable();
  
  if (tableCreated) {
    console.log('Database setup completed successfully!');
  } else {
    console.error('Database setup failed!');
    process.exit(1);
  }
}

main();
