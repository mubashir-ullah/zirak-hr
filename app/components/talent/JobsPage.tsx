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
      
      const response = await fetch(`/api/talent/jobs/search?${queryParams.toString()}`)
      
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
        currentPage: data.pagination.page,
        totalPages: data.pagination.pages,
        totalJobs: data.pagination.total
      })
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setError('Failed to load jobs. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination({ ...pagination, currentPage: 1 })
    fetchBrowseJobs()
  }

  // Reset filters
  const resetFilters = () => {
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

  // Handle job selection
  const handleJobSelect = (job: Job) => {
    setSelectedJob(job)
    setShowJobDetail(true)
    setShowApplicationForm(false)
  }

  // Handle apply button click
  const handleApplyClick = () => {
    if (selectedJob) {
      setShowApplicationForm(true)
    }
  }

  // Handle job application submission
  const handleApplicationSubmit = async (applicationData: { coverLetter: string, resumeUrl: string, notes: string }) => {
    if (!selectedJob) return
    
    try {
      const response = await fetch('/api/talent/jobs/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobId: selectedJob._id,
          ...applicationData
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit application')
      }
      
      setSuccessMessage('Application submitted successfully!')
      setShowApplicationForm(false)
      
      // Update job status in both lists
      const updateJobLists = (jobs: Job[]) => 
        jobs.map(job => 
          job._id === selectedJob._id 
            ? { ...job, isApplied: true } 
            : job
        )
      
      setRecommendedJobs(updateJobLists(recommendedJobs))
      setBrowseJobs(updateJobLists(browseJobs))
      
      // Update selected job
      setSelectedJob({ ...selectedJob, isApplied: true })
      
      // Refresh applications list if on that tab
      if (activeTab === 'applications') {
        // This would be handled by the MyApplications component
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit application')
    }
  }

  // Handle save/unsave job
  const handleSaveJob = async (job: Job) => {
    try {
      if (job.isSaved) {
        // Unsave job
        const response = await fetch(`/api/talent/jobs/save?jobId=${job._id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to unsave job')
        }
        
        // Update job status in both lists
        const updateJobLists = (jobs: Job[]) => 
          jobs.map(j => 
            j._id === job._id 
              ? { ...j, isSaved: false } 
              : j
          )
        
        setRecommendedJobs(updateJobLists(recommendedJobs))
        setBrowseJobs(updateJobLists(browseJobs))
        
        // Update selected job if it's the same one
        if (selectedJob && selectedJob._id === job._id) {
          setSelectedJob({ ...selectedJob, isSaved: false })
        }
        
        setSuccessMessage('Job removed from saved jobs')
      } else {
        // Save job
        const response = await fetch('/api/talent/jobs/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            jobId: job._id,
            notes: ''
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save job')
        }
        
        // Update job status in both lists
        const updateJobLists = (jobs: Job[]) => 
          jobs.map(j => 
            j._id === job._id 
              ? { ...j, isSaved: true } 
              : j
          )
        
        setRecommendedJobs(updateJobLists(recommendedJobs))
        setBrowseJobs(updateJobLists(browseJobs))
        
        // Update selected job if it's the same one
        if (selectedJob && selectedJob._id === job._id) {
          setSelectedJob({ ...selectedJob, isSaved: true })
        }
        
        setSuccessMessage('Job saved successfully')
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error)
      setError(error instanceof Error ? error.message : 'Failed to save/unsave job')
    }
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, currentPage: newPage })
  }

  // Render job card
  const renderJobCard = (job: Job) => (
    <Card 
      key={job._id} 
      className={`mb-4 cursor-pointer hover:shadow-md transition-shadow ${
        selectedJob && selectedJob._id === job._id ? 'border-primary' : ''
      }`}
      onClick={() => handleJobSelect(job)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Building className="h-4 w-4 mr-1" />
              {job.company}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleSaveJob(job)
            }}
          >
            {job.isSaved ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline" className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {job.location}
            {job.remote && " (Remote)"}
          </Badge>
          <Badge variant="outline" className="flex items-center">
            <Briefcase className="h-3 w-3 mr-1" />
            {job.jobType}
          </Badge>
          <Badge variant="outline" className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(job.postedDate).toLocaleDateString()}
          </Badge>
          {job.visaSponsorship && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Visa Sponsorship
            </Badge>
          )}
        </div>
        
        {job.salary?.min && job.salary?.max && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <CreditCard className="h-4 w-4 mr-1" />
            {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}
          </div>
        )}
        
        {job.matchPercentage !== undefined && (
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Match Score</span>
              <span className="text-sm font-medium">{job.matchPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2" 
                style={{ width: `${job.matchPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {job.matchedSkills} skills matched your profile
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex justify-between w-full">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleJobSelect(job)
            }}
          >
            View Details
          </Button>
          <Button 
            variant={job.isApplied ? "outline" : "default"} 
            size="sm"
            disabled={job.isApplied}
            onClick={(e) => {
              e.stopPropagation()
              handleJobSelect(job)
              handleApplyClick()
            }}
          >
            {job.isApplied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Applied
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Apply
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as any)}
        className="w-full"
      >
        <div className="p-4 border-b">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
            <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
              {successMessage}
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <TabsContent value="recommended" className="mt-0">
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-2">Recommended Jobs</h2>
                  <p className="text-muted-foreground">
                    Jobs matching your skills and preferences
                  </p>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : recommendedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedJobs.map(job => renderJobCard(job))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No recommended jobs found</h3>
                    <p className="text-muted-foreground">
                      Complete your profile and add more skills to get job recommendations
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="browse" className="mt-0">
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-2">Browse Jobs</h2>
                  <p className="text-muted-foreground">
                    Search and filter jobs based on your criteria
                  </p>
                </div>
                
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search jobs by title, company, or skills"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button type="submit">Search</Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                  
                  {showFilters && (
                    <div className="mt-4 p-4 border rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            placeholder="City, Country"
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="jobType">Job Type</Label>
                          <Select
                            value={filters.jobType}
                            onValueChange={(value) => setFilters({ ...filters, jobType: value })}
                          >
                            <SelectTrigger id="jobType">
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All types</SelectItem>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="freelance">Freelance</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="experienceLevel">Experience Level</Label>
                          <Select
                            value={filters.experienceLevel}
                            onValueChange={(value) => setFilters({ ...filters, experienceLevel: value })}
                          >
                            <SelectTrigger id="experienceLevel">
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All levels</SelectItem>
                              <SelectItem value="entry">Entry Level</SelectItem>
                              <SelectItem value="junior">Junior</SelectItem>
                              <SelectItem value="mid-level">Mid-Level</SelectItem>
                              <SelectItem value="senior">Senior</SelectItem>
                              <SelectItem value="lead">Lead</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="minSalary">Minimum Salary</Label>
                          <Input
                            id="minSalary"
                            type="number"
                            placeholder="Minimum salary"
                            value={filters.minSalary}
                            onChange={(e) => setFilters({ ...filters, minSalary: e.target.value })}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-6">
                          <Checkbox
                            id="remote"
                            checked={filters.remote}
                            onCheckedChange={(checked) => 
                              setFilters({ ...filters, remote: checked === true })
                            }
                          />
                          <Label htmlFor="remote">Remote Only</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-6">
                          <Checkbox
                            id="visaSponsorship"
                            checked={filters.visaSponsorship}
                            onCheckedChange={(checked) => 
                              setFilters({ ...filters, visaSponsorship: checked === true })
                            }
                          />
                          <Label htmlFor="visaSponsorship">Visa Sponsorship</Label>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4 space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={resetFilters}
                        >
                          Reset
                        </Button>
                        <Button 
                          type="submit"
                          onClick={() => {
                            setPagination({ ...pagination, currentPage: 1 })
                            fetchBrowseJobs()
                          }}
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : browseJobs.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {browseJobs.map(job => renderJobCard(job))}
                    </div>
                    
                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          <span className="text-sm">
                            Page {pagination.currentPage} of {pagination.totalPages}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No jobs found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search filters
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="saved" className="mt-0">
                <SavedJobs onJobSelect={handleJobSelect} />
              </TabsContent>
              
              <TabsContent value="applications" className="mt-0">
                <MyApplications onJobSelect={handleJobSelect} />
              </TabsContent>
            </div>
            
            <div className="lg:col-span-2">
              {showJobDetail && selectedJob ? (
                showApplicationForm ? (
                  <JobApplicationForm 
                    job={selectedJob}
                    onSubmit={handleApplicationSubmit}
                    onCancel={() => setShowApplicationForm(false)}
                  />
                ) : (
                  <JobDetailView 
                    job={selectedJob}
                    onApply={handleApplyClick}
                    onSave={() => handleSaveJob(selectedJob)}
                    onBack={() => setShowJobDetail(false)}
                  />
                )
              ) : (
                <div className="hidden lg:flex h-full items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
                  <div className="text-center">
                    <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Select a job to view details</h3>
                    <p className="text-muted-foreground max-w-md">
                      Click on any job from the list to view its details and apply
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
