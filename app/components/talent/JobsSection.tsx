'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FaSearch, FaFilter, FaMapMarkerAlt, FaBriefcase, FaClock, FaEuroSign, FaLanguage, FaGlobe } from 'react-icons/fa'

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  employmentType: string;
  experienceLevel: string;
  remoteOption: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  germanRequired: string;
  visaSponsorship: boolean;
  applicationDeadline: string;
  matchScore?: number;
}

export default function JobsSection() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'recommendations' | 'search'>('recommendations')
  const [isLoading, setIsLoading] = useState(true)
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [searchResults, setSearchResults] = useState<Job[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState('')
  
  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    location: '',
    employmentType: '',
    experienceLevel: '',
    remoteOption: '',
    visaSponsorship: false,
    germanRequired: '',
    skills: [] as string[]
  })
  
  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  })

  // Fetch job recommendations when component mounts
  useEffect(() => {
    if (activeTab === 'recommendations') {
      fetchRecommendedJobs()
    }
  }, [activeTab])

  // Fetch job recommendations from the API
  const fetchRecommendedJobs = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch('/api/talent/jobs/recommendations')
      
      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized, redirect to login
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch job recommendations')
      }
      
      const data = await response.json()
      setRecommendedJobs(data.recommendations || [])
    } catch (error) {
      console.error('Error fetching job recommendations:', error)
      setError('Failed to load job recommendations. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // Search for jobs with filters
  const searchJobs = async (page = 1) => {
    try {
      setIsLoading(true)
      setError('')
      
      // Build query string from filters
      const params = new URLSearchParams()
      
      if (searchFilters.keyword) {
        params.append('keyword', searchFilters.keyword)
      }
      
      if (searchFilters.location) {
        params.append('location', searchFilters.location)
      }
      
      if (searchFilters.employmentType) {
        params.append('employmentType', searchFilters.employmentType)
      }
      
      if (searchFilters.experienceLevel) {
        params.append('experienceLevel', searchFilters.experienceLevel)
      }
      
      if (searchFilters.remoteOption) {
        params.append('remoteOption', searchFilters.remoteOption)
      }
      
      if (searchFilters.visaSponsorship) {
        params.append('visaSponsorship', 'true')
      }
      
      if (searchFilters.germanRequired) {
        params.append('germanRequired', searchFilters.germanRequired)
      }
      
      searchFilters.skills.forEach(skill => {
        params.append('skill', skill)
      })
      
      // Add pagination
      params.append('page', page.toString())
      params.append('limit', pagination.limit.toString())
      
      const response = await fetch(`/api/talent/jobs/search?${params.toString()}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized, redirect to login
          router.push('/login')
          return
        }
        throw new Error('Failed to search jobs')
      }
      
      const data = await response.json()
      setSearchResults(data.jobs || [])
      setPagination(data.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
      })
    } catch (error) {
      console.error('Error searching jobs:', error)
      setError('Failed to search jobs. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveTab('search')
    searchJobs(1)
  }

  // Handle filter changes
  const handleFilterChange = (name: string, value: string | boolean | string[]) => {
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    searchJobs(newPage)
  }

  // Add a skill to search filters
  const handleAddSkill = (skill: string) => {
    if (skill && !searchFilters.skills.includes(skill)) {
      handleFilterChange('skills', [...searchFilters.skills, skill])
    }
  }

  // Remove a skill from search filters
  const handleRemoveSkill = (skill: string) => {
    handleFilterChange('skills', searchFilters.skills.filter(s => s !== skill))
  }

  // Render a job card
  const renderJobCard = (job: Job) => (
    <div key={job._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      {job.matchScore !== undefined && (
        <div className="flex justify-end mb-2">
          <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
            {job.matchScore}% Match
          </span>
        </div>
      )}
      
      <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
      
      <div className="flex flex-wrap text-sm text-gray-600 dark:text-gray-300 mb-3">
        <div className="flex items-center mr-4 mb-2">
          <FaBriefcase className="mr-1" />
          <span>{job.company}</span>
        </div>
        
        <div className="flex items-center mr-4 mb-2">
          <FaMapMarkerAlt className="mr-1" />
          <span>{job.location}</span>
        </div>
        
        <div className="flex items-center mr-4 mb-2">
          <FaClock className="mr-1" />
          <span>{job.employmentType}</span>
        </div>
        
        {job.salary.min > 0 && (
          <div className="flex items-center mr-4 mb-2">
            <FaEuroSign className="mr-1" />
            <span>{job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}</span>
          </div>
        )}
        
        <div className="flex items-center mr-4 mb-2">
          <FaLanguage className="mr-1" />
          <span>German: {job.germanRequired}</span>
        </div>
        
        <div className="flex items-center mb-2">
          <FaGlobe className="mr-1" />
          <span>{job.remoteOption}</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
        {job.description}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.slice(0, 5).map((skill, index) => (
          <span 
            key={index} 
            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
        {job.skills.length > 5 && (
          <span className="text-xs text-gray-500">+{job.skills.length - 5} more</span>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {job.visaSponsorship ? 'Visa Sponsorship Available' : 'No Visa Sponsorship'}
        </div>
        
        <button 
          className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
          onClick={() => router.push(`/dashboard/talent/jobs/${job._id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  )

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl lg:text-2xl font-bold">Jobs</h2>
        
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === 'recommendations' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setActiveTab('recommendations')}
          >
            Recommendations
          </button>
          
          <button
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === 'search' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setActiveTab('search')}
          >
            Search
          </button>
        </div>
      </div>
      
      {activeTab === 'search' && (
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 mb-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or keyword"
                value={searchFilters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
              />
            </div>
            
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg flex items-center justify-center"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
            
            <button
              type="submit"
              className="md:w-auto w-full px-6 py-2 bg-black text-white rounded-lg"
            >
              Search
            </button>
          </form>
          
          {showFilters && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="City or Country"
                    value={searchFilters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Employment Type</label>
                  <select
                    value={searchFilters.employmentType}
                    onChange={(e) => handleFilterChange('employmentType', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                  >
                    <option value="">Any</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Experience Level</label>
                  <select
                    value={searchFilters.experienceLevel}
                    onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                  >
                    <option value="">Any</option>
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Remote Option</label>
                  <select
                    value={searchFilters.remoteOption}
                    onChange={(e) => handleFilterChange('remoteOption', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                  >
                    <option value="">Any</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">German Required</label>
                  <select
                    value={searchFilters.germanRequired}
                    onChange={(e) => handleFilterChange('germanRequired', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                  >
                    <option value="">Any</option>
                    <option value="None">None</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="visaSponsorship"
                    checked={searchFilters.visaSponsorship}
                    onChange={(e) => handleFilterChange('visaSponsorship', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="visaSponsorship" className="text-sm font-medium">
                    Visa Sponsorship Available
                  </label>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {searchFilters.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 text-white hover:text-gray-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="skillInput"
                    placeholder="Add a skill"
                    className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSkill((e.target as HTMLInputElement).value)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('skillInput') as HTMLInputElement
                      handleAddSkill(input.value)
                      input.value = ''
                    }}
                    className="px-4 py-2 bg-black text-white rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
          {activeTab === 'recommendations' ? (
            <>
              <h3 className="text-lg font-semibold mb-4">Recommended for You</h3>
              {recommendedJobs.length > 0 ? (
                <div className="space-y-4">
                  {recommendedJobs.map(job => renderJobCard(job))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No job recommendations found.</p>
                  <p className="text-sm">Complete your profile and add skills to get personalized job recommendations.</p>
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-4">Search Results</h3>
              {searchResults.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {searchResults.map(job => renderJobCard(job))}
                  </div>
                  
                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className={`px-3 py-1 rounded-md ${
                            pagination.page === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                          .filter(page => {
                            // Show first page, last page, current page, and pages around current page
                            return (
                              page === 1 ||
                              page === pagination.pages ||
                              Math.abs(page - pagination.page) <= 1
                            )
                          })
                          .map((page, index, array) => {
                            // Add ellipsis if there are gaps
                            const showEllipsis = index > 0 && page - array[index - 1] > 1
                            
                            return (
                              <div key={page} className="flex items-center">
                                {showEllipsis && (
                                  <span className="px-2 text-gray-500">...</span>
                                )}
                                
                                <button
                                  onClick={() => handlePageChange(page)}
                                  className={`px-3 py-1 rounded-md ${
                                    pagination.page === page
                                      ? 'bg-black text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {page}
                                </button>
                              </div>
                            )
                          })}
                        
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages}
                          className={`px-3 py-1 rounded-md ${
                            pagination.page === pagination.pages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No jobs found matching your search criteria.</p>
                  <p className="text-sm">Try adjusting your filters or search for something else.</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
