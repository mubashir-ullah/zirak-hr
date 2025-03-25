/**
 * Migration script to transfer data from MongoDB to Supabase
 * 
 * This script will:
 * 1. Connect to MongoDB and extract all data
 * 2. Transform the data to match Supabase schema
 * 3. Import the data into Supabase
 * 
 * Usage:
 * node migrate-to-supabase.js
 */

require('dotenv').config({ path: '../.env.local' });
const { MongoClient, ObjectId } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
const mongoClient = new MongoClient(mongoUri);

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mapping of MongoDB _id to Supabase UUID
const idMap = new Map();

// Logger setup
const logFile = path.join(__dirname, 'migration.log');
const logger = {
  log: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}`;
    console.log(logMessage);
    fs.appendFileSync(logFile, logMessage + '\n');
  },
  error: (message, error) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message} - ${error.message}`;
    console.error(logMessage);
    fs.appendFileSync(logFile, logMessage + '\n');
    if (error.stack) {
      fs.appendFileSync(logFile, error.stack + '\n');
    }
  }
};

/**
 * Main migration function
 */
async function migrateData() {
  try {
    logger.log('Starting migration from MongoDB to Supabase');
    
    // Connect to MongoDB
    await mongoClient.connect();
    logger.log('Connected to MongoDB');
    
    const db = mongoClient.db();
    
    // Migrate users
    await migrateUsers(db);
    
    // Migrate jobs
    await migrateJobs(db);
    
    // Migrate job applications
    await migrateJobApplications(db);
    
    // Migrate saved jobs
    await migrateSavedJobs(db);
    
    // Migrate talent profiles
    await migrateTalentProfiles(db);
    
    // Migrate hiring profiles
    await migrateHiringProfiles(db);
    
    logger.log('Migration completed successfully');
  } catch (error) {
    logger.error('Migration failed', error);
  } finally {
    await mongoClient.close();
    logger.log('MongoDB connection closed');
  }
}

/**
 * Migrate users from MongoDB to Supabase
 */
async function migrateUsers(db) {
  try {
    logger.log('Migrating users...');
    
    const users = await db.collection('users').find({}).toArray();
    logger.log(`Found ${users.length} users in MongoDB`);
    
    for (const user of users) {
      try {
        // Create user in Supabase Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password ? user.password : generateRandomPassword(),
          email_confirm: true
        });
        
        if (authError) {
          logger.error(`Failed to create auth user for ${user.email}`, authError);
          continue;
        }
        
        // Map MongoDB _id to Supabase UUID
        idMap.set(user._id.toString(), authUser.user.id);
        
        // Create user profile in Supabase
        const { error: profileError } = await supabase.from('users').insert({
          id: authUser.user.id,
          name: user.name || '',
          email: user.email,
          role: user.role || 'talent',
          organization: user.organization || '',
          position: user.position || '',
          social_provider: user.provider || '',
          needs_role_selection: user.needsRoleSelection || false,
          resume_url: user.resumeUrl || ''
        });
        
        if (profileError) {
          logger.error(`Failed to create user profile for ${user.email}`, profileError);
        } else {
          logger.log(`Migrated user: ${user.email}`);
        }
      } catch (error) {
        logger.error(`Error migrating user ${user.email}`, error);
      }
    }
    
    logger.log('Users migration completed');
  } catch (error) {
    logger.error('Users migration failed', error);
    throw error;
  }
}

/**
 * Migrate jobs from MongoDB to Supabase
 */
