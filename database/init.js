/**
 * Database initialization script for Zirak HR
 * 
 * This script initializes the Supabase database with the schema defined in the migration files.
 * It can be run with Node.js to set up a fresh database or update an existing one.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

// Create Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Migration files in order of execution
const migrationFiles = [
  '01_core_schema.sql',
  '02_talent_profiles.sql',
  '03_hiring_manager_profiles.sql',
  '04_jobs.sql',
  '05_applications.sql',
  '06_skill_assessments.sql',
  '07_analytics_notifications.sql',
];

/**
 * Execute a SQL migration file
 * @param {string} filename - The name of the migration file
 * @returns {Promise<void>}
 */
async function executeMigration(filename) {
  const filePath = path.join(__dirname, 'supabase', filename);
  console.log(`Executing migration: ${filename}`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split the SQL file into individual statements
    const statements = sql
      .replace(/\/\*[\s\S]*?\*\/|--.*$/gm, '') // Remove comments
      .split(';')
      .filter(statement => statement.trim().length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabaseAdmin.rpc('pgmoon.query', { query: statement });
      
      if (error) {
        console.error(`Error executing statement: ${statement}`);
        console.error(error);
        throw error;
      }
    }
    
    console.log(`Migration ${filename} executed successfully`);
  } catch (error) {
    console.error(`Error executing migration ${filename}:`, error);
    throw error;
  }
}

/**
 * Initialize the database with all migrations
 */
async function initializeDatabase() {
  console.log('Starting database initialization...');
  
  try {
    // Create a migrations table if it doesn't exist
    const { error: tableError } = await supabaseAdmin.rpc('pgmoon.query', {
      query: `
        CREATE TABLE IF NOT EXISTS public.migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL UNIQUE,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });
    
    if (tableError) {
      console.error('Error creating migrations table:', tableError);
      throw tableError;
    }
    
    // Get already executed migrations
    const { data: executedMigrations, error: migrationsError } = await supabaseAdmin.rpc('pgmoon.query', {
      query: 'SELECT name FROM public.migrations ORDER BY id'
    });
    
    if (migrationsError) {
      console.error('Error fetching executed migrations:', migrationsError);
      throw migrationsError;
    }
    
    const executedMigrationNames = executedMigrations.map(row => row.name);
    
    // Execute migrations that haven't been executed yet
    for (const migrationFile of migrationFiles) {
      if (!executedMigrationNames.includes(migrationFile)) {
        await executeMigration(migrationFile);
        
        // Record the migration as executed
        const { error: recordError } = await supabaseAdmin.rpc('pgmoon.query', {
          query: `INSERT INTO public.migrations (name) VALUES ('${migrationFile}')`
        });
        
        if (recordError) {
          console.error(`Error recording migration ${migrationFile}:`, recordError);
          throw recordError;
        }
      } else {
        console.log(`Migration ${migrationFile} already executed, skipping`);
      }
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
