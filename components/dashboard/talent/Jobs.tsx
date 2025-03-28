'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function TalentJobs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    jobType: [],
    location: [],
    experience: [],
    salary: []
  })
  
  // Mock job data
  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      logo: '/images/companies/techcorp.png',
      location: 'San Francisco, CA (Remote)',
      jobType: 'Full-time',
      salary: '$120,000 - $150,000',
      experience: '5+ years',
      postedDate: '2 days ago',
      description: 'We are looking for a Senior Frontend Developer to join our team. You will be responsible for building user interfaces for our web applications using React and TypeScript.',
      skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Redux'],
      matchPercentage: 95
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      company: 'DesignHub',
      logo: '/images/companies/designhub.png',
      location: 'New York, NY (Hybrid)',
      jobType: 'Full-time',
      salary: '$90,000 - $120,000',
      experience: '3+ years',
      postedDate: '3 days ago',
      description: 'DesignHub is seeking a talented UX/UI Designer to create beautiful and functional user interfaces for our clients. You will work closely with developers and product managers.',
      skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'],
      matchPercentage: 88
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'WebSolutions',
      logo: '/images/companies/websolutions.png',
      location: 'Remote',
      jobType: 'Full-time',
      salary: '$110,000 - $140,000',
      experience: '4+ years',
      postedDate: '1 week ago',
      description: 'Join our team as a Full Stack Developer and work on exciting projects using modern technologies. You will be responsible for both frontend and backend development.',
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript'],
      matchPercentage: 82
    },
    {
      id: 4,
      title: 'Frontend Developer',
      company: 'CodeCraft',
      logo: '/images/companies/codecraft.png',
      location: 'Austin, TX (On-site)',
      jobType: 'Full-time',
      salary: '$90,000 - $110,000',
      experience: '2+ years',
      postedDate: '1 week ago',
      description: 'CodeCraft is looking for a Frontend Developer to join our growing team. You will work on building responsive and accessible web applications.',
      skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Responsive Design'],
      matchPercentage: 79
    },
    {
      id: 5,
      title: 'Product Designer',
      company: 'InnovateTech',
      logo: '/images/companies/innovatetech.png',
      location: 'Seattle, WA (Hybrid)',
      jobType: 'Full-time',
      salary: '$100,000 - $130,000',
      experience: '3+ years',
      postedDate: '2 weeks ago',
      description: 'We are seeking a Product Designer to join our team and help create intuitive and engaging user experiences for our products.',
      skills: ['UI Design', 'UX Research', 'Wireframing', 'Prototyping', 'User Testing'],
      matchPercentage: 75
    },
    {
      id: 6,
      title: 'React Developer',
      company: 'AppWorks',
      logo: '/images/companies/appworks.png',
      location: 'Remote',
      jobType: 'Contract',
      salary: '$70 - $90 per hour',
      experience: '3+ years',
      postedDate: '2 weeks ago',
      description: 'Looking for a React Developer for a 6-month contract with possibility of extension. You will work on building new features for our web application.',
      skills: ['React', 'JavaScript', 'Redux', 'HTML', 'CSS'],
      matchPercentage: 85
    },
    {
      id: 7,
      title: 'Frontend Engineer',
      company: 'TechStart',
      logo: '/images/companies/techstart.png',
      location: 'Chicago, IL (Remote)',
      jobType: 'Full-time',
      salary: '$100,000 - $125,000',
      experience: '3+ years',
      postedDate: '3 weeks ago',
      description: 'TechStart is looking for a Frontend Engineer to join our team. You will be responsible for building and maintaining our web applications.',
      skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
      matchPercentage: 80
    },
    {
      id: 8,
      title: 'UI Developer',
      company: 'DigitalSolutions',
      logo: '/images/companies/digitalsolutions.png',
      location: 'Boston, MA (On-site)',
      jobType: 'Part-time',
      salary: '$50 - $60 per hour',
      experience: '2+ years',
      postedDate: '3 weeks ago',
      description: 'We are seeking a part-time UI Developer to help us build beautiful and responsive user interfaces for our clients.',
      skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
      matchPercentage: 70
    }
  ]
  
  // Filter options
  const filterOptions = {
    jobType: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    location: ['Remote', 'On-site', 'Hybrid'],
    experience: ['0-1 years', '1-3 years', '3-5 years', '5+ years'],
    salary: ['$0 - $50,000', '$50,000 - $80,000', '$80,000 - $120,000', '$120,000+']
  }
  
  // Handle filter changes
  const handleFilterChange = (category, value) => {
    setSelectedFilters(prev => {
      const updated = { ...prev }
      
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter(item => item !== value)
      } else {
        updated[category] = [...updated[category], value]
      }
      
      return updated
    })
  }
  
  // Filter jobs based on search term and selected filters
  const filteredJobs = jobs.filter(job => {
    // Search term filter
    const searchMatch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Selected filters
    const jobTypeMatch = selectedFilters.jobType.length === 0 || 
                         selectedFilters.jobType.includes(job.jobType)
    
    const locationMatch = selectedFilters.location.length === 0 || 
                          selectedFilters.location.some(loc => job.location.includes(loc))
    
    const experienceMatch = selectedFilters.experience.length === 0 || 
                            selectedFilters.experience.some(exp => {
                              const jobExp = job.experience.replace('+ years', '').trim()
                              const filterExp = exp.includes('+') ? 
                                exp.replace('+ years', '').trim() : 
                                exp.split('-')[1].replace(' years', '').trim()
                              
                              return jobExp === filterExp
                            })
    
    const salaryMatch = selectedFilters.salary.length === 0 || 
                        selectedFilters.salary.some(sal => {
                          const jobSalary = job.salary.includes('per hour') ? 
                            parseFloat(job.salary.replace('$', '').split(' - ')[0]) * 2080 : 
                            parseFloat(job.salary.replace('$', '').replace(',', '').split(' - ')[1])
                          
                          const filterSalary = sal.includes('+') ? 
                            parseFloat(sal.replace('$', '').replace(',', '').replace('+', '')) : 
                            parseFloat(sal.replace('$', '').replace(',', '').split(' - ')[1])
                          
                          return jobSalary <= filterSalary
                        })
    
    return searchMatch && jobTypeMatch && locationMatch && experienceMatch && salaryMatch
  })
  
  // Sort jobs by match percentage
  const sortedJobs = [...filteredJobs].sort((a, b) => b.matchPercentage - a.matchPercentage)
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedFilters({
      jobType: [],
      location: [],
      experience: [],
      salary: []
    })
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Job Listings</h1>
      
      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search jobs by title, company, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Best Match</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="salary-high">Highest Salary</SelectItem>
                <SelectItem value="salary-low">Lowest Salary</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Job Type Filter */}
          <div>
            <h3 className="font-medium mb-2">Job Type</h3>
            <div className="space-y-2">
              {filterOptions.jobType.map((type, index) => (
                <div key={index} className="flex items-center">
                  <Checkbox
                    id={`job-type-${index}`}
                    checked={selectedFilters.jobType.includes(type)}
                    onCheckedChange={() => handleFilterChange('jobType', type)}
                  />
                  <label htmlFor={`job-type-${index}`} className="ml-2 text-sm">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Location Filter */}
          <div>
            <h3 className="font-medium mb-2">Location</h3>
            <div className="space-y-2">
              {filterOptions.location.map((location, index) => (
                <div key={index} className="flex items-center">
                  <Checkbox
                    id={`location-${index}`}
                    checked={selectedFilters.location.includes(location)}
                    onCheckedChange={() => handleFilterChange('location', location)}
                  />
                  <label htmlFor={`location-${index}`} className="ml-2 text-sm">
                    {location}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Experience Filter */}
          <div>
            <h3 className="font-medium mb-2">Experience</h3>
            <div className="space-y-2">
              {filterOptions.experience.map((exp, index) => (
                <div key={index} className="flex items-center">
                  <Checkbox
                    id={`experience-${index}`}
                    checked={selectedFilters.experience.includes(exp)}
                    onCheckedChange={() => handleFilterChange('experience', exp)}
                  />
                  <label htmlFor={`experience-${index}`} className="ml-2 text-sm">
                    {exp}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Salary Filter */}
          <div>
            <h3 className="font-medium mb-2">Salary Range</h3>
            <div className="space-y-2">
              {filterOptions.salary.map((salary, index) => (
                <div key={index} className="flex items-center">
                  <Checkbox
                    id={`salary-${index}`}
                    checked={selectedFilters.salary.includes(salary)}
                    onCheckedChange={() => handleFilterChange('salary', salary)}
                  />
                  <label htmlFor={`salary-${index}`} className="ml-2 text-sm">
                    {salary}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Job Listings */}
      <div className="space-y-6">
        {sortedJobs.length > 0 ? (
          sortedJobs.map(job => (
            <div 
              key={job.id} 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-[#d6ff00]"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-16 md:h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                  {job.logo ? (
                    <img src={job.logo} alt={`${job.company} logo`} className="w-12 h-12 object-contain" />
                  ) : (
                    <div className="text-xl font-bold text-gray-400">{job.company.charAt(0)}</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">{job.title}</h2>
                    <div className="flex items-center mt-2 md:mt-0">
                      <span className="inline-block bg-[#d6ff00] text-black px-2 py-1 rounded-full text-xs font-medium">
                        {job.matchPercentage}% Match
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="font-medium">{job.company}</span>
                    <span className="hidden md:inline mx-2">•</span>
                    <span>{job.location}</span>
                    <span className="hidden md:inline mx-2">•</span>
                    <span>{job.jobType}</span>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex flex-col md:flex-row md:items-center text-sm">
                      <span className="font-medium">{job.salary}</span>
                      <span className="hidden md:inline mx-2">•</span>
                      <span>{job.experience}</span>
                      <span className="hidden md:inline mx-2">•</span>
                      <span>Posted {job.postedDate}</span>
                    </div>
                    
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <Button variant="outline" size="sm">Save</Button>
                      <Button size="sm">Apply Now</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center">
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filter criteria to find more jobs.
            </p>
            <Button onClick={clearFilters}>Clear All Filters</Button>
          </div>
        )}
      </div>
    </div>
  )
}
