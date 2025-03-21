# Technical Skills Data Flow Between Talent and HR Dashboards

## Overview

This document outlines how technical skills data flows between the Talent Dashboard and HR Dashboard in the Zirak HR platform. The platform is specifically designed for IT professionals, focusing exclusively on technical skills relevant to the IT industry.

## Technical Skills Integration

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                 │
│                                     TECHNICAL SKILLS ECOSYSTEM                                  │
│                                                                                                 │
└───────────────────────────────────────────┬─────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                 │
│                                     SKILLS DATABASE & API                                       │
│                                                                                                 │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐ │
│  │                 │      │                 │      │                 │      │                 │ │
│  │  Programming    │      │    Frontend     │      │    Backend      │      │    Database     │ │
│  │   Languages     │      │  Technologies   │      │  Technologies   │      │  Technologies   │ │
│  │                 │      │                 │      │                 │      │                 │ │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘      └─────────────────┘ │
│                                                                                                 │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐ │
│  │                 │      │                 │      │                 │      │                 │ │
│  │     DevOps      │      │     Testing     │      │     Mobile      │      │      AI/ML      │ │
│  │  Technologies   │      │  Technologies   │      │  Technologies   │      │  Technologies   │ │
│  │                 │      │                 │      │                 │      │                 │ │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘      └─────────────────┘ │
│                                                                                                 │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐ │
│  │                 │      │                 │      │                 │      │                 │ │
│  │   Blockchain    │      │      AR/VR      │      │       IoT       │      │  Cybersecurity  │ │
│  │  Technologies   │      │  Technologies   │      │  Technologies   │      │  Technologies   │ │
│  │                 │      │                 │      │                 │      │                 │ │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘      └─────────────────┘ │
│                                                                                                 │
└─────────────┬───────────────────────────────────┬─────────────────────────────────┬─────────────┘
              │                                   │                                 │
              ▼                                   ▼                                 ▼
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────────┐
│                         │      │                         │      │                             │
│   /api/talent/skills/   │      │  /api/talent/profile/   │      │    /api/hr/talent-pool/     │
│      technical          │◄────►│        route.ts         │◄────►│         route.ts            │
│       route.ts          │      │                         │      │                             │
│                         │      │                         │      │                             │
└─────────────┬───────────┘      └─────────────┬───────────┘      └─────────────┬───────────────┘
              │                                 │                                │
              │                                 │                                │
              ▼                                 ▼                                ▼
