# Zirak HR Database Architecture

This directory contains the database schema and migration files for the Zirak HR application. The database is designed to support the core functionalities of the application, including user authentication, talent management, job posting, application tracking, and analytics.

## Database Structure

The database is built on Supabase (PostgreSQL) and follows a relational model with proper relationships between tables. The schema is organized into several logical sections:

1. **Core Schema** - Basic tables like users, companies, and skills
2. **Talent Profiles** - Tables related to talent user profiles
3. **Hiring Manager Profiles** - Tables related to hiring manager profiles
4. **Jobs** - Tables for job listings and related data
5. **Applications** - Tables for job applications and interviews
6. **Skill Assessments** - Tables for skill tests and verification
7. **Analytics & Notifications** - Tables for tracking metrics and user notifications

## Getting Started

### Prerequisites

- Supabase account and project
- Environment variables set up in `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```

### Database Initialization

To set up the database schema:

1. Install dependencies:
   ```
   npm install
   ```

2. Run the initialization script:
   ```
   node database/init.js
   ```

This script will create all necessary tables, relationships, and indexes in your Supabase project.

## Migration Files

The database schema is split into multiple migration files for better organization:

- `01_core_schema.sql` - Core tables and enums
- `02_talent_profiles.sql` - Talent profile tables
- `03_hiring_manager_profiles.sql` - Hiring manager profile tables
- `04_jobs.sql` - Job-related tables
- `05_applications.sql` - Application and interview tables
- `06_skill_assessments.sql` - Skill test tables
- `07_analytics_notifications.sql` - Analytics and notification tables

Each migration file contains the SQL statements to create the tables, indexes, and triggers for that section of the schema.

## Database Utility Functions

The database utility functions are located in the `lib/database` directory and provide a clean API for interacting with the database:

- `users.ts` - User-related operations
- `talent-profiles.ts` - Talent profile operations
- `jobs.ts` - Job-related operations
- `applications.ts` - Application and interview operations
- `types.ts` - TypeScript type definitions for all database tables
- `index.ts` - Exports all database operations

### Usage Example

```typescript
import { createUser, findUserByEmail, updateUserRole } from '@/lib/database';

// Create a new user
const { user, error } = await createUser({
  id: 'auth0-user-id',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'talent',
  needs_role_selection: true
});

// Find a user by email
const user = await findUserByEmail('john@example.com');

// Update a user's role
const updatedUser = await updateUserRole(userId, 'hiring_manager');
```

## Database Diagrams

### Core Schema
```
users
  ↑
  ↓
user_social_accounts
```

### Talent Profiles
```
users
  ↑
  ↓
talent_profiles
  ↑
  ↓
talent_skills ← → skills
talent_education
talent_experience
talent_languages
talent_preferences
```

### Hiring Manager Profiles
```
users
  ↑
  ↓
hiring_manager_profiles → companies
                           ↑
                           ↓
                         company_locations
```

### Jobs
```
companies
  ↑
  ↓
jobs ← → users (posted_by)
  ↑
  ↓
job_skills ← → skills
job_benefits
job_requirements
```

### Applications
```
jobs
  ↑
  ↓
job_applications ← → users
  ↑
  ↓
application_interviews ← → users (interviewer)

users
  ↑
  ↓
saved_jobs ← → jobs
```

### Analytics
```
jobs
  ↑
  ↓
analytics_job_views
analytics_application_funnel

users
  ↑
  ↓
analytics_user_activity
notifications
messages
```

## Data Flow

The database is designed to support the following data flows:

1. **User Registration and Authentication**
   - Create user in Supabase Auth
   - Create user in users table
   - Handle social login providers

2. **Profile Management**
   - Create/update talent or hiring manager profiles
   - Manage skills, education, experience, etc.
   - Track profile completion

3. **Job Management**
   - Create and update job listings
   - Manage job skills, benefits, and requirements
   - Track job views and applications

4. **Application Process**
   - Submit job applications
   - Track application status
   - Schedule and manage interviews
   - Save jobs for later

5. **Analytics and Reporting**
   - Track user activity
   - Monitor application funnel
   - Generate insights for dashboards

## Best Practices

1. **Use the provided utility functions** - Don't write raw SQL queries
2. **Handle errors properly** - All functions return errors that should be handled
3. **Use transactions for complex operations** - Some operations span multiple tables
4. **Validate data before saving** - Ensure data meets the schema requirements
5. **Use indexes for performance** - Indexes are already set up for common queries

## Troubleshooting

If you encounter issues with the database:

1. Check the Supabase dashboard for errors
2. Verify your environment variables
3. Look at the console logs for detailed error messages
4. Make sure you're using the latest version of the utility functions
