# API Migration Plan: MongoDB to Supabase

This document outlines the plan for migrating all API routes from MongoDB to the new Supabase database infrastructure.

## Migration Overview

The Zirak HR application is transitioning from MongoDB to Supabase for its database needs. We've already:

1. Designed a comprehensive database schema in Supabase
2. Created utility functions for database operations
3. Set up data migration scripts

Now, we need to update all API routes to use the new database functions instead of MongoDB.

## Migration Steps

### 1. Identify API Routes Using MongoDB

Based on our analysis, the following API routes need to be migrated:

#### Talent-related Routes
- `/api/talent/profile`
- `/api/talent/skills/*`
- `/api/talent/save`
- `/api/talent/search`
- `/api/talent/resume`
- `/api/talent/contact`
- `/api/talent/account`
- `/api/talent/jobs/recommended`

#### Job-related Routes
- `/api/jobs/*`
- `/api/jobs/[id]/interviews/*`

#### Analytics Routes
- `/api/analytics/applications`
- `/api/analytics/overview`
- `/api/analytics/skills`
- `/api/analytics/stages`
- `/api/analytics/sources`
- `/api/analytics/export`
- `/api/analytics/efficiency`

#### Settings Routes
- `/api/settings/*`
- `/api/settings/account`
- `/api/settings/privacy`
- `/api/settings/notifications`
- `/api/settings/delete-account`
- `/api/settings/appearance`

#### Auth Routes
- `/api/auth/check`

### 2. Migration Process

For each API route, follow these steps:

1. **Create a backup** of the original file
2. **Update imports** to use the new database functions:
   ```typescript
   // Before
   import { connectToDatabase } from '@/lib/mongodb';
   
   // After
   import { 
     // Import specific functions based on needs
     findUserById,
     getTalentProfileByUserId,
     getAllJobs,
     // etc.
   } from '@/lib/database';
   ```

3. **Replace MongoDB queries** with Supabase function calls:
   ```typescript
   // Before
   const { db } = await connectToDatabase();
   const user = await db.collection('users').findOne({ email });
   
   // After
   const user = await findUserByEmail(email);
   ```

4. **Test the API route** to ensure it works correctly

### 3. Migration Priority

Migrate API routes in this order:

1. **Core User Routes** - Authentication and profile management
2. **Job Routes** - Job posting and application
3. **Analytics Routes** - Reporting and metrics
4. **Settings Routes** - User preferences and account management

### 4. Testing Strategy

For each migrated route:

1. **Unit Testing** - Verify the route handles requests correctly
2. **Integration Testing** - Test the route with the frontend
3. **Error Handling** - Ensure proper error responses

### 5. Rollback Plan

If issues are encountered:

1. Keep the backup files for quick restoration
2. Consider implementing a feature flag to switch between MongoDB and Supabase

## Migration Progress

### Completed Migrations
1. ✅ `/api/talent/profile/route.ts` - Talent profile management
2. ✅ `/api/jobs/route.ts` - Job listings and management
3. ✅ `/api/talent/applications/route.ts` - Job applications for talent
4. ✅ `/api/auth/check/route.ts` - Authentication status check
5. ✅ `/api/auth/set-role/route.ts` - User role selection
6. ✅ `/api/user/profile/route.ts` - User profile management
7. ✅ `/api/notifications/route.ts` - User notifications
8. ✅ `/api/auth/register/route.ts` - User registration
9. ✅ `/api/auth/login/route.ts` - User login
10. ✅ `/api/auth/verify-otp/route.ts` - Email verification
11. ✅ `/api/hiring/applications/route.ts` - Job applications for hiring managers
12. ✅ `/api/jobs/[id]/route.ts` - Job management for hiring managers
13. ✅ `/api/analytics/route.ts` - Analytics data and event tracking
14. ✅ `/api/auth/reset-password/route.ts` - Password reset
15. ✅ `/api/auth/link-account/route.ts` - Social account linking
16. ✅ `/api/auth/link-callback/route.ts` - Social account callback

### Additional Routes Requiring Migration

We've discovered additional API routes that still contain MongoDB references:

1. **Admin Routes**
   - `/api/admin/promote-user/route.ts` - For promoting users to admin role
   - `/api/admin/users/route.ts` - For managing users in admin dashboard

2. **Analytics Routes**
   - `/api/analytics/applications/route.ts` - For application analytics
   - `/api/analytics/departments/route.ts` - For department analytics

3. **Talent Skills Routes**
   - `/api/talent/skills/verified/route.ts` - For verified skills
   - `/api/talent/skills/route.ts` - For managing skills
   - `/api/talent/search/route.ts` - For searching talent profiles
   - `/api/talent/save/route.ts` - For saving talent profiles

4. **Test Route**
   - `/api/test/route.ts` - For testing database connection

These routes will need to be migrated in the next phase before we can fully remove the MongoDB dependency.

## Example Migration: Talent Profile Route

### Original (MongoDB)
```typescript
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const { db } = await connectToDatabase();
    const profile = await db.collection('talentProfiles').findOne({ userId });
    
    return NextResponse.json(profile || {});
  } catch (error) {
    console.error('Error fetching talent profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
```

### Migrated (Supabase)
```typescript
import { NextResponse } from 'next/server';
import { getTalentProfileByUserId } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const profile = await getTalentProfileByUserId(userId);
    
    return NextResponse.json(profile || {});
  } catch (error) {
    console.error('Error fetching talent profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
```

## Timeline

- **Phase 1 (Week 1)**: Migrate core user and authentication routes
- **Phase 2 (Week 2)**: Migrate job and application routes
- **Phase 3 (Week 3)**: Migrate analytics and settings routes
- **Phase 4 (Week 4)**: Testing and cleanup
  - Remove MongoDB connection file
  - Remove MongoDB dependency from package.json
  - Update environment variables

## Conclusion

Following this migration plan will ensure a smooth transition from MongoDB to Supabase while maintaining application functionality. Once all API routes are migrated, the MongoDB connection file can be safely removed.

Progress will be tracked in this document as routes are migrated.
