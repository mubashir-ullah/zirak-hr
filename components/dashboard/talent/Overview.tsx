'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TalentOverview() {
  const [profileCompletion, setProfileCompletion] = useState(45)
  
  // Mock data for job matches
  const jobMatches = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA (Remote)',
      matchPercentage: 95,
      salary: '$120,000 - $150,000',
      postedDate: '2 days ago'
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      company: 'DesignHub',
      location: 'New York, NY (Hybrid)',
      matchPercentage: 88,
      salary: '$90,000 - $120,000',
      postedDate: '3 days ago'
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'WebSolutions',
      location: 'Remote',
      matchPercentage: 82,
      salary: '$110,000 - $140,000',
      postedDate: '1 week ago'
    }
  ]
  
  // Mock data for active applications
  const activeApplications = [
    {
      id: 1,
      title: 'Product Manager',
      company: 'InnovateTech',
      status: 'Interview Scheduled',
      appliedDate: '2 weeks ago',
      nextStep: 'Technical Interview on March 25, 2025'
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'CodeCraft',
      status: 'Application Reviewed',
      appliedDate: '3 weeks ago',
      nextStep: 'Waiting for interview invitation'
    },
    {
      id: 3,
      title: 'UX Researcher',
      company: 'UserFirst',
      status: 'Assessment',
      appliedDate: '1 month ago',
      nextStep: 'Complete design challenge by March 22, 2025'
    }
  ]
  
  // Mock data for recent activity
  const recentActivity = [
    {
      id: 1,
      message: 'Your profile was viewed by 5 recruiters',
      time: '2 days ago'
    },
    {
      id: 2,
      message: 'New job match: Senior Frontend Developer at TechCorp',
      time: '3 days ago'
    },
    {
      id: 3,
      message: 'Application status updated: Interview scheduled',
      time: '5 days ago'
    },
    {
      id: 4,
      message: 'You received a message from InnovateTech recruiter',
      time: '1 week ago'
    },
    {
      id: 5,
      message: 'Your resume was downloaded by CodeCraft',
      time: '1 week ago'
    }
  ]
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome Back!</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Profile Completion</h2>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-[#d6ff00] h-2 rounded-full" 
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span>{profileCompletion}% complete</span>
            <Button variant="link" className="p-0 h-auto text-[#d6ff00]">
              Complete Profile
            </Button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Job Matches</h2>
          <p className="text-3xl font-bold text-[#d6ff00]">{jobMatches.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">New job matches based on your profile</p>
          <Button variant="outline" size="sm" className="dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10">View All Matches</Button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Applications</h2>
          <p className="text-3xl font-bold text-[#d6ff00]">{activeApplications.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active job applications</p>
          <Button variant="outline" size="sm" className="dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10">Manage Applications</Button>
        </div>
      </div>
      
      {/* Top Job Matches */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Top Job Matches</h2>
          <Button variant="link" className="text-[#d6ff00]">View All</Button>
        </div>
        
        <div className="space-y-4">
          {jobMatches.map(job => (
            <div key={job.id} className="border rounded-lg p-4 hover:border-[#d6ff00] transition-colors">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.company} • {job.location}</p>
                </div>
                <div className="flex items-center">
                  <span className="inline-block bg-[#d6ff00] text-black px-2 py-1 rounded-full text-xs font-medium">
                    {job.matchPercentage}% Match
                  </span>
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm">{job.salary}</p>
                <p className="text-xs text-gray-500">{job.postedDate}</p>
              </div>
              <div className="mt-3 flex space-x-2">
                <Button size="sm">Apply Now</Button>
                <Button variant="outline" size="sm">Save</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Active Applications */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Active Applications</h2>
          <Button variant="link" className="text-[#d6ff00]">View All</Button>
        </div>
        
        <div className="space-y-4">
          {activeApplications.map(app => (
            <div key={app.id} className="border rounded-lg p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{app.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{app.company}</p>
                </div>
                <div className="flex items-center">
                  <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                    {app.status}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm"><span className="font-medium">Applied:</span> {app.appliedDate}</p>
                <p className="text-sm mt-1"><span className="font-medium">Next Step:</span> {app.nextStep}</p>
              </div>
              <div className="mt-3">
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map(activity => (
            <div key={activity.id} className="p-4 border rounded-lg dark:border-gray-700">
              <p className="font-medium">{activity.message}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
