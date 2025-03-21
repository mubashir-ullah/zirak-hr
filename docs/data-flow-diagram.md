# Zirak HR Data Flow and Integration Diagram

## Overview

This document outlines the data flow and integration points between the Talent Dashboard and HR Dashboard in the Zirak HR platform. As a platform specifically designed for IT professionals, the system focuses on technical skills and creates value through efficient matching of talent with appropriate job opportunities.

## Dashboard Relationship Diagram

```
┌─────────────────────────────────────────┐                 ┌─────────────────────────────────────────┐
│                                         │                 │                                         │
│           TALENT DASHBOARD              │                 │             HR DASHBOARD                │
│                                         │                 │                                         │
│  ┌─────────────┐      ┌─────────────┐   │                 │  ┌─────────────┐      ┌─────────────┐   │
│  │             │      │             │   │                 │  │             │      │             │   │
│  │   Profile   │      │   Resume    │   │                 │  │   Profile   │      │ Talent Pool │   │
│  │   Section   │◄────►│   Section   │   │                 │  │   Section   │      │   Section   │   │
│  │             │      │             │   │                 │  │             │      │             │   │
│  └──────┬──────┘      └──────┬──────┘   │                 │  └─────────────┘      └──────┬──────┘   │
│         │                    │          │                 │                              │          │
│         ▼                    ▼          │                 │                              ▼          │
│  ┌─────────────┐      ┌─────────────┐   │                 │  ┌─────────────┐      ┌─────────────┐   │
│  │             │      │             │   │                 │  │             │      │             │   │
│  │    Jobs     │◄────►│ Applications│   │      ◄─────────►│  │    Jobs     │◄────►│  Analytics  │   │
│  │   Section   │      │   Section   │   │                 │  │ Management  │      │   Section   │   │
│  │             │      │             │   │                 │  │             │      │             │   │
│  └─────────────┘      └─────────────┘   │                 │  └─────────────┘      └─────────────┘   │
│                                         │                 │                                         │
└─────────────────────────────────────────┘                 └─────────────────────────────────────────┘
                    ▲                                                           ▲
                    │                                                           │
                    │                                                           │
                    ▼                                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                   │
│                                       SHARED DATABASE                                             │
│                                                                                                   │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────┐  │
│  │             │      │             │      │             │      │             │      │         │  │
│  │    Users    │◄────►│   Talents   │◄────►│    Jobs     │◄────►│ Applications│◄────►│ Matches │  │
│  │ Collection  │      │ Collection  │      │ Collection  │      │ Collection  │      │Collection│  │
│  │             │      │             │      │             │      │             │      │         │  │
│  └─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘      └─────────┘  │
│                                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
                    ▲                                                           ▲
                    │                                                           │
                    │                                                           │
                    ▼                                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                   │
│                                      AI/ML SERVICES                                               │
│                                                                                                   │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────┐  │
│  │             │      │             │      │             │      │             │      │         │  │
│  │   Resume    │      │   Skills    │      │    Job      │      │  Candidate  │      │ Interview│  │
│  │   Parser    │      │ Suggestion  │      │  Matching   │      │  Ranking    │      │Generator │  │
│  │             │      │             │      │             │      │             │      │         │  │
│  └─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘      └─────────┘  │
│                                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow and Interrelationships

### 1. User Authentication and Role Assignment

- **Shared Data**: User credentials, role (Talent or HR)
- **Flow Direction**: Bidirectional
- **Integration Points**:
  - Users sign in through social login providers (Google, GitHub, LinkedIn, Apple)
  - System checks user role and redirects to appropriate dashboard
  - User profile information is stored in the shared database

### 2. Profile Management

#### Talent Dashboard → HR Dashboard

- **Shared Data**: 
  - Technical skills (IT-specific skills only)
  - Experience level
  - Education details
  - Language proficiency
  - Availability
  - Location preferences
  - Visa requirements

- **Flow Direction**: Talent → HR
- **Integration Points**:
  - Talent profiles are visible in the HR Dashboard's Talent Pool
  - Profile completion percentage affects visibility in search results
  - Technical skills are used for job matching algorithms

#### HR Dashboard → Talent Dashboard

- **Shared Data**:
  - Company information
  - HR manager contact details
  - Job requirements and preferences

- **Flow Direction**: HR → Talent
- **Integration Points**:
  - HR profiles are visible to talents when they apply for jobs
  - Company information is displayed on job listings

### 3. Job Management

#### HR Dashboard → Talent Dashboard

- **Shared Data**:
  - Job listings
  - Required skills (technical only)
  - Job location
  - Compensation range
  - Work arrangement (remote/hybrid/on-site)

- **Flow Direction**: HR → Talent
- **Integration Points**:
  - Jobs created in HR Dashboard appear in Talent Dashboard
  - Job matching algorithms use technical skills for recommendations
  - Job status updates (open, closed, filled) sync between dashboards

#### Talent Dashboard → HR Dashboard

- **Shared Data**:
  - Job applications
  - Application status
  - Talent match score

- **Flow Direction**: Talent → HR
- **Integration Points**:
  - Applications submitted by talents appear in HR Dashboard
  - Match scores are calculated based on technical skills alignment
  - Application status updates sync between dashboards

### 4. AI/ML Services Integration

- **Resume Parsing**:
  - Extracts technical skills from uploaded resumes
  - Suggests skills to add to talent profiles
  - Provides structured data for job matching

- **Skills Suggestion**:
  - Recommends relevant technical skills based on profile
  - Suggests complementary skills based on current skill set
  - Updates as industry trends change

- **Job Matching**:
  - Calculates match scores between talents and jobs
  - Prioritizes technical skills alignment
  - Considers experience level and other factors

- **Candidate Ranking**:
  - Ranks candidates for specific job openings
  - Provides insights on skill gaps
  - Suggests interview questions based on skills

## Use Cases

### Use Case 1: Talent Profile Creation and Job Matching

1. Talent creates profile with technical skills
2. AI suggests additional relevant technical skills
3. Profile is stored in database
4. Job matching algorithm identifies suitable jobs
5. Matched jobs appear in Talent Dashboard
6. Talent applies for jobs
7. Applications appear in HR Dashboard with match scores

### Use Case 2: HR Job Posting and Candidate Matching

1. HR creates job posting with required technical skills
2. Job is stored in database
3. Matching algorithm identifies suitable talents
4. Job appears in relevant Talent Dashboards
5. HR views matched candidates in Talent Pool
6. HR reviews applications and updates status
7. Status updates sync to Talent Dashboard

### Use Case 3: Resume Parsing and Skill Extraction

1. Talent uploads resume
2. AI parses resume and extracts technical skills
3. Skills are suggested to talent for profile enhancement
4. Talent confirms relevant skills
5. Profile is updated with confirmed skills
6. Match scores are recalculated
7. New job matches may appear based on updated skills

## Technical Implementation

The data flow between dashboards is implemented through:

1. **Shared MongoDB Collections**:
   - Users
   - Talents
   - Jobs
   - Applications
   - Matches

2. **API Endpoints**:
   - `/api/talent/profile` - Talent profile management
   - `/api/talent/profile/summary` - Profile summary for sidebar
   - `/api/hr/talent-pool` - Talent pool access for HR
   - `/api/jobs` - Job listing management
   - `/api/jobs/[id]/applications` - Application management

3. **AI/ML Services**:
   - Python FastAPI service for resume parsing
   - Skill suggestion algorithms
   - Job matching and scoring

## Security and Privacy Considerations

1. **Data Access Control**:
   - HR users can view talent profiles but with limited personal information
   - Talents can only view their own profile and application status
   - Job details are visible to all but applicant information is restricted

2. **Data Protection**:
   - Personal information is encrypted
   - Resume storage follows data protection regulations
   - User consent is required for data sharing

## Future Enhancements

1. **Enhanced Skill Taxonomy**:
   - More granular technical skill categorization
   - Skill level assessment (beginner, intermediate, expert)
   - Automated skill verification

2. **Advanced Matching Algorithms**:
   - Personality and culture fit assessment
   - Project-based matching
   - Team composition optimization

3. **Integration with Learning Platforms**:
   - Skill gap identification
   - Recommended learning resources
   - Certification tracking
