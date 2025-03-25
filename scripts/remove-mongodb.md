# MongoDB Removal Guide

This document outlines the steps to completely remove MongoDB dependencies from the Zirak HR application as part of the migration to Supabase.

## Files to Remove

The following MongoDB-specific files should be removed:

1. `lib/mongoose.ts` - MongoDB connection utility
2. Any MongoDB model files (typically in `models/` directory)
3. Any MongoDB schema files

## Dependencies to Remove

Remove the following npm packages from `package.json`:

```bash
npm uninstall mongoose mongodb
```

## Environment Variables to Remove

Remove the following environment variables from `.env` and `.env.example` files:

```
MONGODB_URI=your-mongodb-uri
```

## Code Refactoring

The following code patterns should be refactored:

1. Replace all `import connectToMongoose from '@/lib/mongoose'` statements
2. Replace all MongoDB model imports with Supabase utility functions
3. Replace all MongoDB queries with equivalent Supabase queries:
   - `find()` → `supabase.from('table').select()`
   - `findOne()` → `supabase.from('table').select().single()`
   - `create()` → `supabase.from('table').insert()`
   - `updateOne()` → `supabase.from('table').update()`
   - `deleteOne()` → `supabase.from('table').delete()`

## Migration Steps

1. Ensure all API routes are updated to use Supabase
2. Verify all utility functions are updated to use Supabase
3. Run the application with Supabase to ensure everything works
4. Remove MongoDB files and dependencies
5. Update environment variables

## Verification

After removing MongoDB, verify the following:

1. Application starts without errors
2. All API routes function correctly
3. Data is correctly stored and retrieved from Supabase
4. No MongoDB-related code remains in the codebase

## Rollback Plan

If issues are encountered, the application can be rolled back to MongoDB by:

1. Reinstalling MongoDB dependencies
2. Restoring MongoDB files
3. Restoring MongoDB environment variables
4. Reverting code changes
