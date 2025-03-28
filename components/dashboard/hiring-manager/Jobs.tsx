'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

// Mock data for job listings
const MOCK_JOBS = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'San Francisco, CA (Remote)',
    type: 'Full-time',
    salary: '$120,000 - $150,000',
    postedDate: '2025-03-01',
    status: 'active',
    applicants: 8,
    description: 'We are looking for a Senior Frontend Developer with expertise in React, TypeScript, and modern frontend frameworks.',
    requirements: [
      'At least 5 years of experience with React',
      'Strong TypeScript skills',
      'Experience with Next.js',
      'Knowledge of modern CSS frameworks like Tailwind',
      'Experience with state management solutions'
    ]
  },
  {
    id: 2,
    title: 'UX/UI Designer',
    department: 'Design',
    location: 'New York, NY (Hybrid)',
    type: 'Full-time',
    salary: '$90,000 - $120,000',
    postedDate: '2025-03-05',
    status: 'active',
    applicants: 5,
    description: 'We are seeking a talented UX/UI Designer to create beautiful, intuitive interfaces for our products.',
    requirements: [
      'At least 3 years of experience in UX/UI design',
      'Proficiency in Figma and Adobe Creative Suite',
      'Experience conducting user research',
      'Strong portfolio demonstrating UI design skills',
      'Knowledge of design systems'
    ]
  },
  {
    id: 3,
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    salary: '$110,000 - $140,000',
    postedDate: '2025-03-10',
    status: 'active',
    applicants: 4,
    description: 'We need a skilled Backend Developer to help build scalable and reliable server-side applications.',
    requirements: [
      'At least 4 years of experience in backend development',
      'Strong knowledge of Node.js and Express',
      'Experience with MongoDB or other NoSQL databases',
      'Familiarity with AWS or other cloud platforms',
      'Understanding of RESTful API design'
    ]
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    department: 'Operations',
    location: 'Chicago, IL (Onsite)',
    type: 'Full-time',
    salary: '$130,000 - $160,000',
    postedDate: '2025-03-12',
    status: 'active',
    applicants: 3,
    description: 'We are looking for a DevOps Engineer to help us build and maintain our infrastructure and deployment pipelines.',
    requirements: [
      'At least 5 years of experience in DevOps',
      'Strong knowledge of Docker and Kubernetes',
      'Experience with CI/CD pipelines',
      'Familiarity with AWS or other cloud platforms',
      'Understanding of infrastructure as code'
    ]
  },
  {
    id: 5,
    title: 'Product Manager',
    department: 'Product',
    location: 'Remote',
    type: 'Full-time',
    salary: '$100,000 - $130,000',
    postedDate: '2025-03-15',
    status: 'active',
    applicants: 6,
    description: 'We are seeking a Product Manager to help define and execute our product roadmap.',
    requirements: [
      'At least 3 years of experience in product management',
      'Experience with Agile methodologies',
      'Strong analytical skills',
      'Excellent communication skills',
      'Ability to work with cross-functional teams'
    ]
  }
]

export default function HiringManagerJobs() {
  const [jobs, setJobs] = useState(MOCK_JOBS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [showNewJobForm, setShowNewJobForm] = useState(false)
  const [selectedJob, setSelectedJob] = useState<number | null>(null)
  
  // New job form state
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: ''
  })

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment = !filterDepartment || job.department === filterDepartment
    const matchesLocation = !filterLocation || job.location.includes(filterLocation)
    
    return matchesSearch && matchesDepartment && matchesLocation
  })

  const handleNewJobSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create new job
    const newJob = {
      id: jobs.length + 1,
      title: newJobForm.title,
      department: newJobForm.department,
      location: newJobForm.location,
      type: newJobForm.type,
      salary: newJobForm.salary,
      postedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      applicants: 0,
      description: newJobForm.description,
      requirements: newJobForm.requirements.split('\n').filter(req => req.trim() !== '')
    }
    
    // Add to jobs list
    setJobs([...jobs, newJob as any])
    
    // Reset form
    setNewJobForm({
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      salary: '',
      description: '',
      requirements: ''
    })
    
    // Hide form
    setShowNewJobForm(false)
    
    // Show success message
    toast({
      title: "Job Posted",
      description: "Your job has been successfully posted.",
    })
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewJobForm(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Listings</h1>
        <Button onClick={() => setShowNewJobForm(!showNewJobForm)}>
          {showNewJobForm ? 'Cancel' : 'Post New Job'}
        </Button>
      </div>
      
      {showNewJobForm ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Post a New Job</h2>
          <form onSubmit={handleNewJobSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <Input
                  name="title"
                  value={newJobForm.title}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <Input
                  name="department"
                  value={newJobForm.department}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  name="location"
                  value={newJobForm.location}
                  onChange={handleFormChange}
                  required
                  placeholder="City, State (Remote/Hybrid/Onsite)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Type</label>
                <select
                  name="type"
                  value={newJobForm.type}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Salary Range</label>
                <Input
                  name="salary"
                  value={newJobForm.salary}
                  onChange={handleFormChange}
                  placeholder="$XX,XXX - $XX,XXX"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Job Description</label>
              <Textarea
                name="description"
                value={newJobForm.description}
                onChange={handleFormChange}
                rows={4}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Requirements (one per line)</label>
              <Textarea
                name="requirements"
                value={newJobForm.requirements}
                onChange={handleFormChange}
                rows={5}
                placeholder="Enter each requirement on a new line"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit">Post Job</Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Search and filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Search</label>
                <Input
                  type="text"
                  placeholder="Search by title or description"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  type="text"
                  placeholder="Filter by location"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Jobs list */}
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <div 
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {job.department} • {job.location} • {job.type}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className="inline-block bg-[#d6ff00] text-black px-3 py-1 rounded-full text-sm font-medium">
                        {job.applicants} Applicants
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-col md:flex-row md:items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="mr-4">Salary: {job.salary}</span>
                    <span className="mr-4">Posted: {job.postedDate}</span>
                    <span className="capitalize">Status: {job.status}</span>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                    >
                      {selectedJob === job.id ? 'Hide Details' : 'View Details'}
                    </Button>
                  </div>
                  
                  {selectedJob === job.id && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Job Description</h4>
                      <p className="text-sm">{job.description}</p>
                      
                      <h4 className="font-medium mt-4 mb-2">Requirements</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {job.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                      
                      <div className="mt-4 flex space-x-2">
                        <Button size="sm">View Applicants</Button>
                        <Button size="sm" variant="outline">Edit Job</Button>
                        <Button size="sm" variant="destructive">Close Job</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredJobs.length === 0 && (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center">
                <p className="text-gray-500 dark:text-gray-400">No jobs match your search criteria.</p>
              </div>
            )}
          </div>
        </>
      )}
      
      <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Job Posting Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</h3>
            <p className="text-2xl font-bold">1,245</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Application Rate</h3>
            <p className="text-2xl font-bold">5.2%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Time to Hire</h3>
            <p className="text-2xl font-bold">18 days</p>
          </div>
        </div>
      </div>
    </div>
  )
}