async function migrateJobs(db) {
  try {
    logger.log('Migrating jobs...');
    
    const jobs = await db.collection('jobs').find({}).toArray();
    logger.log(`Found ${jobs.length} jobs in MongoDB`);
    
    for (const job of jobs) {
      try {
        // Get Supabase UUID for the job poster
        const postedById = job.postedBy ? idMap.get(job.postedBy.toString()) : null;
        
        if (!postedById) {
          logger.error(`Cannot find Supabase ID for job poster: ${job.postedBy}`, new Error('ID mapping not found'));
          continue;
        }
        
        // Create job in Supabase
        const { error } = await supabase.from('jobs').insert({
          id: crypto.randomUUID(),
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          requirements: job.requirements || [],
          skills: job.skills || [],
          job_type: job.jobType || 'full-time',
          experience_level: job.experienceLevel || 'mid-level',
          salary_min: job.salaryMin || 0,
          salary_max: job.salaryMax || 0,
          salary_currency: job.salaryCurrency || 'EUR',
          remote: job.remote || false,
          application_deadline: job.applicationDeadline || null,
          posted_by: postedById,
          posted_date: job.postedDate || new Date().toISOString().split('T')[0],
          status: job.status || 'active',
          application_count: job.applicationCount || 0,
          view_count: job.viewCount || 0,
          industry: job.industry || '',
          company_size: job.companySize || '',
          benefits: job.benefits || [],
          education_level: job.educationLevel || '',
          german_level: job.germanLevel || '',
          visa_sponsorship: job.visaSponsorship || false
        });
        
        if (error) {
          logger.error(`Failed to create job: ${job.title}`, error);
        } else {
          logger.log(`Migrated job: ${job.title}`);
        }
      } catch (error) {
        logger.error(`Error migrating job ${job.title}`, error);
      }
    }
    
    logger.log('Jobs migration completed');
  } catch (error) {
    logger.error('Jobs migration failed', error);
    throw error;
  }
}

/**
 * Migrate job applications from MongoDB to Supabase
 */
async function migrateJobApplications(db) {
  try {
    logger.log('Migrating job applications...');
    
    const applications = await db.collection('jobApplications').find({}).toArray();
    logger.log(`Found ${applications.length} job applications in MongoDB`);
    
    for (const application of applications) {
      try {
        // Get Supabase UUIDs
        const userId = idMap.get(application.userId.toString());
        const jobId = idMap.get(application.jobId.toString());
        
        if (!userId || !jobId) {
          logger.error(`Cannot find Supabase IDs for application: User=${application.userId}, Job=${application.jobId}`, 
            new Error('ID mapping not found'));
          continue;
        }
        
        // Create job application in Supabase
        const { error } = await supabase.from('job_applications').insert({
          id: crypto.randomUUID(),
          job_id: jobId,
          user_id: userId,
          status: application.status || 'applied',
          applied_date: application.appliedDate || new Date().toISOString().split('T')[0],
          resume_url: application.resumeUrl || '',
          cover_letter: application.coverLetter || '',
          notes: application.notes || '',
          hiring_manager_notes: application.hiringManagerNotes || '',
          last_status_update_date: application.lastStatusUpdateDate || new Date().toISOString().split('T')[0],
          match_score: application.matchScore || 0
        });
        
        if (error) {
          logger.error(`Failed to create job application for user ${userId} and job ${jobId}`, error);
        } else {
          logger.log(`Migrated job application for user ${userId} and job ${jobId}`);
        }
      } catch (error) {
        logger.error(`Error migrating job application`, error);
      }
    }
    
    logger.log('Job applications migration completed');
  } catch (error) {
    logger.error('Job applications migration failed', error);
    throw error;
  }
}

/**
 * Migrate saved jobs from MongoDB to Supabase
 */
async function migrateSavedJobs(db) {
  try {
    logger.log('Migrating saved jobs...');
    
    const savedJobs = await db.collection('savedJobs').find({}).toArray();
    logger.log(`Found ${savedJobs.length} saved jobs in MongoDB`);
    
    for (const savedJob of savedJobs) {
      try {
        // Get Supabase UUIDs
        const userId = idMap.get(savedJob.userId.toString());
        const jobId = idMap.get(savedJob.jobId.toString());
        
        if (!userId || !jobId) {
          logger.error(`Cannot find Supabase IDs for saved job: User=${savedJob.userId}, Job=${savedJob.jobId}`, 
            new Error('ID mapping not found'));
          continue;
        }
        
        // Create saved job in Supabase
        const { error } = await supabase.from('saved_jobs').insert({
          id: crypto.randomUUID(),
          job_id: jobId,
          user_id: userId,
          saved_date: savedJob.savedDate || new Date().toISOString().split('T')[0],
          notes: savedJob.notes || ''
        });
        
        if (error) {
          logger.error(`Failed to create saved job for user ${userId} and job ${jobId}`, error);
        } else {
          logger.log(`Migrated saved job for user ${userId} and job ${jobId}`);
        }
      } catch (error) {
        logger.error(`Error migrating saved job`, error);
      }
    }
    
    logger.log('Saved jobs migration completed');
  } catch (error) {
    logger.error('Saved jobs migration failed', error);
    throw error;
  }
}