┌─────────────────────────────────────┐      ┌─────────────────────────────────────────────────┐
│                                     │      │                                                 │
│         TALENT DASHBOARD            │      │                HR DASHBOARD                     │
│                                     │      │                                                 │
│  ┌─────────────────────────────┐    │      │    ┌─────────────────────────────────────┐     │
│  │                             │    │      │    │                                     │     │
│  │      ProfilePage.tsx        │    │      │    │       TalentPoolSection.tsx        │     │
│  │                             │    │      │    │                                     │     │
│  │  - Technical Skills Input   │    │      │    │  - Technical Skills Filtering      │     │
│  │  - Skill Validation         │    │      │    │  - Skill Category Navigation       │     │
│  │  - AI Skill Suggestions     │────┼──────┼────│  - Candidate Matching by Skills    │     │
│  │  - Resume Skill Extraction  │    │      │    │  - Technical Skill Requirements    │     │
│  │                             │    │      │    │                                     │     │
│  └─────────────────────────────┘    │      │    └─────────────────────────────────────┘     │
│                                     │      │                                                 │
└─────────────────────────────────────┘      └─────────────────────────────────────────────────┘
```

## Technical Skills Data Flow

### 1. Skills Database and API Layer

The central repository of technical skills is organized by categories:

- **Programming Languages**: JavaScript, TypeScript, Python, Java, C#, etc.
- **Frontend Technologies**: React, Angular, Vue.js, Next.js, etc.
- **Backend Technologies**: Node.js, Express.js, Django, Spring Boot, etc.
- **Database Technologies**: SQL, MongoDB, PostgreSQL, Redis, etc.
- **DevOps Technologies**: Docker, Kubernetes, AWS, Azure, etc.
- **Testing Technologies**: Jest, Cypress, Selenium, etc.
- **Mobile Technologies**: React Native, Flutter, iOS, Android, etc.
- **AI/ML Technologies**: TensorFlow, PyTorch, NLP, Computer Vision, etc.
- **Blockchain Technologies**: Ethereum, Solidity, Smart Contracts, etc.
- **AR/VR Technologies**: Unity, Unreal Engine, WebXR, etc.
- **IoT Technologies**: Embedded Systems, Arduino, Raspberry Pi, etc.
- **Cybersecurity Technologies**: Penetration Testing, Encryption, Authentication, etc.

### 2. API Endpoints

Three main API endpoints facilitate the flow of technical skills data:

1. **`/api/talent/skills/technical`**:
   - Provides access to the curated list of technical skills
   - Supports filtering by category and search query
   - Ensures only IT-relevant skills are available in the system

2. **`/api/talent/profile`**:
   - Handles saving and retrieving talent profiles
   - Validates that skills added to profiles are technical in nature
   - Stores the association between talents and their technical skills

3. **`/api/hr/talent-pool`**:
   - Retrieves talent profiles with their technical skills for HR review
   - Supports filtering candidates by specific technical skills
   - Enables matching between job requirements and candidate skills

### 3. Talent Dashboard Implementation

The **ProfilePage.tsx** component in the Talent Dashboard:

- Restricts skill input to only technical/IT skills
- Validates entered skills against the technical skills database
- Provides AI-powered skill suggestions based on resume content
- Extracts technical skills from uploaded resumes
- Organizes skills in a user-friendly interface
- Ensures data quality by standardizing skill names

### 4. HR Dashboard Implementation

The **TalentPoolSection.tsx** component in the HR Dashboard:

- Provides advanced filtering by technical skill categories
- Displays technical skills prominently in candidate profiles
- Enables searching for candidates with specific technical skills
- Calculates match scores based on technical skill alignment
- Organizes skills by categories for easier navigation
- Offers visual indicators for skill categories (programming, frontend, backend, database)

## Data Flow Scenarios

### Scenario 1: Talent Profile Creation

1. Talent user enters the ProfilePage in the Talent Dashboard
2. User attempts to add skills to their profile
3. System validates each skill against `/api/talent/skills/technical` API
4. Only valid technical skills are accepted and added to the profile
5. Profile data with validated technical skills is saved via `/api/talent/profile` API
6. Skills become available for matching in the HR Dashboard

### Scenario 2: Resume Upload and Skill Extraction

1. Talent user uploads their resume
2. Resume parsing service extracts text content
3. AI service identifies potential technical skills in the resume
4. Extracted skills are validated against the technical skills database
5. Validated technical skills are suggested to the user
6. User confirms relevant skills to add to their profile
7. Confirmed skills are saved to the user's profile

### Scenario 3: HR Talent Search

1. HR user navigates to the Talent Pool section
2. User selects technical skill categories of interest
3. System loads relevant skills for the selected categories
4. HR user adds specific technical skills to the filter criteria
5. System queries the database for candidates with matching skills
6. Candidates with the required technical skills are displayed
7. HR user can further refine search by adding more technical skills

## Technical Implementation Details

### Skills Validation Process

```javascript
// Pseudocode for skill validation
function validateTechnicalSkill(skillName) {
  // Check if skill exists in our predefined list
  if (technicalSkillsList.includes(skillName)) {
    return { valid: true, skill: skillName };
  }
  
  // If not found exactly, search for similar skills
  const similarSkills = technicalSkillsList.filter(skill => 
    skill.toLowerCase().includes(skillName.toLowerCase())
  );
  
  if (similarSkills.length > 0) {
    // Return the closest match
    return { valid: true, skill: similarSkills[0], suggestion: true };
  }
  
  // No valid technical skill found
  return { valid: false };
}
```

### Skill Matching Algorithm

```javascript
// Pseudocode for skill matching
function calculateSkillMatch(candidateSkills, jobRequirements) {
  // Count how many required skills the candidate has
  const matchedSkills = jobRequirements.filter(requiredSkill =>
    candidateSkills.some(candidateSkill => 
      candidateSkill.toLowerCase() === requiredSkill.toLowerCase()
    )
  );
  
  // Calculate match percentage
  const matchPercentage = (matchedSkills.length / jobRequirements.length) * 100;
  
  return {
    matchPercentage,
    matchedSkills,
    missingSkills: jobRequirements.filter(skill => !matchedSkills.includes(skill))
  };
}
```

## Future Enhancements

1. **Skill Proficiency Levels**:
   - Add ability to specify proficiency level for each technical skill
   - Implement more granular matching based on skill proficiency

2. **Skill Verification**:
   - Implement technical assessments to verify claimed skills
   - Integrate with certification platforms for skill validation

3. **Skill Trends Analysis**:
   - Track demand for specific technical skills over time
   - Provide insights on emerging technical skills in the industry

4. **Learning Recommendations**:
   - Suggest learning resources for missing skills
   - Create personalized learning paths based on career goals

5. **Team Composition Optimization**:
   - Analyze technical skill distribution within teams
   - Recommend candidates to fill skill gaps in existing teams
