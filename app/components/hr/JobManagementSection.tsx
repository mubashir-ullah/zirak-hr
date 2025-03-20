'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus, Briefcase, Clock, MapPin, 
  Edit, Trash2, Eye, Users, Calendar
} from 'lucide-react'

interface Job {
  id: string
  title: string
  department: string
  location: string
  type: string
  salary: string
  status: 'active' | 'draft' | 'closed'
  postedDate: string
  applicants: number
  description: string
}

interface JobManagementSectionProps {
  isLoading: boolean
}

export default function JobManagementSection({ isLoading }: JobManagementSectionProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('active')
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Karachi, Pakistan',
      type: 'Full-time',
      salary: '$60,000 - $80,000',
      status: 'active',
      postedDate: '2025-03-15',
      applicants: 12,
      description: 'We are looking for a Senior Frontend Developer with experience in React, Next.js, and TypeScript to join our growing team.'
    },
    {
      id: '2',
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      salary: '$50,000 - $70,000',
      status: 'active',
      postedDate: '2025-03-10',
      applicants: 8,
      description: 'We are seeking a talented UX/UI Designer to create beautiful, intuitive interfaces for our products.'
    },
    {
      id: '3',
      title: 'DevOps Engineer',
      department: 'Operations',
      location: 'Lahore, Pakistan',
      type: 'Full-time',
      salary: '$70,000 - $90,000',
      status: 'draft',
      postedDate: '',
      applicants: 0,
      description: 'We are looking for a DevOps Engineer to help us build and maintain our cloud infrastructure.'
    }
  ])
  const [newJob, setNewJob] = useState<Omit<Job, 'id' | 'postedDate' | 'applicants'>>({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    salary: '',
    status: 'draft',
    description: ''
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingJobId, setEditingJobId] = useState<string | null>(null)

  const handleCreateJob = () => {
    setNewJob({
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      salary: '',
      status: 'draft',
      description: ''
    })
    setEditingJobId(null)
    setIsDialogOpen(true)
  }

  const handleEditJob = (jobId: string) => {
    const jobToEdit = jobs.find(job => job.id === jobId)
    if (jobToEdit) {
      setNewJob({
        title: jobToEdit.title,
        department: jobToEdit.department,
        location: jobToEdit.location,
        type: jobToEdit.type,
        salary: jobToEdit.salary,
        status: jobToEdit.status,
        description: jobToEdit.description
      })
      setEditingJobId(jobId)
      setIsDialogOpen(true)
    }
  }

  const handleDeleteJob = (jobId: string) => {
    // In a real app, this would be an API call
    // await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
    
    setJobs(jobs.filter(job => job.id !== jobId))
    
    toast({
      title: 'Job Deleted',
      description: 'The job posting has been deleted successfully.',
    })
  }

  const handleSaveJob = async () => {
    if (!newJob.title || !newJob.department || !newJob.location) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }
    
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/jobs', {
      //   method: editingJobId ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editingJobId ? { ...newJob, id: editingJobId } : newJob)
      // })
      
      if (editingJobId) {
        // Update existing job
        setJobs(jobs.map(job => 
          job.id === editingJobId ? 
            { ...job, ...newJob } : 
            job
        ))
        
        toast({
          title: 'Job Updated',
          description: 'The job posting has been updated successfully.',
        })
      } else {
        // Create new job
        const today = new Date().toISOString().split('T')[0]
        const newJobWithId: Job = {
          ...newJob,
          id: Date.now().toString(),
          postedDate: newJob.status === 'active' ? today : '',
          applicants: 0
        }
        
        setJobs([newJobWithId, ...jobs])
        
        toast({
          title: 'Job Created',
          description: 'The job posting has been created successfully.',
        })
      }
      
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to save job:', error)
      toast({
        title: 'Error',
        description: 'Failed to save job. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handlePublishJob = (jobId: string) => {
    const today = new Date().toISOString().split('T')[0]
    
    setJobs(jobs.map(job => 
      job.id === jobId ? 
        { ...job, status: 'active', postedDate: today } : 
        job
    ))
    
    toast({
      title: 'Job Published',
      description: 'The job posting is now live and visible to candidates.',
    })
  }

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return job.status === 'active'
    if (activeTab === 'draft') return job.status === 'draft'
    if (activeTab === 'closed') return job.status === 'closed'
    return true
  })

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full mb-6" />
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Job Listings</h2>
          <Button 
            onClick={handleCreateJob}
            className="bg-[#d6ff00] text-black hover:bg-[#c2eb00]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>
        
        <Tabs defaultValue="active" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            {filteredJobs.length > 0 ? (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <Card key={job.id} className="p-4">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <div className="flex items-center mb-2">
                            <h3 className="font-bold text-lg mr-2">{job.title}</h3>
                            <Badge 
                              variant={job.status === 'active' ? 'default' : 
                                      job.status === 'draft' ? 'outline' : 'secondary'}
                            >
                              {job.status === 'active' ? 'Active' : 
                               job.status === 'draft' ? 'Draft' : 'Closed'}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-y-2 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center mr-4">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {job.department}
                            </div>
                            <div className="flex items-center mr-4">
                              <MapPin className="h-3 w-3 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center mr-4">
                              <Clock className="h-3 w-3 mr-1" />
                              {job.type}
                            </div>
                          </div>
                          
                          {job.status === 'active' && (
                            <div className="flex items-center text-sm mb-2">
                              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground mr-3">Posted: {job.postedDate}</span>
                              <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">{job.applicants} applicants</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center mt-4 md:mt-0 space-x-2">
                          {job.status === 'draft' && (
                            <Button 
                              size="sm" 
                              onClick={() => handlePublishJob(job.id)}
                              className="bg-[#d6ff00] text-black hover:bg-[#c2eb00]"
                            >
                              Publish
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditJob(job.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">
                  No jobs found in this category. Click the "Post New Job" button to create one.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingJobId ? 'Edit Job Posting' : 'Create New Job Posting'}</DialogTitle>
            <DialogDescription>
              Fill in the details below to {editingJobId ? 'update the' : 'create a new'} job posting.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input 
                id="title" 
                value={newJob.title} 
                onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select 
                value={newJob.department} 
                onValueChange={(value) => setNewJob({...newJob, department: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input 
                id="location" 
                value={newJob.location} 
                onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                placeholder="e.g. Karachi, Pakistan or Remote"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <Select 
                value={newJob.type} 
                onValueChange={(value) => setNewJob({...newJob, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input 
                id="salary" 
                value={newJob.salary} 
                onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                placeholder="e.g. $60,000 - $80,000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newJob.status} 
                onValueChange={(value) => setNewJob({...newJob, status: value as 'active' | 'draft' | 'closed'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea 
                id="description" 
                value={newJob.description} 
                onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                placeholder="Describe the job responsibilities, requirements, and benefits..."
                rows={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveJob}
              className="bg-[#d6ff00] text-black hover:bg-[#c2eb00]"
            >
              {editingJobId ? 'Update Job' : 'Create Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
