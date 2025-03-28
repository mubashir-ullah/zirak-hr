'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function TalentApplications() {
  const [selectedTab, setSelectedTab] = useState('active')
  
  // Mock application data
  const applications = {
    active: [
      {
        id: 1,
        jobTitle: 'Senior Frontend Developer',
        company: 'TechCorp',
        logo: '/images/companies/techcorp.png',
        location: 'San Francisco, CA (Remote)',
        appliedDate: '2023-03-05',
        status: 'Interview Scheduled',
        nextStep: 'Technical Interview on March 25, 2025',
        timeline: [
          { date: '2023-03-05', event: 'Application Submitted' },
          { date: '2023-03-10', event: 'Resume Screened' },
          { date: '2023-03-15', event: 'Initial Interview Completed' },
          { date: '2023-03-18', event: 'Technical Interview Scheduled' }
        ]
      },
      {
        id: 2,
        jobTitle: 'Frontend Developer',
        company: 'CodeCraft',
        logo: '/images/companies/codecraft.png',
        location: 'Remote',
        appliedDate: '2023-02-28',
        status: 'Application Reviewed',
        nextStep: 'Waiting for interview invitation',
        timeline: [
          { date: '2023-02-28', event: 'Application Submitted' },
          { date: '2023-03-08', event: 'Resume Screened' }
        ]
      },
      {
        id: 3,
        jobTitle: 'UX Researcher',
        company: 'UserFirst',
        logo: '/images/companies/userfirst.png',
        location: 'New York, NY (Hybrid)',
        appliedDate: '2023-02-20',
        status: 'Assessment',
        nextStep: 'Complete design challenge by March 22, 2025',
        timeline: [
          { date: '2023-02-20', event: 'Application Submitted' },
          { date: '2023-02-25', event: 'Resume Screened' },
          { date: '2023-03-02', event: 'Initial Interview Completed' },
          { date: '2023-03-10', event: 'Design Challenge Sent' }
        ]
      }
    ],
    archived: [
      {
        id: 4,
        jobTitle: 'Product Designer',
        company: 'DesignHub',
        logo: '/images/companies/designhub.png',
        location: 'Chicago, IL (On-site)',
        appliedDate: '2023-01-15',
        status: 'Rejected',
        nextStep: 'Application closed',
        timeline: [
          { date: '2023-01-15', event: 'Application Submitted' },
          { date: '2023-01-20', event: 'Resume Screened' },
          { date: '2023-01-28', event: 'Initial Interview Completed' },
          { date: '2023-02-05', event: 'Application Rejected' }
        ]
      },
      {
        id: 5,
        jobTitle: 'UI Developer',
        company: 'WebSolutions',
        logo: '/images/companies/websolutions.png',
        location: 'Remote',
        appliedDate: '2023-01-10',
        status: 'Withdrawn',
        nextStep: 'Application closed',
        timeline: [
          { date: '2023-01-10', event: 'Application Submitted' },
          { date: '2023-01-18', event: 'Resume Screened' },
          { date: '2023-01-25', event: 'Application Withdrawn by Candidate' }
        ]
      }
    ],
    offers: [
      {
        id: 6,
        jobTitle: 'Frontend Engineer',
        company: 'InnovateTech',
        logo: '/images/companies/innovatetech.png',
        location: 'Boston, MA (Hybrid)',
        appliedDate: '2023-02-01',
        status: 'Offer Received',
        salary: '$125,000/year',
        benefits: ['Health Insurance', 'Dental & Vision', '401(k) with 4% match', 'Unlimited PTO', 'Remote work options'],
        deadline: '2023-03-25',
        timeline: [
          { date: '2023-02-01', event: 'Application Submitted' },
          { date: '2023-02-08', event: 'Resume Screened' },
          { date: '2023-02-15', event: 'Initial Interview Completed' },
          { date: '2023-02-22', event: 'Technical Interview Completed' },
          { date: '2023-03-01', event: 'Final Interview Completed' },
          { date: '2023-03-10', event: 'Offer Received' }
        ]
      }
    ]
  }
  
  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }
  
  // Get status color based on application status
  const getStatusColor = (status) => {
    switch(status) {
      case 'Interview Scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'Application Reviewed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'Assessment':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'Withdrawn':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      case 'Offer Received':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="recent">Recent Applications</SelectItem>
            <SelectItem value="interviews">Upcoming Interviews</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="active" onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            Active
            <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs">
              {applications.active.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="offers">
            Offers
            <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs">
              {applications.offers.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived
            <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs">
              {applications.archived.length}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-6">
          {applications.active.map(app => (
            <div key={app.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-16 md:h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                  {app.logo ? (
                    <img src={app.logo} alt={`${app.company} logo`} className="w-12 h-12 object-contain" />
                  ) : (
                    <div className="text-xl font-bold text-gray-400">{app.company.charAt(0)}</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">{app.jobTitle}</h2>
                    <div className="flex items-center mt-2 md:mt-0">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="font-medium">{app.company}</span>
                    <span className="hidden md:inline mx-2">•</span>
                    <span>{app.location}</span>
                    <span className="hidden md:inline mx-2">•</span>
                    <span>Applied on {formatDate(app.appliedDate)}</span>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
                    <h3 className="font-medium mb-2">Next Step</h3>
                    <p className="text-sm">{app.nextStep}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Application Timeline</h3>
                    <div className="relative">
                      {app.timeline.map((event, index) => (
                        <div key={index} className="flex mb-4 last:mb-0">
                          <div className="mr-4 relative">
                            <div className="w-3 h-3 rounded-full bg-[#d6ff00] mt-1.5"></div>
                            {index < app.timeline.length - 1 && (
                              <div className="absolute top-3 left-1.5 w-0.5 h-full bg-gray-200 dark:bg-gray-600 -translate-x-1/2"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{event.event}</p>
                            <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">Contact Recruiter</Button>
                    <Button variant="outline" size="sm">Withdraw Application</Button>
                    <Button size="sm">View Job Details</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="offers" className="space-y-6">
          {applications.offers.map(app => (
            <div key={app.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-16 md:h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                  {app.logo ? (
                    <img src={app.logo} alt={`${app.company} logo`} className="w-12 h-12 object-contain" />
                  ) : (
                    <div className="text-xl font-bold text-gray-400">{app.company.charAt(0)}</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">{app.jobTitle}</h2>
                    <div className="flex items-center mt-2 md:mt-0">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="font-medium">{app.company}</span>
                    <span className="hidden md:inline mx-2">•</span>
                    <span>{app.location}</span>
                    <span className="hidden md:inline mx-2">•</span>
                    <span>Applied on {formatDate(app.appliedDate)}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                      <h3 className="font-medium mb-2">Compensation</h3>
                      <p className="text-xl font-semibold text-[#d6ff00]">{app.salary}</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                      <h3 className="font-medium mb-2">Offer Deadline</h3>
                      <p className="text-sm">Respond by <span className="font-semibold">{formatDate(app.deadline)}</span></p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
                    <h3 className="font-medium mb-2">Benefits</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {app.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm">{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Application Timeline</h3>
                    <div className="relative">
                      {app.timeline.map((event, index) => (
                        <div key={index} className="flex mb-4 last:mb-0">
                          <div className="mr-4 relative">
                            <div className="w-3 h-3 rounded-full bg-[#d6ff00] mt-1.5"></div>
                            {index < app.timeline.length - 1 && (
                              <div className="absolute top-3 left-1.5 w-0.5 h-full bg-gray-200 dark:bg-gray-600 -translate-x-1/2"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{event.event}</p>
                            <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">Negotiate Offer</Button>
                    <Button variant="outline" size="sm">Request Extension</Button>
                    <Button variant="destructive" size="sm">Decline Offer</Button>
                    <Button size="sm">Accept Offer</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-6">
          {applications.archived.map(app => (
            <div key={app.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-16 md:h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                  {app.logo ? (
                    <img src={app.logo} alt={`${app.company} logo`} className="w-12 h-12 object-contain" />
                  ) : (
                    <div className="text-xl font-bold text-gray-400">{app.company.charAt(0)}</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">{app.jobTitle}</h2>
                    <div className="flex items-center mt-2 md:mt-0">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="font-medium">{app.company}</span>
                    <span className="hidden md:inline mx-2">•</span>
                    <span>{app.location}</span>
                    <span className="hidden md:inline mx-2">•</span>
                    <span>Applied on {formatDate(app.appliedDate)}</span>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Application Timeline</h3>
                    <div className="relative">
                      {app.timeline.map((event, index) => (
                        <div key={index} className="flex mb-4 last:mb-0">
                          <div className="mr-4 relative">
                            <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 mt-1.5"></div>
                            {index < app.timeline.length - 1 && (
                              <div className="absolute top-3 left-1.5 w-0.5 h-full bg-gray-200 dark:bg-gray-600 -translate-x-1/2"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{event.event}</p>
                            <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">View Job Details</Button>
                    <Button variant="outline" size="sm">Similar Jobs</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