/**
 * Migrate talent profiles from MongoDB to Supabase
 */
async function migrateTalentProfiles(db) {
  try {
    logger.log('Migrating talent profiles...');
    
    const profiles = await db.collection('talentProfiles').find({}).toArray();
    logger.log(`Found ${profiles.length} talent profiles in MongoDB`);
    
    for (const profile of profiles) {
      try {
        // Get Supabase UUID
        const userId = idMap.get(profile.userId.toString());
        
        if (!userId) {
          logger.error(`Cannot find Supabase ID for talent profile: User=${profile.userId}`, 
            new Error('ID mapping not found'));
          continue;
        }
        
        // Create talent profile in Supabase
        const { error } = await supabase.from('talent_profiles').insert({
          id: crypto.randomUUID(),
          user_id: userId,
          full_name: profile.fullName || '',
          email: profile.email || '',
          skills: profile.skills || [],
          experience: profile.experience || '',
          country: profile.country || '',
          city: profile.city || '',
          german_level: profile.germanLevel || '',
          availability: profile.availability || '',
          visa_required: profile.visaRequired || false,
          visa_type: profile.visaType || '',
          linkedin_url: profile.linkedinUrl || '',
          github_url: profile.githubUrl || '',
          bio: profile.bio || '',
          profile_picture: profile.profilePicture || '',
          resume_url: profile.resumeUrl || '',
          title: profile.title || '',
          phone: profile.phone || '',
          education: profile.education || [],
          preferred_job_types: profile.preferredJobTypes || [],
          preferred_locations: profile.preferredLocations || [],
          languages: profile.languages || []
        });
        
        if (error) {
          logger.error(`Failed to create talent profile for user ${userId}`, error);
        } else {
          logger.log(`Migrated talent profile for user ${userId}`);
        }
      } catch (error) {
        logger.error(`Error migrating talent profile`, error);
      }
    }
    
    logger.log('Talent profiles migration completed');
  } catch (error) {
    logger.error('Talent profiles migration failed', error);
    throw error;
  }
}

/**
 * Migrate hiring profiles from MongoDB to Supabase
 */
async function migrateHiringProfiles(db) {
  try {
    logger.log('Migrating hiring profiles...');
    
    const profiles = await db.collection('hiringProfiles').find({}).toArray();
    logger.log(`Found ${profiles.length} hiring profiles in MongoDB`);
    
    for (const profile of profiles) {
      try {
        // Get Supabase UUID
        const userId = idMap.get(profile.userId.toString());
        
        if (!userId) {
          logger.error(`Cannot find Supabase ID for hiring profile: User=${profile.userId}`, 
            new Error('ID mapping not found'));
          continue;
        }
        
        // Create hiring profile in Supabase
        const { error } = await supabase.from('hiring_profiles').insert({
          id: crypto.randomUUID(),
          user_id: userId,
          full_name: profile.fullName || '',
          email: profile.email || '',
          company: profile.company || '',
          position: profile.position || '',
          company_description: profile.companyDescription || '',
          company_size: profile.companySize || '',
          industry: profile.industry || '',
          company_website: profile.companyWebsite || '',
          company_logo: profile.companyLogo || '',
          company_location: profile.companyLocation || '',
          hiring_needs: profile.hiringNeeds || '',
          contact_phone: profile.contactPhone || '',
          linkedin_url: profile.linkedinUrl || ''
        });
        
        if (error) {
          logger.error(`Failed to create hiring profile for user ${userId}`, error);
        } else {
          logger.log(`Migrated hiring profile for user ${userId}`);
        }
      } catch (error) {
        logger.error(`Error migrating hiring profile`, error);
      }
    }
    
    logger.log('Hiring profiles migration completed');
  } catch (error) {
    logger.error('Hiring profiles migration failed', error);
    throw error;
  }
}

/**
 * Generate a random password for users without a password
 */
function generateRandomPassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

// Run the migration
migrateData().catch(console.error);
