# Zirak HR Database Schema

This document outlines the database schema for the Zirak HR application after migrating from MongoDB to Supabase.

## Database Structure

The Zirak HR database is organized into several logical sections:

### 1. Core Schema

**Users**
- Extends Supabase auth.users
- Contains user profile information and role (talent, hiring_manager, admin)
- Tracks profile completion status and email verification

**Companies**
- Company information for job listings
- Includes name, description, industry, size, etc.

**Departments**
- Department categories for jobs
- Used for analytics and job categorization

**Skills**
- Technical and soft skills for job listings and talent profiles
- Includes categories and descriptions

### 2. Talent Profiles

**Talent Profiles**
- Extended information for talent users
- Includes headline, summary, skills, and preferences

**Education**
- Educational background for talent profiles
- Includes institution, degree, field of study, etc.

**Experience**
- Work experience for talent profiles
- Includes company, title, description, etc.

**Languages**
- Language proficiency for talent profiles
- Includes language name and proficiency level

**Certifications**
- Professional certifications for talent profiles
- Includes certification name, issuing organization, etc.

### 3. Hiring Manager Profiles

**Hiring Manager Profiles**
- Extended information for hiring manager users
- Includes company, department, and hiring preferences

### 4. Jobs

**Jobs**
- Job listings posted by hiring managers
- Includes title, description, requirements, etc.

**Job Skills**
- Skills required for jobs
- Links jobs to skills with importance level

**Job Benefits**
- Benefits offered with jobs
- Includes benefit description

**Job Requirements**
- Requirements for jobs
- Includes requirement description

**Saved Jobs**
- Jobs saved by talent users
- Links users to jobs they're interested in

### 5. Applications

**Job Applications**
- Applications submitted by talent users
- Includes status, resume, cover letter, etc.

**Interviews**
- Interviews scheduled for job applications
- Includes date, time, type, and status

**Application Notes**
- Notes added to applications by hiring managers
- Used for tracking candidate progress

**Saved Candidates**
- Candidates saved by hiring managers
- Links hiring managers to talent users they're interested in

### 6. Skill Assessments

**Skill Tests**
- Tests for assessing skills
- Includes name, description, and difficulty

**Test Questions**
- Questions for skill tests
- Includes question text, options, and correct answer

**Test Attempts**
- Attempts by talent users to complete skill tests
- Includes score and completion status

**Verified Skills**
- Skills verified for talent users
- Includes verification date and proficiency level

### 7. Analytics and Notifications

**Job Views**
- Tracks views of job listings
- Used for analytics and recommendations

**Notifications**
- System notifications for users
- Includes message, type, and read status

## Database Relationships

The database uses foreign key relationships to maintain data integrity:

- Users have one-to-one relationships with talent profiles and hiring manager profiles
- Jobs belong to companies and are posted by users
- Job applications link users to jobs
- Skill tests have many questions
- Verified skills link users to skills

## Row Level Security (RLS)

Supabase provides Row Level Security to control access to data:

- Users can only access their own profiles and applications
- Hiring managers can only access their own job listings and applications
- Admin users have access to all data

## Migration Status

The migration from MongoDB to Supabase has been completed for all API routes. The following components have been migrated:

1. **Database Schema**: All tables and relationships have been created in Supabase
2. **API Routes**: All API routes have been updated to use Supabase instead of MongoDB
3. **Authentication**: User authentication has been migrated to use Supabase Auth

## Next Steps

To complete the database setup:

1. **Set Up Supabase Project**:
   - Create a new Supabase project if you haven't already
   - Configure authentication settings
   - Set up storage buckets for files

2. **Execute Schema Scripts**:
   - Run the SQL scripts in the `database/supabase` directory in order
   - These scripts will create the necessary tables and relationships

3. **Seed Data**:
   - Add sample data for testing
   - Create test users with different roles

4. **Configure Environment Variables**:
   - Update `.env` file with Supabase credentials
   - Remove any MongoDB-related variables

5. **Test API Routes**:
   - Verify that all API routes work correctly with Supabase
   - Check for any remaining issues with foreign key relationships

## Troubleshooting

If you encounter issues with the API routes:

1. **Check Database Schema**:
   - Verify that all tables exist in Supabase
   - Check that foreign key relationships are correct

2. **Check Environment Variables**:
   - Ensure Supabase URL and API keys are correct
   - Make sure all required variables are set

3. **Check API Route Implementation**:
   - Look for any remaining MongoDB references
   - Verify that Supabase queries are correctly formatted

4. **Enable Debug Logging**:
   - Add console.log statements to trace API execution
   - Check Supabase logs for any errors

## Conclusion

The migration to Supabase provides several benefits:

- **Improved Performance**: Supabase's PostgreSQL backend offers better performance for complex queries
- **Simplified Authentication**: Supabase Auth handles user authentication and authorization
- **Real-time Updates**: Supabase's real-time subscriptions enable live updates
- **Row Level Security**: Built-in security controls access to data
- **Scalability**: Supabase scales automatically to handle increased load

By completing this migration, the Zirak HR application is now using a modern, scalable, and feature-rich database solution that will support future growth and development.
