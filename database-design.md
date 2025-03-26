# Zirak HR Database Design and Data Flow Architecture

## 1. Introduction

This document outlines the comprehensive database design and data flow architecture for the Zirak HR application. The design aims to support the application's core functionalities, including user authentication, role-based access control, talent management, job posting, application tracking, and analytics.

## 2. Current Architecture Analysis

### 2.1 Current State

The Zirak HR application currently uses:
- **Supabase** for authentication and database
- **Next.js** for the frontend and API routes
- Role-based access with three primary roles: talent, hiring manager, and admin

The application has a hybrid authentication approach:
- Supabase Auth for email/password authentication and OTP verification
- Social login providers (Google, GitHub, LinkedIn, Apple)

### 2.2 Current Data Models

Based on the codebase analysis, the current data models include:

1. **Users**
   - Basic user information and authentication details
   - Role-based access control

2. **Talent Profiles**
   - Extended information for talent users
   - Skills, experience, education, preferences

3. **Jobs**
   - Job listings posted by hiring managers
   - Requirements, skills, compensation details

4. **Job Applications**
   - Applications submitted by talent users
   - Status tracking and feedback

5. **Saved Jobs**
   - Jobs saved by talent users for later review

### 2.3 Current Limitations

1. **Data Consistency**: Potential inconsistencies between auth data and application data
2. **Relationship Management**: Limited explicit relationship definitions
3. **Scalability Concerns**: Current structure may not scale efficiently for advanced features
4. **Analytics Support**: Limited structured data for comprehensive analytics

## 3. Proposed Database Architecture

### 3.1 Database Technology

The proposed architecture will continue using **Supabase** (PostgreSQL) as the primary database, with the following improvements:

- Enhanced schema design with proper relationships
- Optimized indexes for performance
- Improved data validation rules
- Better separation of concerns

### 3.2 Core Data Models

#### 3.2.1 Authentication and User Management

