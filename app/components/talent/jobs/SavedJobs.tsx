'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { 
  Briefcase, MapPin, Clock, Building, CreditCard, Calendar,
  ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Send, Check,
  AlertCircle, Pencil, Save, X, Trash2
} from 'lucide-react'

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  jobType: string;
  experienceLevel: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  remote: boolean;
  postedDate: string;
  applicationDeadline: string;
  isApplied?: boolean;
}

interface SavedJob {
  _id: string;
  jobId: Job;
  userId: string;
  savedDate: string;
  notes: string;
}

interface SavedJobsProps {
  onJobSelect: (job: any) => void;
}

export default function SavedJobs({ onJobSelect }: SavedJobsProps) {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSavedJobs: 0
  })
  const [editingNotes, setEditingNotes] = useState<{ id: string, notes: string } | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)

  // Fetch saved jobs on component mount and when pagination changes
  useEffect(() => {
    fetchSavedJobs()
  }, [pagination.currentPage])

  // Fetch saved jobs from API
  const fetchSavedJobs = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Build query string
      const queryParams = new URLSearchParams()
      queryParams.append('page', pagination.currentPage.toString())
      queryParams.append('limit', '10')
      
      const response = await fetch(`/api/talent/jobs/saved?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved jobs')
      }
      
      const data = await response.json()
      
      setSavedJobs(data.savedJobs || [])
      setPagination({
        currentPage: data.pagination.page,
        totalPages: data.pagination.pages,
        totalSavedJobs: data.pagination.total
      })
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
      setError('Failed to load saved jobs. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, currentPage: newPage })
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Handle remove saved job
  const handleRemoveSavedJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/talent/jobs/save?jobId=${jobId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove job')
      }
      
      // Remove job from list
      setSavedJobs(savedJobs.filter(job => job.jobId._id !== jobId))
      setSuccessMessage('Job removed from saved jobs')
      
      // Update pagination
      if (savedJobs.length === 1 && pagination.currentPage > 1) {
        setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })
      } else {
        fetchSavedJobs()
      }
      
      // Close dialog
      setShowDeleteDialog(null)
    } catch (error) {
      console.error('Error removing saved job:', error)
      setError(error instanceof Error ? error.message : 'Failed to remove job')
    }
  }

  // Handle update notes
  const handleUpdateNotes = async () => {
    if (!editingNotes) return
    
    try {
      const response = await fetch('/api/talent/jobs/save/notes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          savedJobId: editingNotes.id,
          notes: editingNotes.notes
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update notes')
      }
      
      // Update job in list
      setSavedJobs(savedJobs.map(job => 
        job._id === editingNotes.id 
          ? { ...job, notes: editingNotes.notes } 
          : job
      ))
      
      setSuccessMessage('Notes updated successfully')
      setEditingNotes(null)
    } catch (error) {
      console.error('Error updating notes:', error)
      setError(error instanceof Error ? error.message : 'Failed to update notes')
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Saved Jobs</h2>
        <p className="text-muted-foreground">
          Jobs you've saved for later
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          <AlertCircle className="h-4 w-4 inline mr-1" />
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
          <Check className="h-4 w-4 inline mr-1" />
          {successMessage}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="space-y-4">
          {savedJobs.map((savedJob) => (
            <Card key={savedJob._id} className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{savedJob.jobId.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      {savedJob.jobId.company}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowDeleteDialog(savedJob.jobId._id)}
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {savedJob.jobId.location}
                    {savedJob.jobId.remote && " (Remote)"}
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {savedJob.jobId.jobType}
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Posted on {formatDate(savedJob.jobId.postedDate)}
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Saved on {formatDate(savedJob.savedDate)}
                  </Badge>
                </div>
                
                {savedJob.jobId.salary?.min && savedJob.jobId.salary?.max && (
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <CreditCard className="h-4 w-4 mr-1" />
                    {savedJob.jobId.salary.min.toLocaleString()} - {savedJob.jobId.salary.max.toLocaleString()} {savedJob.jobId.salary.currency}
                  </div>
                )}
                
                {savedJob.notes && editingNotes?.id !== savedJob._id && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium mb-1">Your Notes</h4>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => setEditingNotes({ id: savedJob._id, notes: savedJob.notes })}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {savedJob.notes}
                    </p>
                  </div>
                )}
                
                {editingNotes?.id === savedJob._id && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-medium">Edit Notes</h4>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => setEditingNotes(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={handleUpdateNotes}
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={editingNotes.notes}
                      onChange={(e) => setEditingNotes({ ...editingNotes, notes: e.target.value })}
                      className="text-sm"
                      placeholder="Add notes about this job..."
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex justify-between w-full">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onJobSelect(savedJob.jobId)}
                  >
                    View Job Details
                  </Button>
                  <Button 
                    variant={savedJob.jobId.isApplied ? "outline" : "default"} 
                    size="sm"
                    disabled={savedJob.jobId.isApplied}
                    onClick={() => {
                      onJobSelect(savedJob.jobId)
                      // This would trigger the apply form in the parent component
                    }}
                  >
                    {savedJob.jobId.isApplied ? (
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
          ))}
          
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
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-1">No saved jobs found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You haven't saved any jobs yet. Browse jobs and click the bookmark icon to save them for later.
          </p>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Saved Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this job from your saved jobs? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive"
              onClick={() => showDeleteDialog && handleRemoveSavedJob(showDeleteDialog)}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
