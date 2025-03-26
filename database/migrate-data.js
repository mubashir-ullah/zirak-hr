/**
 * Data Migration Script for Zirak HR
 * 
 * This script migrates data from the existing database structure to the new Supabase schema.
 * It handles the transfer of users, profiles, jobs, applications, and other related data.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { MongoClient, ObjectId } = require('mongodb');

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable');
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

// MongoDB connection
let mongoClient;
let db;

/**
 * Connect to MongoDB
 */
async function connectToMongoDB() {
  try {
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
    db = mongoClient.db();
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

/**
 * Close MongoDB connection
 */
async function closeMongoDBConnection() {
  if (mongoClient) {
    await mongoClient.close();
    console.log('Closed MongoDB connection');
  }
}

/**
 * Migrate users from MongoDB to Supabase
 */
async function migrateUsers() {
  console.log('Starting user migration...');
  
  try {
    // Get users from MongoDB
    const users = await db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users in MongoDB`);
    
    // Process each user
    for (const user of users) {
      console.log(`Processing user: ${user.email}`);
      
      // Check if user already exists in Supabase Auth
      const { data: existingAuthUser } = await supabaseAdmin.auth.admin.getUserByEmail(user.email);
      
      let authUserId;
      
      if (existingAuthUser) {
        console.log(`User ${user.email} already exists in Supabase Auth`);
        authUserId = existingAuthUser.id;
      } else {
        // Create user in Supabase Auth
        const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          email_confirm: true,
          password: user.password || Math.random().toString(36).slice(-8),
          user_metadata: {
            name: user.name,
            role: user.role || 'talent',
          }
        });
        
        if (authError) {
          console.error(`Error creating auth user ${user.email}:`, authError);
          continue;
        }
        
        authUserId = newAuthUser.id;
        console.log(`Created user in Supabase Auth: ${user.email} (${authUserId})`);
      }
      
      // Check if user already exists in Supabase DB
      const { data: existingDbUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();
      
      if (existingDbUser) {
        console.log(`User ${user.email} already exists in Supabase DB`);
        continue;
      }
      
      // Create user in Supabase DB
      const { error: dbError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authUserId,
          name: user.name,
          email: user.email.toLowerCase(),
          role: user.role || 'talent',
          needs_role_selection: user.needs_role_selection || false,
          email_verified: user.emailVerified || true,
          social_provider: user.provider,
          needs_profile_completion: user.needs_profile_completion || true,
          created_at: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
          updated_at: user.updatedAt ? new Date(user.updatedAt).toISOString() : new Date().toISOString()
        });
      
      if (dbError) {
        console.error(`Error creating DB user ${user.email}:`, dbError);
        continue;
      }
      
      console.log(`Created user in Supabase DB: ${user.email}`);
      
      // If user has a social provider, create social account
      if (user.provider && user.providerId) {
        const { error: socialError } = await supabaseAdmin
          .from('user_social_accounts')
          .insert({
            user_id: authUserId,
            provider: user.provider,
            provider_id: user.providerId,
            provider_email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (socialError) {
          console.error(`Error creating social account for ${user.email}:`, socialError);
        } else {
          console.log(`Created social account for ${user.email}`);
        }
      }
    }
    
    console.log('User migration completed');
  } catch (error) {
    console.error('Error migrating users:', error);
  }
}

/**
 * Migrate talent profiles from MongoDB to Supabase
 */
async function migrateTalentProfiles() {
  console.log('Starting talent profile migration...');
  
  try {
    // Get talent profiles from MongoDB
    const talentProfiles = await db.collection('talentProfiles').find({}).toArray();
    console.log(`Found ${talentProfiles.length} talent profiles in MongoDB`);
    
    // Process each profile
    for (const profile of talentProfiles) {
      console.log(`Processing talent profile for user: ${profile.userId}`);
      
      // Get user from Supabase
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', profile.email)
        .single();
      
      if (!user) {
        console.error(`User not found for email: ${profile.email}`);
        continue;
      }
      
      // Create talent profile in Supabase
      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('talent_profiles')
        .insert({
          user_id: user.id,
          full_name: profile.fullName || profile.name,
          title: profile.title || profile.jobTitle,
          bio: profile.bio,
          phone: profile.phone,
          country: profile.country,
          city: profile.city,
          profile_picture: profile.profilePicture,
          resume_url: profile.resumeUrl,
          linkedin_url: profile.linkedinUrl,
          github_url: profile.githubUrl,
          availability: profile.availability,
          german_level: profile.germanLevel,
          visa_required: profile.visaRequired || false,
          visa_type: profile.visaType,
          created_at: profile.createdAt ? new Date(profile.createdAt).toISOString() : new Date().toISOString(),
          updated_at: profile.updatedAt ? new Date(profile.updatedAt).toISOString() : new Date().toISOString()
        })
        .select()
        .single();
      
      if (profileError) {
        console.error(`Error creating talent profile for ${profile.email}:`, profileError);
        continue;
      }
      
      console.log(`Created talent profile for ${profile.email}`);
      
      // Migrate skills
      if (profile.skills && profile.skills.length > 0) {
        for (const skill of profile.skills) {
          // Find or create skill
          const { data: skillData } = await supabaseAdmin
            .from('skills')
            .select('id')
            .ilike('name', skill.name)
            .single();
          
          let skillId;
          
          if (skillData) {
            skillId = skillData.id;
          } else {
            // Create skill
            const { data: newSkill, error: skillError } = await supabaseAdmin
              .from('skills')
              .insert({
                name: skill.name,
                category: skill.category || 'technical',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();
            
            if (skillError) {
              console.error(`Error creating skill ${skill.name}:`, skillError);
              continue;
            }
            
            skillId = newSkill.id;
          }
          
          // Add skill to talent profile
          const { error: talentSkillError } = await supabaseAdmin
            .from('talent_skills')
            .insert({
              talent_id: newProfile.id,
              skill_id: skillId,
              proficiency_level: skill.proficiency || 3,
              is_verified: skill.verified || false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (talentSkillError) {
            console.error(`Error adding skill ${skill.name} to talent profile:`, talentSkillError);
          } else {
            console.log(`Added skill ${skill.name} to talent profile`);
          }
        }
      }
      
      // Migrate education
      if (profile.education && profile.education.length > 0) {
        for (const edu of profile.education) {
          const { error: eduError } = await supabaseAdmin
            .from('talent_education')
            .insert({
              talent_id: newProfile.id,
              institution: edu.institution,
              degree: edu.degree,
              field_of_study: edu.fieldOfStudy,
              start_date: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : null,
              end_date: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : null,
              current: edu.current || false,
              description: edu.description,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (eduError) {
            console.error(`Error adding education to talent profile:`, eduError);
          } else {
            console.log(`Added education to talent profile`);
          }
        }
      }
      
      // Migrate experience
      if (profile.experience && profile.experience.length > 0) {
        for (const exp of profile.experience) {
          const { error: expError } = await supabaseAdmin
            .from('talent_experience')
            .insert({
              talent_id: newProfile.id,
              company: exp.company,
              title: exp.title || exp.position,
              location: exp.location,
              start_date: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : null,
              end_date: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : null,
              current: exp.current || false,
              description: exp.description,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (expError) {
            console.error(`Error adding experience to talent profile:`, expError);
          } else {
            console.log(`Added experience to talent profile`);
          }
        }
      }
      
      // Migrate languages
      if (profile.languages && profile.languages.length > 0) {
        for (const lang of profile.languages) {
          const { error: langError } = await supabaseAdmin
            .from('talent_languages')
            .insert({
              talent_id: newProfile.id,
              language: lang.language,
              proficiency: lang.proficiency || 'conversational',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (langError) {
            console.error(`Error adding language to talent profile:`, langError);
          } else {
            console.log(`Added language to talent profile`);
          }
        }
      }
      
      // Migrate preferences
      if (profile.preferences) {
        const { error: prefError } = await supabaseAdmin
          .from('talent_preferences')
          .insert({
            talent_id: newProfile.id,
            preferred_job_types: profile.preferences.jobTypes || [],
            preferred_locations: profile.preferences.locations || [],
            remote_preference: profile.preferences.remote || 'flexible',
            min_salary: profile.preferences.minSalary,
            salary_currency: profile.preferences.currency || 'EUR',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (prefError) {
          console.error(`Error adding preferences to talent profile:`, prefError);
        } else {
          console.log(`Added preferences to talent profile`);
        }
      }
    }
    
    console.log('Talent profile migration completed');
  } catch (error) {
    console.error('Error migrating talent profiles:', error);
  }
}

/**
 * Migrate companies and hiring manager profiles
 */
async function migrateCompaniesAndHiringManagers() {
  console.log('Starting company and hiring manager migration...');
  
  try {
    // Get hiring manager profiles from MongoDB
    const hmProfiles = await db.collection('hiringManagerProfiles').find({}).toArray();
    console.log(`Found ${hmProfiles.length} hiring manager profiles in MongoDB`);
    
    // Process each profile
    for (const profile of hmProfiles) {
      console.log(`Processing hiring manager profile for user: ${profile.userId}`);
      
      // Get user from Supabase
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', profile.email)
        .single();
      
      if (!user) {
        console.error(`User not found for email: ${profile.email}`);
        continue;
      }
      
      // Create or get company
      let companyId;
      
      if (profile.company) {
        // Check if company exists
        const { data: existingCompany } = await supabaseAdmin
          .from('companies')
          .select('id')
          .ilike('name', profile.company.name)
          .single();
        
        if (existingCompany) {
          companyId = existingCompany.id;
        } else {
          // Create company
          const { data: newCompany, error: companyError } = await supabaseAdmin
            .from('companies')
            .insert({
              name: profile.company.name,
              description: profile.company.description,
              industry: profile.company.industry,
              size: profile.company.size,
              website: profile.company.website,
              logo_url: profile.company.logoUrl,
              headquarters: profile.company.location,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (companyError) {
            console.error(`Error creating company ${profile.company.name}:`, companyError);
            continue;
          }
          
          companyId = newCompany.id;
          console.log(`Created company: ${profile.company.name}`);
          
          // Add company location
          if (profile.company.location) {
            const location = profile.company.location.split(',');
            const city = location[0]?.trim();
            const country = location[1]?.trim() || 'Germany';
            
            const { error: locationError } = await supabaseAdmin
              .from('company_locations')
              .insert({
                company_id: companyId,
                country: country,
                city: city,
                is_headquarters: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (locationError) {
              console.error(`Error adding location to company:`, locationError);
            } else {
              console.log(`Added location to company`);
            }
          }
        }
      }
      
      // Create hiring manager profile
      const { error: profileError } = await supabaseAdmin
        .from('hiring_manager_profiles')
        .insert({
          user_id: user.id,
          full_name: profile.fullName || profile.name,
          title: profile.title || profile.position,
          phone: profile.phone,
          company_id: companyId,
          department: profile.department,
          profile_picture: profile.profilePicture,
          linkedin_url: profile.linkedinUrl,
          created_at: profile.createdAt ? new Date(profile.createdAt).toISOString() : new Date().toISOString(),
          updated_at: profile.updatedAt ? new Date(profile.updatedAt).toISOString() : new Date().toISOString()
        });
      
      if (profileError) {
        console.error(`Error creating hiring manager profile for ${profile.email}:`, profileError);
      } else {
        console.log(`Created hiring manager profile for ${profile.email}`);
      }
    }
    
    console.log('Company and hiring manager migration completed');
  } catch (error) {
    console.error('Error migrating companies and hiring managers:', error);
  }
}

/**
 * Migrate jobs from MongoDB to Supabase
 */
async function migrateJobs() {
  console.log('Starting job migration...');
  
  try {
    // Get jobs from MongoDB
    const jobs = await db.collection('jobs').find({}).toArray();
    console.log(`Found ${jobs.length} jobs in MongoDB`);
    
    // Process each job
    for (const job of jobs) {
      console.log(`Processing job: ${job.title}`);
      
      // Get company
      let companyId;
      
      if (job.company) {
        const { data: company } = await supabaseAdmin
          .from('companies')
          .select('id')
          .ilike('name', job.company)
          .single();
        
        if (company) {
          companyId = company.id;
        } else {
          // Create company
          const { data: newCompany, error: companyError } = await supabaseAdmin
            .from('companies')
            .insert({
              name: job.company,
              industry: job.industry,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (companyError) {
            console.error(`Error creating company ${job.company}:`, companyError);
            continue;
          }
          
          companyId = newCompany.id;
        }
      } else {
        console.error(`Job ${job.title} has no company, skipping`);
        continue;
      }
      
      // Get posted by user
      let postedById;
      
      if (job.postedBy) {
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', job.postedBy)
          .single();
        
        if (user) {
          postedById = user.id;
        } else {
          // Use the first admin user
          const { data: adminUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .single();
          
          if (adminUser) {
            postedById = adminUser.id;
          } else {
            console.error(`No admin user found for job ${job.title}, skipping`);
            continue;
          }
        }
      } else {
        // Use the first admin user
        const { data: adminUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .single();
        
        if (adminUser) {
          postedById = adminUser.id;
        } else {
          console.error(`No admin user found for job ${job.title}, skipping`);
          continue;
        }
      }
      
      // Create job
      const { data: newJob, error: jobError } = await supabaseAdmin
        .from('jobs')
        .insert({
          title: job.title,
          company_id: companyId,
          posted_by: postedById,
          location: job.location,
          description: job.description,
          job_type: job.jobType || 'full-time',
          experience_level: job.experienceLevel || 'mid-level',
          salary_min: job.salaryMin,
          salary_max: job.salaryMax,
          salary_currency: job.salaryCurrency || 'EUR',
          remote: job.remote || false,
          application_deadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : null,
          posted_date: job.postedDate ? new Date(job.postedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          status: job.status || 'active',
          application_count: job.applicationCount || 0,
          view_count: job.viewCount || 0,
          industry: job.industry,
          department: job.department,
          education_level: job.educationLevel,
          german_level: job.germanLevel,
          visa_sponsorship: job.visaSponsorship || false,
          created_at: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
          updated_at: job.updatedAt ? new Date(job.updatedAt).toISOString() : new Date().toISOString()
        })
        .select()
        .single();
      
      if (jobError) {
        console.error(`Error creating job ${job.title}:`, jobError);
        continue;
      }
      
      console.log(`Created job: ${job.title}`);
      
      // Add skills
      if (job.skills && job.skills.length > 0) {
        for (const skillName of job.skills) {
          // Find or create skill
          const { data: skillData } = await supabaseAdmin
            .from('skills')
            .select('id')
            .ilike('name', skillName)
            .single();
          
          let skillId;
          
          if (skillData) {
            skillId = skillData.id;
          } else {
            // Create skill
            const { data: newSkill, error: skillError } = await supabaseAdmin
              .from('skills')
              .insert({
                name: skillName,
                category: 'technical',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();
            
            if (skillError) {
              console.error(`Error creating skill ${skillName}:`, skillError);
              continue;
            }
            
            skillId = newSkill.id;
          }
          
          // Add skill to job
          const { error: jobSkillError } = await supabaseAdmin
            .from('job_skills')
            .insert({
              job_id: newJob.id,
              skill_id: skillId,
              importance: 3,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (jobSkillError) {
            console.error(`Error adding skill ${skillName} to job:`, jobSkillError);
          } else {
            console.log(`Added skill ${skillName} to job`);
          }
        }
      }
      
      // Add requirements
      if (job.requirements && job.requirements.length > 0) {
        for (const req of job.requirements) {
          const { error: reqError } = await supabaseAdmin
            .from('job_requirements')
            .insert({
              job_id: newJob.id,
              requirement: req,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (reqError) {
            console.error(`Error adding requirement to job:`, reqError);
          } else {
            console.log(`Added requirement to job`);
          }
        }
      }
      
      // Add benefits
      if (job.benefits && job.benefits.length > 0) {
        for (const benefit of job.benefits) {
          const { error: benefitError } = await supabaseAdmin
            .from('job_benefits')
            .insert({
              job_id: newJob.id,
              benefit: benefit,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (benefitError) {
            console.error(`Error adding benefit to job:`, benefitError);
          } else {
            console.log(`Added benefit to job`);
          }
        }
      }
    }
    
    console.log('Job migration completed');
  } catch (error) {
    console.error('Error migrating jobs:', error);
  }
}

/**
 * Migrate job applications from MongoDB to Supabase
 */
async function migrateJobApplications() {
  console.log('Starting job application migration...');
  
  try {
    // Get job applications from MongoDB
    const applications = await db.collection('jobApplications').find({}).toArray();
    console.log(`Found ${applications.length} job applications in MongoDB`);
    
    // Process each application
    for (const app of applications) {
      console.log(`Processing job application: ${app._id}`);
      
      // Get job from Supabase
      let jobId;
      
      if (app.jobId) {
        // Try to find job by title
        const { data: job } = await supabaseAdmin
          .from('jobs')
          .select('id, title')
          .eq('title', app.jobTitle)
          .single();
        
        if (job) {
          jobId = job.id;
        } else {
          console.error(`Job not found for application, skipping`);
          continue;
        }
      } else {
        console.error(`Application has no job ID, skipping`);
        continue;
      }
      
      // Get user from Supabase
      let userId;
      
      if (app.userId) {
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', app.userEmail)
          .single();
        
        if (user) {
          userId = user.id;
        } else {
          console.error(`User not found for application, skipping`);
          continue;
        }
      } else {
        console.error(`Application has no user ID, skipping`);
        continue;
      }
      
      // Create job application
      const { error: appError } = await supabaseAdmin
        .from('job_applications')
        .insert({
          job_id: jobId,
          user_id: userId,
          status: app.status || 'applied',
          applied_date: app.appliedDate ? new Date(app.appliedDate).toISOString() : new Date().toISOString(),
          resume_url: app.resumeUrl,
          cover_letter: app.coverLetter,
          notes: app.notes,
          hiring_manager_notes: app.hiringManagerNotes,
          match_score: app.matchScore,
          last_status_update_date: app.lastStatusUpdateDate ? new Date(app.lastStatusUpdateDate).toISOString() : new Date().toISOString(),
          created_at: app.createdAt ? new Date(app.createdAt).toISOString() : new Date().toISOString(),
          updated_at: app.updatedAt ? new Date(app.updatedAt).toISOString() : new Date().toISOString()
        });
      
      if (appError) {
        console.error(`Error creating job application:`, appError);
      } else {
        console.log(`Created job application`);
      }
    }
    
    console.log('Job application migration completed');
  } catch (error) {
    console.error('Error migrating job applications:', error);
  }
}

/**
 * Run the migration
 */
async function runMigration() {
  try {
    await connectToMongoDB();
    
    // Run migrations in order
    await migrateUsers();
    await migrateTalentProfiles();
    await migrateCompaniesAndHiringManagers();
    await migrateJobs();
    await migrateJobApplications();
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await closeMongoDBConnection();
  }
}

// Run the migration
runMigration();
