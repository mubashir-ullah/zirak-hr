/**
 * Migration Testing Script
 * 
 * This script tests various API endpoints to ensure they work correctly with Supabase.
 * It simulates user actions and verifies the responses.
 * 
 * Usage:
 * 1. Set up environment variables in .env file
 * 2. Run: node scripts/test-migration.js
 */

require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase environment variables are not set');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Base URL for API requests
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test credentials
const TEST_USER = {
  email: 'test-talent@example.com',
  password: 'Password123!',
  name: 'Test Talent'
};

// Test job data
const TEST_JOB = {
  title: 'Test Job',
  company: 'Test Company',
  location: 'Remote',
  description: 'This is a test job posting',
  requirements: ['JavaScript', 'React'],
  salary_range: { min: 50000, max: 80000 },
  job_type: 'Full-time',
  status: 'active'
};

// Store authentication token and user data
let authToken = null;
let userData = null;

// Helper function to make authenticated API requests
async function apiRequest(method, endpoint, data = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    
    const response = await axios({
      method,
      url,
      data,
      headers
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`API request failed: ${method} ${endpoint}`, error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

// Test authentication
async function testAuthentication() {
  console.log('\n--- Testing Authentication ---');
  
  // Test registration
  console.log('Testing registration...');
  const registerResponse = await apiRequest('POST', '/api/auth/register', TEST_USER);
  
  if (!registerResponse.success) {
    console.log('Registration failed, but this might be expected if the user already exists');
    console.log('Proceeding with login...');
  } else {
    console.log('Registration successful');
  }
  
  // Test login
  console.log('Testing login...');
  const loginResponse = await apiRequest('POST', '/api/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  
  if (!loginResponse.success) {
    console.error('Login failed, cannot proceed with further tests');
    return false;
  }
  
  console.log('Login successful');
  authToken = loginResponse.data.token || loginResponse.data.user.token;
  userData = loginResponse.data.user;
  
  return true;
}

// Test talent profile
async function testTalentProfile() {
  console.log('\n--- Testing Talent Profile ---');
  
  // Get profile
  console.log('Getting talent profile...');
  const profileResponse = await apiRequest('GET', '/api/talent/profile');
  
  if (!profileResponse.success) {
    console.log('No profile found, creating one...');
    
    // Create profile
    const createProfileResponse = await apiRequest('POST', '/api/talent/profile', {
      full_name: TEST_USER.name,
      title: 'Software Developer',
      bio: 'Test bio',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: [
        {
          title: 'Software Developer',
          company: 'Test Company',
          start_date: '2020-01-01',
          end_date: '2022-01-01',
          description: 'Worked on various projects'
        }
      ],
      education: [
        {
          institution: 'Test University',
          degree: 'Computer Science',
          start_date: '2016-01-01',
          end_date: '2020-01-01'
        }
      ]
    });
    
    if (!createProfileResponse.success) {
      console.error('Failed to create talent profile');
      return false;
    }
    
    console.log('Talent profile created successfully');
  } else {
    console.log('Talent profile found');
    
    // Update profile
    console.log('Updating talent profile...');
    const updateProfileResponse = await apiRequest('PUT', '/api/talent/profile', {
      bio: 'Updated test bio',
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript']
    });
    
    if (!updateProfileResponse.success) {
      console.error('Failed to update talent profile');
      return false;
    }
    
    console.log('Talent profile updated successfully');
  }
  
  return true;
}

// Test job applications
async function testJobApplications() {
  console.log('\n--- Testing Job Applications ---');
  
  // Get a job to apply for
  console.log('Getting available jobs...');
  const jobsResponse = await apiRequest('GET', '/api/jobs');
  
  if (!jobsResponse.success || !jobsResponse.data.jobs || jobsResponse.data.jobs.length === 0) {
    console.log('No jobs found, creating a test job using admin privileges...');
    
    // Create a job directly in the database
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .insert([{
        ...TEST_JOB,
        posted_by: userData.id,
        posted_date: new Date().toISOString()
      }])
      .select();
    
    if (jobError) {
      console.error('Failed to create test job:', jobError);
      return false;
    }
    
    TEST_JOB.id = jobData[0].id;
    console.log('Test job created successfully');
  } else {
    TEST_JOB.id = jobsResponse.data.jobs[0].id;
    console.log('Using existing job for application tests');
  }
  
  // Apply for a job
  console.log('Applying for a job...');
  const applyResponse = await apiRequest('POST', '/api/talent/applications', {
    job_id: TEST_JOB.id,
    cover_letter: 'This is a test application',
    resume_url: 'https://example.com/resume.pdf'
  });
  
  if (!applyResponse.success) {
    console.error('Failed to apply for job');
    return false;
  }
  
  console.log('Job application submitted successfully');
  
  // Get applications
  console.log('Getting job applications...');
  const applicationsResponse = await apiRequest('GET', '/api/talent/applications');
  
  if (!applicationsResponse.success) {
    console.error('Failed to get job applications');
    return false;
  }
  
  console.log(`Found ${applicationsResponse.data.applications?.length || 0} job applications`);
  
  return true;
}

// Test saved jobs
async function testSavedJobs() {
  console.log('\n--- Testing Saved Jobs ---');
  
  // Save a job
  console.log('Saving a job...');
  const saveResponse = await apiRequest('POST', '/api/talent/jobs/saved', {
    job_id: TEST_JOB.id
  });
  
  if (!saveResponse.success) {
    console.error('Failed to save job');
    return false;
  }
  
  console.log('Job saved successfully');
  
  // Get saved jobs
  console.log('Getting saved jobs...');
  const savedJobsResponse = await apiRequest('GET', '/api/talent/jobs/saved');
  
  if (!savedJobsResponse.success) {
    console.error('Failed to get saved jobs');
    return false;
  }
  
  console.log(`Found ${savedJobsResponse.data.savedJobs?.length || 0} saved jobs`);
  
  // Unsave a job
  console.log('Unsaving a job...');
  const unsaveResponse = await apiRequest('DELETE', `/api/talent/jobs/saved?jobId=${TEST_JOB.id}`);
  
  if (!unsaveResponse.success) {
    console.error('Failed to unsave job');
    return false;
  }
  
  console.log('Job unsaved successfully');
  
  return true;
}

// Test notifications
async function testNotifications() {
  console.log('\n--- Testing Notifications ---');
  
  // Get notifications
  console.log('Getting notifications...');
  const notificationsResponse = await apiRequest('GET', '/api/notifications');
  
  if (!notificationsResponse.success) {
    console.error('Failed to get notifications');
    return false;
  }
  
  console.log(`Found ${notificationsResponse.data.notifications?.length || 0} notifications`);
  
  // If there are notifications, mark one as read
  if (notificationsResponse.data.notifications?.length > 0) {
    const notificationId = notificationsResponse.data.notifications[0].id;
    
    console.log('Marking notification as read...');
    const markReadResponse = await apiRequest('PATCH', '/api/notifications', {
      notificationId
    });
    
    if (!markReadResponse.success) {
      console.error('Failed to mark notification as read');
      return false;
    }
    
    console.log('Notification marked as read successfully');
  }
  
  return true;
}

// Test dashboard
async function testDashboard() {
  console.log('\n--- Testing Dashboard ---');
  
  // Get dashboard data
  console.log('Getting dashboard data...');
  const dashboardResponse = await apiRequest('GET', '/api/dashboard');
  
  if (!dashboardResponse.success) {
    console.error('Failed to get dashboard data');
    return false;
  }
  
  console.log('Dashboard data retrieved successfully');
  console.log('Profile completion:', dashboardResponse.data.profileCompletionPercentage + '%');
  
  return true;
}

// Run all tests
async function runTests() {
  console.log('Starting migration tests...');
  
  // Test authentication first
  const authSuccess = await testAuthentication();
  if (!authSuccess) {
    console.error('Authentication tests failed, aborting remaining tests');
    return;
  }
  
  // Run other tests
  const testResults = {
    talentProfile: await testTalentProfile(),
    jobApplications: await testJobApplications(),
    savedJobs: await testSavedJobs(),
    notifications: await testNotifications(),
    dashboard: await testDashboard()
  };
  
  // Print summary
  console.log('\n--- Test Summary ---');
  Object.entries(testResults).forEach(([test, success]) => {
    console.log(`${test}: ${success ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(testResults).every(result => result);
  console.log(`\nOverall result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
}

// Run the tests
runTests()
  .then(() => {
    console.log('Testing complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