```
Table: auth.users (managed by Supabase Auth)
- id (UUID, PK)
- email (VARCHAR, unique)
- encrypted_password (VARCHAR)
- email_confirmed_at (TIMESTAMP)
- last_sign_in_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.users
- id (UUID, PK, references auth.users.id)
- name (VARCHAR, NOT NULL)
- email (VARCHAR, NOT NULL, unique)
- role (ENUM: 'talent', 'hiring_manager', 'admin', NOT NULL)
- needs_role_selection (BOOLEAN, default: false)
- email_verified (BOOLEAN, default: false)
- social_provider (VARCHAR, nullable)
- needs_profile_completion (BOOLEAN, default: true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.user_social_accounts
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- provider (VARCHAR, NOT NULL) # 'google', 'github', 'linkedin', 'apple'
- provider_id (VARCHAR, NOT NULL)
- provider_email (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3.2.2 Talent Profile Management

```
Table: public.talent_profiles
- id (UUID, PK)
- user_id (UUID, FK -> users.id, unique)
- full_name (VARCHAR)
- title (VARCHAR)
- bio (TEXT)
- phone (VARCHAR)
- country (VARCHAR)
- city (VARCHAR)
- profile_picture (VARCHAR) # URL to stored image
- resume_url (VARCHAR) # URL to stored resume
- linkedin_url (VARCHAR)
- github_url (VARCHAR)
- availability (VARCHAR)
- german_level (VARCHAR)
- visa_required (BOOLEAN, default: false)
- visa_type (VARCHAR)
- profile_completion_percentage (INTEGER, default: 0)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.talent_skills
- id (UUID, PK)
- talent_id (UUID, FK -> talent_profiles.id)
- skill_id (UUID, FK -> skills.id)
- proficiency_level (INTEGER) # 1-5 scale
- is_verified (BOOLEAN, default: false)
- verification_date (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.talent_education
- id (UUID, PK)
- talent_id (UUID, FK -> talent_profiles.id)
- institution (VARCHAR, NOT NULL)
- degree (VARCHAR)
- field_of_study (VARCHAR)
- start_date (DATE)
- end_date (DATE)
- current (BOOLEAN, default: false)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.talent_experience
- id (UUID, PK)
- talent_id (UUID, FK -> talent_profiles.id)
- company (VARCHAR, NOT NULL)
- title (VARCHAR, NOT NULL)
- location (VARCHAR)
- start_date (DATE)
- end_date (DATE)
- current (BOOLEAN, default: false)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.talent_languages
- id (UUID, PK)
- talent_id (UUID, FK -> talent_profiles.id)
- language (VARCHAR, NOT NULL)
- proficiency (VARCHAR) # 'basic', 'conversational', 'fluent', 'native'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.talent_preferences
- id (UUID, PK)
- talent_id (UUID, FK -> talent_profiles.id)
- preferred_job_types (VARCHAR[]) # Array of job types
- preferred_locations (VARCHAR[]) # Array of locations
- remote_preference (VARCHAR) # 'remote', 'hybrid', 'onsite', 'flexible'
- min_salary (INTEGER)
- salary_currency (VARCHAR, default: 'EUR')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3.2.3 Hiring Manager Profile Management

```
Table: public.hiring_manager_profiles
- id (UUID, PK)
- user_id (UUID, FK -> users.id, unique)
- full_name (VARCHAR)
- title (VARCHAR)
- phone (VARCHAR)
- company_id (UUID, FK -> companies.id)
- department (VARCHAR)
- profile_picture (VARCHAR) # URL to stored image
- linkedin_url (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.companies
- id (UUID, PK)
- name (VARCHAR, NOT NULL)
- description (TEXT)
- industry (VARCHAR)
- size (VARCHAR) # '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
- website (VARCHAR)
- logo_url (VARCHAR)
- headquarters (VARCHAR)
- founded_year (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.company_locations
- id (UUID, PK)
- company_id (UUID, FK -> companies.id)
- country (VARCHAR, NOT NULL)
- city (VARCHAR, NOT NULL)
- address (VARCHAR)
- is_headquarters (BOOLEAN, default: false)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3.2.4 Job Management

```
Table: public.skills
- id (UUID, PK)
- name (VARCHAR, NOT NULL, unique)
- category (VARCHAR) # 'technical', 'soft', 'language', etc.
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.jobs
- id (UUID, PK)
- title (VARCHAR, NOT NULL)
- company_id (UUID, FK -> companies.id)
- posted_by (UUID, FK -> users.id)
- location (VARCHAR)
- description (TEXT)
- job_type (VARCHAR) # 'full-time', 'part-time', 'contract', 'freelance', 'internship'
- experience_level (VARCHAR) # 'entry', 'junior', 'mid-level', 'senior', 'lead'
- salary_min (INTEGER)
- salary_max (INTEGER)
- salary_currency (VARCHAR, default: 'EUR')
- remote (BOOLEAN, default: false)
- application_deadline (DATE)
- posted_date (DATE)
- status (VARCHAR) # 'active', 'filled', 'expired', 'draft'
- application_count (INTEGER, default: 0)
- view_count (INTEGER, default: 0)
- industry (VARCHAR)
- department (VARCHAR)
- education_level (VARCHAR)
- german_level (VARCHAR)
- visa_sponsorship (BOOLEAN, default: false)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.job_skills
- id (UUID, PK)
- job_id (UUID, FK -> jobs.id)
- skill_id (UUID, FK -> skills.id)
- importance (INTEGER) # 1-5 scale
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.job_benefits
- id (UUID, PK)
- job_id (UUID, FK -> jobs.id)
- benefit (VARCHAR, NOT NULL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.job_requirements
- id (UUID, PK)
- job_id (UUID, FK -> jobs.id)
- requirement (TEXT, NOT NULL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3.2.5 Application Management

```
Table: public.job_applications
- id (UUID, PK)
- job_id (UUID, FK -> jobs.id)
- user_id (UUID, FK -> users.id)
- status (VARCHAR) # 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'
- applied_date (TIMESTAMP)
- resume_url (VARCHAR)
- cover_letter (TEXT)
- notes (TEXT)
- hiring_manager_notes (TEXT)
- match_score (INTEGER) # 0-100 score calculated by AI
- last_status_update_date (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.application_interviews
- id (UUID, PK)
- application_id (UUID, FK -> job_applications.id)
- interviewer_id (UUID, FK -> users.id)
- scheduled_date (TIMESTAMP)
- duration_minutes (INTEGER)
- interview_type (VARCHAR) # 'phone', 'video', 'onsite', 'technical'
- status (VARCHAR) # 'scheduled', 'completed', 'canceled', 'rescheduled'
- feedback (TEXT)
- rating (INTEGER) # 1-5 scale
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.saved_jobs
- id (UUID, PK)
- job_id (UUID, FK -> jobs.id)
- user_id (UUID, FK -> users.id)
- saved_date (TIMESTAMP)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3.2.6 Skill Assessment

```
Table: public.skill_tests
- id (UUID, PK)
- name (VARCHAR, NOT NULL)
- description (TEXT)
- skill_id (UUID, FK -> skills.id)
- difficulty (VARCHAR) # 'beginner', 'intermediate', 'advanced', 'expert'
- duration_minutes (INTEGER)
- passing_score (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.skill_test_questions
- id (UUID, PK)
- test_id (UUID, FK -> skill_tests.id)
- question (TEXT, NOT NULL)
- question_type (VARCHAR) # 'multiple_choice', 'coding', 'essay'
- options (JSONB) # For multiple choice questions
- correct_answer (TEXT)
- points (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.skill_test_attempts
- id (UUID, PK)
- test_id (UUID, FK -> skill_tests.id)
- user_id (UUID, FK -> users.id)
- start_time (TIMESTAMP)
- end_time (TIMESTAMP)
- score (INTEGER)
- passed (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.skill_test_answers
- id (UUID, PK)
- attempt_id (UUID, FK -> skill_test_attempts.id)
- question_id (UUID, FK -> skill_test_questions.id)
- answer (TEXT)
- is_correct (BOOLEAN)
- points_awarded (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3.2.7 Analytics and Reporting

```
Table: public.analytics_job_views
- id (UUID, PK)
- job_id (UUID, FK -> jobs.id)
- user_id (UUID, FK -> users.id, nullable)
- view_date (TIMESTAMP)
- source (VARCHAR) # 'search', 'recommendation', 'direct', etc.
- created_at (TIMESTAMP)
```

```
Table: public.analytics_application_funnel
- id (UUID, PK)
- job_id (UUID, FK -> jobs.id)
- views (INTEGER, default: 0)
- applications (INTEGER, default: 0)
- screenings (INTEGER, default: 0)
- interviews (INTEGER, default: 0)
- offers (INTEGER, default: 0)
- hires (INTEGER, default: 0)
- date (DATE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

```
Table: public.analytics_user_activity
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- activity_type (VARCHAR) # 'login', 'profile_update', 'job_view', 'job_application', etc.
- activity_date (TIMESTAMP)
- details (JSONB)
- created_at (TIMESTAMP)
```

#### 3.2.8 Notifications and Communication

```
Table: public.notifications
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- title (VARCHAR, NOT NULL)
- message (TEXT, NOT NULL)
- type (VARCHAR) # 'application_update', 'interview', 'message', 'system', etc.
- related_entity_type (VARCHAR) # 'job', 'application', 'interview', etc.
- related_entity_id (UUID)
- is_read (BOOLEAN, default: false)
- created_at (TIMESTAMP)
```

```
Table: public.messages
- id (UUID, PK)
- sender_id (UUID, FK -> users.id)
- recipient_id (UUID, FK -> users.id)
- subject (VARCHAR)
- content (TEXT)
- related_entity_type (VARCHAR) # 'job', 'application', 'interview', etc.
- related_entity_id (UUID)
- is_read (BOOLEAN, default: false)
- created_at (TIMESTAMP)
```

### 3.3 Database Indexes

To optimize query performance, the following indexes should be created:

1. **User Lookup Indexes**
   - users(email)
   - users(role)
   - user_social_accounts(provider, provider_id)

2. **Profile Lookup Indexes**
   - talent_profiles(user_id)
   - hiring_manager_profiles(user_id)
   - talent_skills(talent_id)
   - talent_skills(skill_id)

3. **Job Search Indexes**
   - jobs(status)
   - jobs(company_id)
   - jobs(posted_by)
   - jobs(job_type)
   - jobs(experience_level)
   - job_skills(skill_id)

4. **Application Tracking Indexes**
   - job_applications(job_id)
   - job_applications(user_id)
   - job_applications(status)
   - application_interviews(application_id)
   - application_interviews(scheduled_date)

5. **Analytics Indexes**
   - analytics_job_views(job_id)
   - analytics_job_views(view_date)
   - analytics_application_funnel(job_id)
   - analytics_application_funnel(date)
   - analytics_user_activity(user_id)
   - analytics_user_activity(activity_date)

### 3.4 Database Constraints and Relationships

1. **Foreign Key Constraints**
   - All relationships between tables should be enforced with foreign key constraints
   - ON DELETE CASCADE or ON DELETE SET NULL should be used appropriately

2. **Unique Constraints**
   - users(email)
   - talent_profiles(user_id)
   - hiring_manager_profiles(user_id)
   - skills(name)
   - user_social_accounts(user_id, provider)

3. **Check Constraints**
   - job_applications(status IN ('applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'))
   - jobs(status IN ('active', 'filled', 'expired', 'draft'))
   - users(role IN ('talent', 'hiring_manager', 'admin'))

## 4. Data Flow Architecture

### 4.1 Authentication Flow

1. **Registration Flow**
   ```
   User Registration
   ↓
   Create auth.users entry (Supabase Auth)
   ↓
   Create public.users entry
   ↓
   Send email verification
   ↓
   Redirect to role selection
   ↓
   Update user role
   ↓
   Redirect to appropriate dashboard
   ```

2. **Login Flow**
   ```
   User Login
   ↓
   Authenticate with Supabase Auth
   ↓
   Check email verification status
   ↓
   Check role selection status
   ↓
   Redirect to appropriate dashboard
   ```

3. **Social Login Flow**
   ```
   Social Login Initiation
   ↓
   OAuth Provider Authentication
   ↓
   Callback to application
   ↓
   Check if user exists in public.users
   ↓
   If new user:
     Create public.users entry
     Create user_social_accounts entry
     Redirect to role selection
   If existing user:
     Update session
     Redirect to appropriate dashboard
   ```

### 4.2 Profile Management Flow

1. **Talent Profile Flow**
   ```
   User accesses profile page
   ↓
   Fetch user data from public.users
   ↓
   Fetch talent profile data from talent_profiles
   ↓
   Fetch related data (skills, education, experience, etc.)
   ↓
   User updates profile
   ↓
   Update relevant tables
   ↓
   Recalculate profile completion percentage
   ↓
   Update talent_profiles.profile_completion_percentage
   ```

2. **Hiring Manager Profile Flow**
   ```
   User accesses profile page
   ↓
   Fetch user data from public.users
   ↓
   Fetch hiring manager profile data from hiring_manager_profiles
   ↓
   Fetch company data from companies
   ↓
   User updates profile
   ↓
   Update relevant tables
   ```

### 4.3 Job Management Flow

1. **Job Creation Flow**
   ```
   Hiring manager creates job
   ↓
   Create entry in jobs table
   ↓
   Add skills to job_skills table
   ↓
   Add requirements to job_requirements table
   ↓
   Add benefits to job_benefits table
   ↓
   Job is published (status = 'active')
   ```

2. **Job Search Flow**
   ```
   Talent searches for jobs
   ↓
   Query jobs table with filters
   ↓
   Join with job_skills, job_requirements, job_benefits as needed
   ↓
   Calculate match score based on talent's skills
   ↓
   Return sorted job listings
   ↓
   Record analytics_job_views entry
   ```

### 4.4 Application Flow

1. **Job Application Flow**
   ```
   Talent applies to job
   ↓
   Create job_applications entry
   ↓
   Increment jobs.application_count
   ↓
   Create notification for hiring manager
   ↓
   Update analytics_application_funnel
   ```

2. **Application Review Flow**
   ```
   Hiring manager reviews application
   ↓
   Fetch application data from job_applications
   ↓
   Fetch talent profile data
   ↓
   Update application status
   ↓
   Create notification for talent
   ↓
   Update analytics_application_funnel
   ```

3. **Interview Scheduling Flow**
   ```
   Hiring manager schedules interview
   ↓
   Create application_interviews entry
   ↓
   Update job_applications status
   ↓
   Create notification for talent
   ↓
   Update analytics_application_funnel
   ```

### 4.5 Analytics Flow

1. **Dashboard Analytics Flow**
   ```
   User accesses analytics dashboard
   ↓
   Query analytics_application_funnel for funnel metrics
   ↓
   Query analytics_job_views for view metrics
   ↓
   Query job_applications for application metrics
   ↓
   Aggregate and process data
   ↓
   Return formatted analytics data
   ```

2. **Activity Tracking Flow**
   ```
   User performs activity
   ↓
   Record in analytics_user_activity
   ↓
   Update relevant counters (e.g., jobs.view_count)
   ```

## 5. Database Migration Strategy

### 5.1 Migration Approach

1. **Schema Creation**
   - Create new tables with proper relationships
   - Add indexes and constraints

2. **Data Migration**
   - Migrate data from existing tables to new schema
   - Transform data as needed to fit new structure
   - Validate data integrity after migration

3. **Application Updates**
   - Update API routes to use new schema
   - Update frontend components to handle new data structure
   - Implement new features enabled by the improved schema

### 5.2 Migration Steps

1. **Preparation Phase**
   - Create database backup
   - Set up test environment
   - Create migration scripts

2. **Execution Phase**
   - Run schema creation scripts
   - Run data migration scripts
   - Validate data integrity
   - Update application code

3. **Verification Phase**
   - Test all application features
   - Verify data consistency
   - Monitor performance

4. **Rollout Phase**
   - Deploy to production
   - Monitor for issues
   - Finalize documentation

## 6. Implementation Plan

### 6.1 Database Setup

1. **Create Database Schema**
   - Define all tables, relationships, and constraints
   - Set up indexes for performance optimization
   - Implement triggers for automated operations

2. **Database Utility Functions**
   - Create utility functions for common database operations
   - Implement data access patterns for each entity
   - Set up transaction management for complex operations

### 6.2 API Implementation

1. **Authentication API**
   - Update registration and login endpoints
   - Implement social login integration
   - Add email verification and role selection

2. **Profile Management API**
   - Create endpoints for profile CRUD operations
   - Implement skill management endpoints
   - Add education and experience management

3. **Job Management API**
   - Create job posting and editing endpoints
   - Implement job search and filtering
   - Add job recommendation algorithms

4. **Application Management API**
   - Create application submission endpoints
   - Implement application status management
   - Add interview scheduling and feedback

5. **Analytics API**
   - Create dashboard metrics endpoints
   - Implement detailed analytics queries
   - Add reporting and export functionality

### 6.3 Frontend Integration

1. **Authentication Components**
   - Update login and registration forms
   - Implement social login buttons
   - Add role selection interface

2. **Dashboard Components**
   - Update talent dashboard
   - Update hiring manager dashboard
   - Add admin dashboard

3. **Profile Components**
   - Update profile management interfaces
   - Add skill assessment components
   - Implement resume management

4. **Job Components**
   - Update job posting interface
   - Enhance job search and filtering
   - Improve application tracking

5. **Analytics Components**
   - Create analytics dashboard
   - Add visualization components
   - Implement reporting tools

## 7. Conclusion

This database design and data flow architecture provides a comprehensive foundation for the Zirak HR application. By implementing this design, the application will benefit from:

1. **Improved Data Organization**: Clear separation of concerns and proper relationships
2. **Enhanced Performance**: Optimized schema and indexes for efficient queries
3. **Better Scalability**: Structure that supports growth and additional features
4. **Advanced Analytics**: Comprehensive data collection for insightful analytics
5. **Robust Security**: Proper authentication and authorization mechanisms

The implementation of this design will enable the application to deliver a seamless experience for both talent and hiring managers while providing powerful tools for recruitment and job seeking.
