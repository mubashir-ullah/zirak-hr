/**
 * Zirak HR Database Setup Script
 * 
 * This script sets up the Supabase database schema using the existing SQL files.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing required environment variables.');
  console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// SQL files in order
const sqlFiles = [
  '01_core_schema.sql',
  '02_talent_profiles.sql',
  '03_hiring_manager_profiles.sql',
  '04_jobs.sql',
  '05_applications.sql',
  '06_skill_assessments.sql',
  '07_analytics_notifications.sql'
];

// Setup database
async function setupDatabase() {
  console.log('Setting up Zirak HR database...');
  
  try {
    for (const file of sqlFiles) {
      console.log(`Executing ${file}...`);
      const sqlPath = path.join(__dirname, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      const { error } = await supabase.rpc('pgmoon_exec', { query: sql });
      
      if (error) {
        console.error(`Error executing ${file}:`, error);
        console.log('Continuing with next file...');
      } else {
        console.log(`Successfully executed ${file}`);
      }
    }
    
    console.log('Database schema setup complete!');
    
    // Add sample data for testing
    await addSampleData();
    
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Unexpected error during database setup:', error);
  }
}

// Add sample data for testing
async function addSampleData() {
  console.log('Adding sample data for testing...');
  
  try {
    // Add sample departments
    const departments = [
      'Engineering',
      'Design',
      'Marketing',
      'Sales',
      'Operations'
    ];
    
    for (const dept of departments) {
      const { error } = await supabase
        .from('departments')
        .upsert({ name: dept, description: `${dept} department` }, { onConflict: 'name' });
      
      if (error) {
        console.error(`Error adding department ${dept}:`, error);
      }
    }
    
    // Add sample skills
    const skills = [
      { name: 'JavaScript', category: 'Programming' },
      { name: 'React', category: 'Frontend' },
      { name: 'Node.js', category: 'Backend' },
      { name: 'Python', category: 'Programming' },
      { name: 'Java', category: 'Programming' },
      { name: 'SQL', category: 'Database' },
      { name: 'AWS', category: 'Cloud' },
      { name: 'Docker', category: 'DevOps' },
      { name: 'Kubernetes', category: 'DevOps' },
      { name: 'TypeScript', category: 'Programming' },
      { name: 'HTML', category: 'Frontend' },
      { name: 'CSS', category: 'Frontend' },
      { name: 'Git', category: 'Tools' }
    ];
    
    for (const skill of skills) {
      const { error } = await supabase
        .from('skills')
        .upsert(skill, { onConflict: 'name' });
      
      if (error) {
        console.error(`Error adding skill ${skill.name}:`, error);
      }
    }
    
    // Add sample company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert({
        name: 'Zirak HR',
        description: 'Leading HR technology company',
        industry: 'Technology'
      }, { onConflict: 'name', returning: true });
    
    if (companyError) {
      console.error('Error adding company:', companyError);
    }
    
    // Get the first user (for testing)
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (userError || !users || users.length === 0) {
      console.error('Error getting user or no users found:', userError);
      return;
    }
    
    const userId = users[0].id;
    const companyId = company && company[0] ? company[0].id : null;
    
    if (companyId) {
      // Add sample jobs
      const jobData = {
        title: 'Frontend Developer',
        company_id: companyId,
        posted_by: userId,
        location: 'Remote',
        description: 'We are looking for a skilled Frontend Developer to join our team.',
        job_type: 'full-time',
        experience_level: 'mid-level',
        salary_min: 60000,
        salary_max: 80000,
        department: 'Engineering',
        status: 'active'
      };
      
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .upsert(jobData, { returning: true });
      
      if (jobError) {
        console.error('Error adding job:', jobError);
      } else {
        console.log('Sample job added successfully!');
      }
    }
    
    console.log('Sample data added successfully!');
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

// Run setup
setupDatabase().catch(console.error);
