'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  Briefcase, Plus, Search, Filter, MoreHorizontal, 
  Edit, Trash2, Eye, Copy, Clock, MapPin, Users, 
  Calendar, CheckCircle, XCircle, AlertCircle, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { format, formatDistanceToNow, isAfter } from 'date-fns'

// Job type definition
type Job = {
  _id: string
  title: string
  department: string
  location: string
  type: string
  experience: string
  skills: string[]
  description: string
  responsibilities: string[]
  requirements: string[]
  salary?: {
    min: number
    max: number
    currency: string
  }
  postedDate: string
  closingDate: string
  status: 'draft' | 'active' | 'closed' | 'archived'
  applicantsCount: number
}

export default function Jobs() {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      if (!session?.user?.email) return
      
      try {
        const response = await fetch('/api/dashboard/hr/jobs')
        const data = await response.json()
        
        if (data.success) {
          setJobs(data.jobs || [])
          setFilteredJobs(data.jobs || [])
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
        // Mock data for development
        const mockJobs = [
          {
            _id: '1',
            title: 'Senior Frontend Developer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            experience: '5+ years',
            skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
            description: 'We are looking for a senior frontend developer with experience in React and TypeScript.',
            responsibilities: [
              'Develop new user-facing features using React.js',
              'Build reusable components and front-end libraries for future use',
              'Translate designs and wireframes into high-quality code',
              'Optimize components for maximum performance across devices and browsers'
            ],
            requirements: [
              '5+ years of experience in frontend development',
              'Strong proficiency in JavaScript and TypeScript',
              'Experience with React.js and its core principles',
              'Experience with popular React.js workflows such as Redux'
            ],
            salary: {
              min: 120000,
              max: 150000,
              currency: 'USD'
            },
            postedDate: '2025-03-01T00:00:00.000Z',
            closingDate: '2025-04-01T00:00:00.000Z',
            status: 'active',
            applicantsCount: 12
          },
          {
            _id: '2',
            title: 'UX/UI Designer',
            department: 'Design',
            location: 'New York, NY',
            type: 'Full-time',
            experience: '3+ years',
            skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
            description: 'We are seeking a talented UX/UI Designer to create amazing user experiences.',
            responsibilities: [
              'Create user flows, wireframes, prototypes, and mockups',
              'Translate requirements into style guides, design systems, design patterns and attractive user interfaces',
              'Design UI elements such as input controls, navigational components and informational components',
              'Create original graphic designs (e.g. images, sketches and tables)'
            ],
            requirements: [
              'Proven experience as a UI/UX Designer or similar role',
              'Portfolio of design projects',
              'Knowledge of wireframe tools (e.g. Wireframe.cc and InVision)',
              'Up-to-date knowledge of design software like Adobe Illustrator and Photoshop'
            ],
            salary: {
              min: 90000,
              max: 120000,
              currency: 'USD'
            },
            postedDate: '2025-02-15T00:00:00.000Z',
            closingDate: '2025-03-15T00:00:00.000Z',
            status: 'closed',
            applicantsCount: 24
          },
          {
            _id: '3',
            title: 'DevOps Engineer',
            department: 'Operations',
            location: 'Remote',
            type: 'Full-time',
            experience: '4+ years',
            skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
            description: 'Looking for a DevOps engineer to help us scale our infrastructure.',
            responsibilities: [
              'Design, implement and maintain CI/CD pipelines',
              'Automate and optimize deployment processes',
              'Implement security and data protection solutions',
              'Troubleshoot and resolve issues in development, testing, and production environments'
            ],
            requirements: [
              'Experience with AWS or other cloud providers',
              'Experience with infrastructure as code tools like Terraform',
              'Knowledge of containerization technologies like Docker and Kubernetes',
              'Experience with CI/CD tools like Jenkins, GitLab CI, or GitHub Actions'
            ],
            salary: {
              min: 110000,
              max: 140000,
              currency: 'USD'
            },
            postedDate: '2025-02-28T00:00:00.000Z',
            closingDate: '2025-03-28T00:00:00.000Z',
            status: 'active',
            applicantsCount: 8
          },
          {
            _id: '4',
            title: 'Product Manager',
            department: 'Product',
            location: 'San Francisco, CA',
            type: 'Full-time',
            experience: '4+ years',
            skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis'],
            description: 'We are looking for a product manager to help us define and execute our product roadmap.',
            responsibilities: [
              'Define the product vision, strategy, and roadmap',
              'Gather and prioritize product and customer requirements',
              'Work closely with engineering, design, and marketing teams',
              'Ensure product launches are successful'
            ],
            requirements: [
              'Proven experience as a Product Manager or similar role',
              'Experience in using product management tools',
              'Excellent communication and presentation skills',
              'Technical background or ability to learn quickly about technology'
            ],
            postedDate: '2025-03-10T00:00:00.000Z',
            closingDate: '2025-04-10T00:00:00.000Z',
            status: 'draft',
            applicantsCount: 0
          }
        ]
        setJobs(mockJobs)
        setFilteredJobs(mockJobs)
      } finally {
        setLoading(false)
      }
    }
    
    fetchJobs()
  }, [session])
  
  // Filter jobs based on search term and filters
  useEffect(() => {
    let filtered = [...jobs]
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(term) || 
        job.department.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term) ||
        job.skills.some(skill => skill.toLowerCase().includes(term))
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter)
    }
    
    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(job => job.department === departmentFilter)
    }
    
    setFilteredJobs(filtered)
  }, [jobs, searchTerm, statusFilter, departmentFilter])
  
  // Get unique departments for filter
  const departments = ['all', ...new Set(jobs.map(job => job.department))]
  
  // Delete job
  const deleteJob = async () => {
    if (!jobToDelete) return
    
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/dashboard/hr/jobs/${jobToDelete}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Remove job from state
        setJobs(prev => prev.filter(job => job._id !== jobToDelete))
        
        toast({
          title: 'Job Deleted',
          description: 'The job posting has been successfully deleted',
        })
      } else {
        throw new Error(data.error || 'Failed to delete job')
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete job. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setJobToDelete(null)
    }
  }
  
  // Format salary range
  const formatSalary = (salary?: { min: number, max: number, currency: string }) => {
    if (!salary) return 'Not specified'
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency,
      maximumFractionDigits: 0
    })
    
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`
  }
  
  // Render job status badge
  const renderStatusBadge = (status: string, closingDate: string) => {
    const now = new Date()
    const closing = new Date(closingDate)
    const isExpired = isAfter(now, closing)
    
    switch (status) {
      case 'active':
        return isExpired ? (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Expired
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            Draft
          </Badge>
        )
      case 'closed':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            Closed
          </Badge>
        )
      case 'archived':
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
            Archived
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        )
    }
  }
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Job Postings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your job postings and track applicants
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link href="/dashboard/hr/jobs/create">
            <Button className="flex items-center gap-1">
              <Plus size={16} />
              Post New Job
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search jobs..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept, index) => (
                    <SelectItem key={index} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Jobs List */}
      <div className="space-y-6">
        {loading ? (
          // Loading skeletons
          [...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredJobs.length === 0 ? (
          // No jobs found
          <Card>
            <CardContent className="p-12 flex flex-col items-center justify-center">
              <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">No job postings found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-center">
                {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' ? 
                  'Try adjusting your search filters to find what you\'re looking for.' : 
                  'Get started by creating your first job posting.'}
              </p>
              {!searchTerm && statusFilter === 'all' && departmentFilter === 'all' && (
                <Link href="/dashboard/hr/jobs/create" className="mt-4">
                  <Button>
                    <Plus size={16} className="mr-2" />
                    Post New Job
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          // Jobs list
          filteredJobs.map((job) => (
            <Card key={job._id}>
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                      <div className="flex items-start gap-2">
                        <h3 className="text-lg font-medium">{job.title}</h3>
                        {renderStatusBadge(job.status, job.closingDate)}
                      </div>
                      <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 mt-1 gap-x-3 gap-y-1">
                        <div className="flex items-center">
                          <Briefcase size={14} className="mr-1" />
                          <span>{job.department}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          <span>{job.type}</span>
                        </div>
                        {job.salary && (
                          <div className="flex items-center">
                            <span>{formatSalary(job.salary)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center">
                      <Link href={`/dashboard/hr/jobs/${job._id}/applicants`}>
                        <Button variant="outline" size="sm" className="mr-2">
                          <Users size={14} className="mr-1" />
                          {job.applicantsCount} Applicants
                        </Button>
                      </Link>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <Link href={`/dashboard/hr/jobs/${job._id}`}>
                            <DropdownMenuItem>
                              <Eye size={14} className="mr-2" />
                              View
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/dashboard/hr/jobs/${job._id}/edit`}>
                            <DropdownMenuItem>
                              <Edit size={14} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem>
                            <Copy size={14} className="mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                              setJobToDelete(job._id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 line-clamp-2">
                    {job.description}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.slice(0, 5).map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 5 && (
                      <Badge variant="outline">
                        +{job.skills.length - 5} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar size={14} className="mr-1" />
                      <span>Posted {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}</span>
                      <span className="mx-2">•</span>
                      <span>Closes {format(new Date(job.closingDate), 'MMM d, yyyy')}</span>
                    </div>
                    
                    <div className="mt-2 sm:mt-0">
                      {job.status === 'draft' ? (
                        <Button size="sm" variant="outline" className="mr-2">
                          <CheckCircle size={14} className="mr-1" />
                          Publish
                        </Button>
                      ) : job.status === 'active' ? (
                        <Button size="sm" variant="outline" className="mr-2">
                          <XCircle size={14} className="mr-1" />
                          Close
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="mr-2">
                          <AlertCircle size={14} className="mr-1" />
                          Reopen
                        </Button>
                      )}
                      
                      <Link href={`/dashboard/hr/jobs/${job._id}/edit`}>
                        <Button size="sm">
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Posting</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job posting? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteJob}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
