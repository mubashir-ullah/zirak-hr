'use client'

import { useState, useEffect } from 'react'
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
  interviews?: Interview[]
}

interface Interview {
  id: string
  candidateName: string
  candidateEmail: string
  date: string
  time: string
  duration: number
  type: 'phone' | 'video' | 'in-person'
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

interface JobManagementSectionProps {
  isLoading: boolean
}

export default function JobManagementSection({ isLoading }: JobManagementSectionProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('active')
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [newJob, setNewJob] = useState<Omit<Job, 'id' | 'postedDate' | 'applicants' | 'interviews'>>({
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
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [newInterview, setNewInterview] = useState<Omit<Interview, 'id'>>({
    candidateName: '',
    candidateEmail: '',
    date: '',
    time: '',
    duration: 60,
    type: 'video',
    status: 'scheduled',
    notes: ''
  })

  useEffect(() => {
    if (!isLoading) {
      fetchJobs();
    }
  }, [isLoading]);

  const fetchJobs = async () => {
    try {
      setIsLoadingJobs(true);
      const response = await fetch('/api/jobs');
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      
      const formattedJobs = data.map((job: any) => ({
        id: job._id,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type || 'Full-time',
        salary: job.salary || '',
        status: job.status || 'draft',
        postedDate: job.postedDate || '',
        applicants: job.applicants || 0,
        description: job.description || '',
        interviews: job.interviews || []
      }));
      
      setJobs(formattedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load jobs. Please try again.',
        variant: 'destructive'
      });
      
      setJobs([
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
          description: 'We are looking for a Senior Frontend Developer with experience in React, Next.js, and TypeScript to join our growing team.',
          interviews: [
            {
              id: '1-1',
              candidateName: 'Aisha Khan',
              candidateEmail: 'aisha.khan@example.com',
              date: '2025-03-25',
              time: '10:00',
              duration: 60,
              type: 'video',
              status: 'scheduled'
            },
            {
              id: '1-2',
              candidateName: 'Muhammad Ali',
              candidateEmail: 'muhammad.ali@example.com',
              date: '2025-03-26',
              time: '14:00',
              duration: 45,
              type: 'phone',
              status: 'scheduled'
            }
          ]
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
          description: 'We are seeking a talented UX/UI Designer to create beautiful, intuitive interfaces for our products.',
          interviews: [
            {
              id: '2-1',
              candidateName: 'Sara Ahmed',
              candidateEmail: 'sara.ahmed@example.com',
              date: '2025-03-22',
              time: '11:30',
              duration: 60,
              type: 'video',
              status: 'scheduled'
            }
          ]
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
      ]);
    } finally {
      setIsLoadingJobs(false);
    }
  };

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

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, { 
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      
      setJobs(jobs.filter(job => job.id !== jobId));
      
      toast({
        title: 'Job Deleted',
        description: 'The job posting has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete job. Please try again.',
        variant: 'destructive'
      });
    }
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
      let response;
      
      if (editingJobId) {
        response = await fetch(`/api/jobs/${editingJobId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newJob)
        });
      } else {
        response = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newJob)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to ${editingJobId ? 'update' : 'create'} job`);
      }
      
      await fetchJobs();
      
      toast({
        title: editingJobId ? 'Job Updated' : 'Job Created',
        description: `The job posting has been ${editingJobId ? 'updated' : 'created'} successfully.`,
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save job:', error);
      toast({
        title: 'Error',
        description: 'Failed to save job. Please try again.',
        variant: 'destructive'
      });
    }
  }

  const handlePublishJob = async (jobId: string) => {
    try {
      const jobToUpdate = jobs.find(job => job.id === jobId);
      
      if (!jobToUpdate) {
        throw new Error('Job not found');
      }
      
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobToUpdate,
          status: 'active'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to publish job');
      }
      
      await fetchJobs();
      
      toast({
        title: 'Job Published',
        description: 'The job posting is now live and visible to candidates.',
      });
    } catch (error) {
      console.error('Error publishing job:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish job. Please try again.',
        variant: 'destructive'
      });
    }
  }

  const handleScheduleInterview = (jobId: string) => {
    setSelectedJobId(jobId)
    setNewInterview({
      candidateName: '',
      candidateEmail: '',
      date: '',
      time: '',
      duration: 60,
      type: 'video',
      status: 'scheduled',
      notes: ''
    })
    setIsInterviewDialogOpen(true)
  }

  const handleSaveInterview = async () => {
    if (!selectedJobId) return;
    
    if (!newInterview.candidateName || !newInterview.date || !newInterview.time) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/jobs/${selectedJobId}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInterview)
      });
      
      if (!response.ok) {
        throw new Error('Failed to schedule interview');
      }
      
      await fetchJobs();
      
      setIsInterviewDialogOpen(false);
      
      toast({
        title: 'Interview scheduled',
        description: `Interview with ${newInterview.candidateName} has been scheduled.`
      });
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule interview. Please try again.',
        variant: 'destructive'
      });
    }
  }

  const handleCancelInterview = async (jobId: string, interviewId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel interview');
      }
      
      await fetchJobs();
      
      toast({
        title: 'Interview cancelled',
        description: 'The interview has been cancelled.'
      });
    } catch (error) {
      console.error('Error cancelling interview:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel interview. Please try again.',
        variant: 'destructive'
      });
    }
  }

  const handleCompleteInterview = async (jobId: string, interviewId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete interview');
      }
      
      await fetchJobs();
      
      toast({
        title: 'Interview completed',
        description: 'The interview has been marked as completed.'
      });
    } catch (error) {
      console.error('Error completing interview:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete interview. Please try again.',
        variant: 'destructive'
      });
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return job.status === 'active'
    if (activeTab === 'draft') return job.status === 'draft'
    if (activeTab === 'closed') return job.status === 'closed'
    return true
  })

  if (isLoading || isLoadingJobs) {
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleScheduleInterview(job.id)}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule
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

      <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Schedule an interview with a candidate for this position.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="candidate-name" className="text-right">
                Candidate Name*
              </Label>
              <Input
                id="candidate-name"
                value={newInterview.candidateName}
                onChange={(e) => setNewInterview({ ...newInterview, candidateName: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="candidate-email" className="text-right">
                Email
              </Label>
              <Input
                id="candidate-email"
                type="email"
                value={newInterview.candidateEmail}
                onChange={(e) => setNewInterview({ ...newInterview, candidateEmail: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interview-date" className="text-right">
                Date*
              </Label>
              <Input
                id="interview-date"
                type="date"
                value={newInterview.date}
                onChange={(e) => setNewInterview({ ...newInterview, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interview-time" className="text-right">
                Time*
              </Label>
              <Input
                id="interview-time"
                type="time"
                value={newInterview.time}
                onChange={(e) => setNewInterview({ ...newInterview, time: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interview-duration" className="text-right">
                Duration (min)
              </Label>
              <Input
                id="interview-duration"
                type="number"
                min="15"
                step="15"
                value={newInterview.duration}
                onChange={(e) => setNewInterview({ ...newInterview, duration: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interview-type" className="text-right">
                Type
              </Label>
              <Select 
                value={newInterview.type} 
                onValueChange={(value: 'phone' | 'video' | 'in-person') => 
                  setNewInterview({ ...newInterview, type: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interview-notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="interview-notes"
                value={newInterview.notes || ''}
                onChange={(e) => setNewInterview({ ...newInterview, notes: e.target.value })}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInterviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveInterview}>
              Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Job Dialog */}
      {/* ... */}
    </div>
  )
}
