'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  Briefcase, Search, MapPin, Clock, Building, CreditCard, 
  Filter, Star, StarOff, Send, Save, Bookmark, BookmarkCheck,
  ChevronLeft, ChevronRight, SlidersHorizontal, X, Check
} from 'lucide-react'
import JobDetailView from './jobs/JobDetailView'
import JobApplicationForm from './jobs/JobApplicationForm'
import MyApplications from './jobs/MyApplications'
import SavedJobs from './jobs/SavedJobs'

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  jobType: string;
  experienceLevel: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  remote: boolean;
  applicationDeadline: string;
  postedDate: string;
  status: string;
  applicationCount: number;
  viewCount: number;
  industry: string;
  companySize: string;
  benefits: string[];
  educationLevel: string;
  germanLevel: string;
  visaSponsorship: boolean;
  matchPercentage?: number;
  matchedSkills?: number;
  isSaved?: boolean;
  isApplied?: boolean;
}

export default function JobsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'recommended' | 'browse' | 'saved' | 'applications'>('recommended')
  const [isLoading, setIsLoading] = useState(true)
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [browseJobs, setBrowseJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showJobDetail, setShowJobDetail] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    experienceLevel: '',
    remote: false,
    visaSponsorship: false,
    minSalary: '',
    skills: [] as string[]
  })
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch recommended jobs on component mount
  useEffect(() => {
    fetchRecommendedJobs()
  }, [])

  // Fetch browse jobs when filters or pagination changes
  useEffect(() => {
    if (activeTab === 'browse') {
      fetchBrowseJobs()
    }
  }, [activeTab, filters, pagination.currentPage])

  // Fetch recommended jobs from API
  const fetchRecommendedJobs = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch('/api/talent/jobs/recommended')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch recommended jobs')
      }
      
      const data = await response.json()
      setRecommendedJobs(data.jobs || [])
    } catch (error) {
      console.error('Error fetching recommended jobs:', error)
      setError('Failed to load recommended jobs. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch browse jobs from API with filters
  const fetchBrowseJobs = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Build query string from filters
      const queryParams = new URLSearchParams()
      
      if (searchQuery) {
        queryParams.append('query', searchQuery)
      }
      
      if (filters.location) {
        queryParams.append('location', filters.location)
      }
      
      if (filters.jobType) {
        queryParams.append('jobType', filters.jobType)
      }
      
      if (filters.experienceLevel) {
        queryParams.append('experienceLevel', filters.experienceLevel)
      }
      
      if (filters.remote) {
        queryParams.append('remote', 'true')
      }
      
      if (filters.visaSponsorship) {
        queryParams.append('visaSponsorship', 'true')
      }
      
      if (filters.minSalary) {
        queryParams.append('minSalary', filters.minSalary)
      }
      
      if (filters.skills.length > 0) {
        queryParams.append('skills', filters.skills.join(','))
      }
      
      queryParams.append('page', pagination.currentPage.toString())
      queryParams.append('limit', '10')
      
      const response = await fetch(`/api/talent/jobs/browse?${queryParams.toString()}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch jobs')
      }
      
      const data = await response.json()
      
      setBrowseJobs(data.jobs || [])
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        totalJobs: data.pagination?.totalJobs || 0
      })
    } catch (error) {
      console.error('Error fetching browse jobs:', error)
      setError('Failed to load jobs. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveTab('browse')
    setPagination({ ...pagination, currentPage: 1 })
    fetchBrowseJobs()
  }

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination({ ...pagination, currentPage: 1 })
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      location: '',
      jobType: '',
      experienceLevel: '',
      remote: false,
      visaSponsorship: false,
      minSalary: '',
      skills: []
    })
    setSearchQuery('')
    setPagination({ ...pagination, currentPage: 1 })
  }

  // Add skill to filter
  const handleAddSkill = (skill: string) => {
    if (!filters.skills.includes(skill)) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
    }
  }

  // Remove skill from filter
  const handleRemoveSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  // Handle job bookmark toggle
  const handleBookmarkJob = async (job: Job) => {
    try {
      const action = job.isSaved ? 'unsave' : 'save'
      
      const response = await fetch(`/api/talent/jobs/${job._id}/${action}`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} job`)
      }
      
      // Update job in state
      if (activeTab === 'recommended') {
        setRecommendedJobs(prevJobs => 
          prevJobs.map(j => 
            j._id === job._id ? { ...j, isSaved: !j.isSaved } : j
          )
        )
      } else if (activeTab === 'browse') {
        setBrowseJobs(prevJobs => 
          prevJobs.map(j => 
            j._id === job._id ? { ...j, isSaved: !j.isSaved } : j
          )
        )
      }
      
      // If unsaving from saved jobs tab, remove it
      if (activeTab === 'saved' && job.isSaved) {
        // This will be handled by the SavedJobs component
      }
      
      setSuccessMessage(job.isSaved ? 'Job removed from saved jobs' : 'Job saved successfully')
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error toggling job bookmark:', error)
      setError('Failed to update saved jobs. Please try again later.')
    }
  }

  // Handle job application
  const handleApplyToJob = (job: Job) => {
    setSelectedJob(job)
    setShowApplicationForm(true)
  }

  // Handle job application submission
  const handleApplicationSubmit = async (applicationData: any) => {
    try {
      if (!selectedJob) return
      
      const response = await fetch(`/api/talent/jobs/${selectedJob._id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit application')
      }
      
      // Update job in state to show as applied
      if (activeTab === 'recommended') {
        setRecommendedJobs(prevJobs => 
          prevJobs.map(j => 
            j._id === selectedJob._id ? { ...j, isApplied: true } : j
          )
        )
      } else if (activeTab === 'browse') {
        setBrowseJobs(prevJobs => 
          prevJobs.map(j => 
            j._id === selectedJob._id ? { ...j, isApplied: true } : j
          )
        )
      }
      
      setSuccessMessage('Application submitted successfully')
      setShowApplicationForm(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error submitting application:', error)
      setError('Failed to submit application. Please try again later.')
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // View job details
  const handleViewJobDetails = (job: Job) => {
    setSelectedJob(job)
    setShowJobDetail(true)
  }

  // Close job details
  const handleCloseJobDetails = () => {
    setShowJobDetail(false)
    setSelectedJob(null)
  }

  // Close application form
  const handleCloseApplicationForm = () => {
    setShowApplicationForm(false)
  }

  // Render job card
  const renderJobCard = (job: Job) => (
    <Card 
      key={job._id} 
      className={`mb-4 hover:shadow-md transition-shadow ${
        job.matchPercentage && job.matchPercentage > 80 
          ? 'border-l-4 border-l-green-500' 
          : job.matchPercentage && job.matchPercentage > 60
            ? 'border-l-4 border-l-yellow-500'
            : ''
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Building className="h-4 w-4 mr-1" />
              {job.company}
            </CardDescription>
          </div>
          <div className="flex items-center">
            {job.matchPercentage && (
              <Badge className={`mr-2 ${
                job.matchPercentage > 80 
                  ? 'bg-green-100 text-green-800' 
                  : job.matchPercentage > 60
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {job.matchPercentage}% Match
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleBookmarkJob(job)
              }}
            >
              {job.isSaved ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            {job.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="h-4 w-4 mr-1" />
            {job.jobType}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="h-4 w-4 mr-1" />
            {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
          </div>
        </div>
        
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {job.skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="outline" className={
                job.matchedSkills && job.matchedSkills > 0 && filters.skills.includes(skill)
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : ''
              }>
                {skill}
              </Badge>
            ))}
            {job.skills.length > 5 && (
              <Badge variant="outline">+{job.skills.length - 5} more</Badge>
            )}
          </div>
        )}
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {job.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="text-xs text-gray-500">
          Posted {new Date(job.postedDate).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewJobDetails(job)}
          >
            View Details
          </Button>
          <Button 
            size="sm"
            disabled={job.isApplied}
            onClick={() => handleApplyToJob(job)}
          >
            {job.isApplied ? 'Applied' : 'Apply Now'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 lg:p-6">
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold">Find Your Next Opportunity</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Browse jobs that match your skills and experience
        </p>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4">
          {successMessage}
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
          <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommended" className="mt-0">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Jobs Recommended For You</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Based on your profile, skills, and preferences
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : recommendedJobs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recommended Jobs Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Complete your profile and add more skills to get personalized job recommendations.
              </p>
              <Button onClick={() => setActiveTab('browse')}>
                Browse All Jobs
              </Button>
            </div>
          ) : (
            <div>
              {recommendedJobs.map(job => renderJobCard(job))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="browse" className="mt-0">
          <div className="mb-6">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search jobs by title, company, or keyword" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </form>
            
            {showFilters && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleResetFilters}
                  >
                    Reset
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="location" className="mb-1 block">Location</Label>
                    <Select 
                      value={filters.location} 
                      onValueChange={(value) => handleFilterChange('location', value)}
                    >
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Any location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any location</SelectItem>
                        <SelectItem value="Berlin">Berlin</SelectItem>
                        <SelectItem value="Munich">Munich</SelectItem>
                        <SelectItem value="Hamburg">Hamburg</SelectItem>
                        <SelectItem value="Frankfurt">Frankfurt</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="jobType" className="mb-1 block">Job Type</Label>
                    <Select 
                      value={filters.jobType} 
                      onValueChange={(value) => handleFilterChange('jobType', value)}
                    >
                      <SelectTrigger id="jobType">
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any type</SelectItem>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="experienceLevel" className="mb-1 block">Experience Level</Label>
                    <Select 
                      value={filters.experienceLevel} 
                      onValueChange={(value) => handleFilterChange('experienceLevel', value)}
                    >
                      <SelectTrigger id="experienceLevel">
                        <SelectValue placeholder="Any level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any level</SelectItem>
                        <SelectItem value="Entry">Entry Level</SelectItem>
                        <SelectItem value="Mid">Mid Level</SelectItem>
                        <SelectItem value="Senior">Senior Level</SelectItem>
                        <SelectItem value="Lead">Lead</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="minSalary" className="mb-1 block">Minimum Salary</Label>
                    <Select 
                      value={filters.minSalary} 
                      onValueChange={(value) => handleFilterChange('minSalary', value)}
                    >
                      <SelectTrigger id="minSalary">
                        <SelectValue placeholder="Any salary" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any salary</SelectItem>
                        <SelectItem value="30000">€30,000+</SelectItem>
                        <SelectItem value="40000">€40,000+</SelectItem>
                        <SelectItem value="50000">€50,000+</SelectItem>
                        <SelectItem value="60000">€60,000+</SelectItem>
                        <SelectItem value="70000">€70,000+</SelectItem>
                        <SelectItem value="80000">€80,000+</SelectItem>
                        <SelectItem value="90000">€90,000+</SelectItem>
                        <SelectItem value="100000">€100,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remote" 
                      checked={filters.remote}
                      onCheckedChange={(checked) => 
                        handleFilterChange('remote', checked === true)
                      }
                    />
                    <Label htmlFor="remote">Remote Jobs Only</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="visaSponsorship" 
                      checked={filters.visaSponsorship}
                      onCheckedChange={(checked) => 
                        handleFilterChange('visaSponsorship', checked === true)
                      }
                    />
                    <Label htmlFor="visaSponsorship">Visa Sponsorship Available</Label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label className="mb-1 block">Skills</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {filters.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {skill}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    {filters.skills.length === 0 && (
                      <span className="text-sm text-gray-500">Add skills to filter by</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a skill" 
                      id="skillInput"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.target as HTMLInputElement
                          if (input.value.trim()) {
                            handleAddSkill(input.value.trim())
                            input.value = ''
                          }
                        }
                      }}
                    />
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('skillInput') as HTMLInputElement
                        if (input.value.trim()) {
                          handleAddSkill(input.value.trim())
                          input.value = ''
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : browseJobs.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Try adjusting your search or filters to find more jobs.
                </p>
                <Button onClick={handleResetFilters}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Showing {browseJobs.length} of {pagination.totalJobs} jobs
                  </p>
                </div>
                
                <div>
                  {browseJobs.map(job => renderJobCard(job))}
                </div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={pagination.currentPage === 1}
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === pagination.totalPages || 
                          Math.abs(page - pagination.currentPage) <= 1
                        )
                        .map((page, i, arr) => (
                          <React.Fragment key={page}>
                            {i > 0 && arr[i - 1] !== page - 1 && (
                              <span className="text-gray-500">...</span>
                            )}
                            <Button
                              variant={pagination.currentPage === page ? "default" : "outline"}
                              size="icon"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))
                      }
                      
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="saved" className="mt-0">
          <SavedJobs onJobSelect={handleViewJobDetails} />
        </TabsContent>
        
        <TabsContent value="applications" className="mt-0">
          <MyApplications onJobSelect={handleViewJobDetails} />
        </TabsContent>
      </Tabs>
      
      {/* Job Detail Modal */}
      {showJobDetail && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <JobDetailView 
              job={selectedJob} 
              onClose={handleCloseJobDetails}
              onApply={() => {
                handleCloseJobDetails()
                handleApplyToJob(selectedJob)
              }}
              onBookmark={() => handleBookmarkJob(selectedJob)}
            />
          </div>
        </div>
      )}
      
      {/* Job Application Modal */}
      {showApplicationForm && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <JobApplicationForm 
              job={selectedJob}
              onClose={handleCloseApplicationForm}
              onSubmit={handleApplicationSubmit}
            />
          </div>
        </div>
      )}
    </div>
  )
}
