# Zirak HR API Testing Plan

## Overview

This document outlines the testing strategy for the migrated API routes in the Zirak HR application. The goal is to verify that all functionality works correctly after migrating from MongoDB to Supabase.

## Prerequisites

- Development server running (`npm run dev`)
- Supabase environment variables properly configured
- Test user accounts for different roles (talent, hiring manager, admin)

## Testing Categories

### 1. Authentication Testing

| API Route | Test Case | Expected Result | Status |
|-----------|-----------|-----------------|--------|
| `/api/auth/register` | Register new user with valid data | User created in Supabase, OTP sent | ⬜ |
| `/api/auth/register` | Register with existing email | Error response | ⬜ |
| `/api/auth/verify-otp` | Verify with valid OTP | User verified in database | ⬜ |
| `/api/auth/verify-otp` | Verify with invalid OTP | Error response | ⬜ |
| `/api/auth/login` | Login with valid credentials | Session created, user data returned | ⬜ |
| `/api/auth/login` | Login with invalid credentials | Error response | ⬜ |
| `/api/auth/check` | Check with valid session | User data returned | ⬜ |
| `/api/auth/check` | Check with invalid session | Error response | ⬜ |
| `/api/auth/set-role` | Set valid role | Role updated in database | ⬜ |
| `/api/auth/reset-password` | Request with valid email | Reset email sent | ⬜ |
| `/api/auth/reset-password` | Reset with valid token | Password updated | ⬜ |
| `/api/auth/link-account` | Link with valid provider | OAuth URL returned | ⬜ |
| `/api/auth/link-callback` | Process valid callback | Account linked | ⬜ |

### 2. User Profile Testing

| API Route | Test Case | Expected Result | Status |
|-----------|-----------|-----------------|--------|
| `/api/user/profile` | Get profile with valid session | Profile data returned | ⬜ |
| `/api/user/profile` | Update profile with valid data | Profile updated in database | ⬜ |
| `/api/talent/profile` | Get talent profile | Complete talent profile returned | ⬜ |
| `/api/talent/profile` | Update talent profile | Profile updated in database | ⬜ |

### 3. Job Management Testing

| API Route | Test Case | Expected Result | Status |
|-----------|-----------|-----------------|--------|
| `/api/jobs` | Get all jobs | List of jobs returned | ⬜ |
| `/api/jobs` | Create new job | Job created in database | ⬜ |
| `/api/jobs/[id]` | Get specific job | Job details returned | ⬜ |
| `/api/jobs/[id]` | Update job | Job updated in database | ⬜ |
| `/api/jobs/[id]` | Delete job | Job removed from database | ⬜ |

### 4. Application Testing

| API Route | Test Case | Expected Result | Status |
|-----------|-----------|-----------------|--------|
| `/api/talent/applications` | Get user applications | List of applications returned | ⬜ |
| `/api/talent/applications` | Submit application | Application created in database | ⬜ |
| `/api/hiring/applications` | Get job applications | List of applications for job returned | ⬜ |
| `/api/hiring/applications` | Update application status | Status updated in database | ⬜ |

### 5. Notification Testing

| API Route | Test Case | Expected Result | Status |
|-----------|-----------|-----------------|--------|
| `/api/notifications` | Get notifications | List of notifications returned | ⬜ |
| `/api/notifications` | Mark as read | Notification updated in database | ⬜ |
| `/api/notifications` | Delete notification | Notification removed from database | ⬜ |

### 6. Analytics Testing

| API Route | Test Case | Expected Result | Status |
|-----------|-----------|-----------------|--------|
| `/api/analytics` | Track event | Event recorded in database | ⬜ |
| `/api/analytics` | Get user activity | Activity data returned | ⬜ |

## Testing Tools

1. **Postman/Insomnia**: For direct API testing
2. **Browser Developer Tools**: For testing API calls from the frontend
3. **Supabase Dashboard**: For verifying data changes in the database

## Testing Process

1. Create test users for each role (talent, hiring manager, admin)
2. Test each API route with valid and invalid inputs
3. Verify the database state after each operation
4. Document any issues or unexpected behavior
5. Retest after fixing issues

## Reporting

Use the following status indicators:
- ✅ Passed: API works as expected
- ⚠️ Partial: API works but has minor issues
- ❌ Failed: API does not work as expected
- ⬜ Not tested: API has not been tested yet

## Next Steps After Testing

1. Fix any issues identified during testing
2. Migrate the remaining API routes that still use MongoDB
3. Remove MongoDB dependency once all tests pass
