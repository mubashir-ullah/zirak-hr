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
  onJobSelect: (job: Job) => void;
}

export default function SavedJobs({ onJobSelect }: SavedJobsProps) {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [editingNotes, setEditingNotes] = useState<{ id: string, notes: string } | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    limit: 10
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredJobs, setFilteredJobs] = useState<SavedJob[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Fetch saved jobs on component mount and when pagination changes
  useEffect(() => {
    fetchSavedJobs()
  }, [pagination.currentPage])

  // Filter jobs when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredJobs(savedJobs)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredJobs(
        savedJobs.filter(
          (savedJob) => 
            savedJob.jobId.title.toLowerCase().includes(query) ||
            savedJob.jobId.company.toLowerCase().includes(query) ||
            savedJob.jobId.location.toLowerCase().includes(query)
        )
      )
    }
  }, [savedJobs, searchQuery])

  const fetchSavedJobs = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch(`/api/talent/jobs/saved?page=${pagination.currentPage}&limit=${pagination.limit}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized (redirect to login)
          return
        }
        throw new Error('Failed to fetch saved jobs')
      }
      
      const data = await response.json()
      
      setSavedJobs(data.savedJobs || [])
      setFilteredJobs(data.savedJobs || [])
      setPagination({
        ...pagination,
        totalPages: data.pagination?.totalPages || 1,
        totalJobs: data.pagination?.totalJobs || 0
      })
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
      setError('Failed to load saved jobs. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveSavedJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/talent/jobs/${jobId}/unsave`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove job from saved list')
      }
      
      // Update local state
      setSavedJobs(prevJobs => prevJobs.filter(job => job.jobId._id !== jobId))
      
      setSuccessMessage('Job removed from saved list')
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error removing saved job:', error)
      setError('Failed to remove job. Please try again later.')
    }
  }

  const handleUpdateNotes = async () => {
    if (!editingNotes) return
    
    try {
      const response = await fetch(`/api/talent/jobs/saved/${editingNotes.id}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: editingNotes.notes })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update notes')
      }
      
      // Update local state
      setSavedJobs(prevJobs => 
        prevJobs.map(job => 
          job._id === editingNotes.id 
            ? { ...job, notes: editingNotes.notes } 
            : job
        )
      )
      
      setEditingNotes(null)
      setSuccessMessage('Notes updated successfully')
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error updating notes:', error)
      setError('Failed to update notes. Please try again later.')
    }
  }

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, currentPage: page })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const renderSavedJobCard = (savedJob: SavedJob) => {
    const job = savedJob.jobId
    
    return (
      <Card key={savedJob._id} className="mb-4 hover:shadow-md transition-shadow">
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
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowDeleteConfirm(job._id)}
              >
                <Trash2 className="h-5 w-5 text-red-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location}
              {job.remote && " (Remote)"}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Briefcase className="h-4 w-4 mr-1" />
              {job.jobType}
            </div>
            {job.salary && (
              <div className="flex items-center text-sm text-gray-600">
                <CreditCard className="h-4 w-4 mr-1" />
                {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
              </div>
            )}
          </div>
          
          {savedJob.notes && editingNotes?.id !== savedJob._id && (
            <div className="bg-gray-50 p-3 rounded-md mb-3">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-medium">Your Notes</h4>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => setEditingNotes({ id: savedJob._id, notes: savedJob.notes })}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-gray-600">{savedJob.notes}</p>
            </div>
          )}
          
          {editingNotes?.id === savedJob._id && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium">Edit Notes</h4>
                <div className="flex gap-1">
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
                className="text-sm min-h-[80px]"
                placeholder="Add your notes about this job..."
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <div className="text-xs text-gray-500">
            Saved on {new Date(savedJob.savedDate).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onJobSelect(job)}
            >
              View Details
            </Button>
            <Button 
              size="sm"
              disabled={job.isApplied}
            >
              {job.isApplied ? 'Applied' : 'Apply Now'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Saved Jobs</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Jobs you've saved for later
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
      
      <div className="mb-4">
        <Input
          placeholder="Search saved jobs..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="max-w-md"
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <BookmarkCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Saved Jobs</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You haven't saved any jobs yet. Browse jobs and click the bookmark icon to save them for later.
          </p>
          <Button onClick={() => window.location.href = '#browse'}>
            Browse Jobs
          </Button>
        </div>
      ) : (
        <>
          <div>
            {filteredJobs.map(savedJob => renderSavedJobCard(savedJob))}
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm !== null} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Saved Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this job from your saved list? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (showDeleteConfirm) {
                  handleRemoveSavedJob(showDeleteConfirm)
                  setShowDeleteConfirm(null)
                }
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
