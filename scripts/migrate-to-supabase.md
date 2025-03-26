# MongoDB to Supabase Migration Guide

This document outlines the steps needed to complete the migration from MongoDB to Supabase in the Zirak HR application.

## Migration Status

- ✅ Authentication system migrated to Supabase Auth
- ✅ Skills analytics API migrated to Supabase
- ✅ Created compatibility layer for smooth transition
- ❌ API routes still using MongoDB connections
- ❌ Database schema migration not complete

## Migration Steps

### 1. Database Schema Migration

Create the following tables in Supabase:

- `users` - User profiles and authentication data
- `skills` - Technical skills with analytics data
- `technical_skills` - Detailed technical skill information
- `job_postings` - Job listings
- `job_applications` - User applications to jobs
- `saved_jobs` - Jobs saved by users
- `skill_assessments` - Skill assessment data
- `assessment_attempts` - User attempts at skill assessments
- `verified_skills` - User verified skills

### 2. API Routes to Update

The following API routes need to be updated to use Supabase instead of MongoDB:

#### Analytics APIs
- ✅ `/api/analytics/skills` - Migrated
- ❌ `/api/analytics/applications`
- ❌ `/api/analytics/departments`
- ❌ `/api/analytics/efficiency`
- ❌ `/api/analytics/export`
- ❌ `/api/analytics/overview`
- ❌ `/api/analytics/sources`
- ❌ `/api/analytics/stages`

#### Talent APIs
- ❌ `/api/talent/skills`
- ❌ `/api/talent/skills/technical`
- ❌ `/api/talent/skills/verified`
- ❌ `/api/talent/skills/assessment`
- ❌ `/api/talent/skills/attempts`
- ❌ `/api/talent/skills/tests`
- ❌ `/api/talent/profile`
- ❌ `/api/talent/resume`
- ❌ `/api/talent/jobs/recommended`
- ❌ `/api/talent/search`
- ❌ `/api/talent/save`
- ❌ `/api/talent/contact`
- ❌ `/api/talent/account`
- ❌ `/api/talent/settings`

#### Settings APIs
- ❌ `/api/settings`
- ❌ `/api/settings/account`
- ❌ `/api/settings/appearance`
- ❌ `/api/settings/delete-account`
- ❌ `/api/settings/notifications`
- ❌ `/api/settings/privacy`

#### Job APIs
- ❌ `/api/jobs/[id]/interviews`

#### Auth APIs
- ❌ `/api/auth/check`

#### Admin APIs
- ❌ `/api/admin/users`

#### Other APIs
- ❌ `/api/user/profile`
- ❌ `/api/sitemap/jobs`
- ❌ `/api/test`

### 3. Migration Strategy

For each API route:

1. Create corresponding Supabase models in `/app/models/`
2. Update the API route to use the new models
3. Test the API route to ensure it works correctly
4. Update any frontend components that use the API

### 4. Cleanup Steps

After all API routes have been migrated:

1. Remove the MongoDB compatibility layer
2. Remove MongoDB dependencies from `package.json`
3. Update environment variables to remove MongoDB-related variables
4. Update documentation to reflect the new architecture

## Testing

For each migrated API route, test the following:

1. Authentication and authorization
2. Data retrieval
3. Data creation
4. Data updates
5. Data deletion
6. Error handling

## Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Supabase JavaScript Client](https://supabase.io/docs/reference/javascript/introduction)
- [Next.js with Supabase](https://supabase.io/docs/guides/with-nextjs)
