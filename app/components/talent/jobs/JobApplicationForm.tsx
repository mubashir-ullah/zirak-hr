'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChevronLeft, Send, Upload, AlertCircle, FileText } from 'lucide-react'

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
}

interface JobApplicationFormProps {
  job: Job;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function JobApplicationForm({ job, onSubmit, onClose }: JobApplicationFormProps) {
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [useExistingResume, setUseExistingResume] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [userResumes, setUserResumes] = useState<{id: string, name: string, url: string}[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  
  // Fetch user's resumes on component mount
  useEffect(() => {
    fetchUserResumes()
  }, [])
  
  const fetchUserResumes = async () => {
    try {
      setIsLoadingResumes(true)
      const response = await fetch('/api/talent/resumes')
      
      if (!response.ok) {
        throw new Error('Failed to fetch resumes')
      }
      
      const data = await response.json()
      setUserResumes(data.resumes || [])
      
      // Select the first resume by default if available
      if (data.resumes && data.resumes.length > 0) {
        setSelectedResumeId(data.resumes[0].id)
        setResumeUrl(data.resumes[0].url)
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
      setError('Failed to load your resumes. Please try uploading a new one.')
    } finally {
      setIsLoadingResumes(false)
    }
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!coverLetter.trim()) {
      setError('Please provide a cover letter')
      return
    }
    
    if (!useExistingResume && !resumeFile) {
      setError('Please upload a resume')
      return
    }
    
    if (useExistingResume && !resumeUrl) {
      setError('Please select a resume')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    // If uploading a new resume, upload it first
    if (!useExistingResume && resumeFile) {
      uploadResume(resumeFile)
        .then(url => {
          submitApplication(url)
        })
        .catch(err => {
          console.error('Error uploading resume:', err)
          setError('Failed to upload resume. Please try again.')
          setIsSubmitting(false)
        })
    } else {
      // Use existing resume
      submitApplication(resumeUrl)
    }
  }
  
  const uploadResume = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'resume')
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload resume')
    }
    
    const data = await response.json()
    return data.url
  }
  
  const submitApplication = (resumeUrl: string) => {
    const applicationData = {
      jobId: job._id,
      coverLetter,
      resumeUrl,
      notes: notes.trim() || undefined
    }
    
    onSubmit(applicationData)
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Validate file type
      if (!file.type.match('application/pdf|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        setError('Please upload a PDF or Word document')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB')
        return
      }
      
      setResumeFile(file)
      setError('')
    }
  }
  
  const handleResumeSelect = (resumeId: string) => {
    const resume = userResumes.find(r => r.id === resumeId)
    if (resume) {
      setSelectedResumeId(resumeId)
      setResumeUrl(resume.url)
    }
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="ghost" size="sm" onClick={onClose} className="mb-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Job
          </Button>
          <h1 className="text-2xl font-bold">Apply for {job.title}</h1>
          <p className="text-gray-600">{job.company} • {job.location}</p>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Resume</h2>
            
            <div className="flex gap-4 mb-4">
              <Button
                type="button"
                variant={useExistingResume ? "default" : "outline"}
                onClick={() => setUseExistingResume(true)}
                className="flex-1"
              >
                Use Existing Resume
              </Button>
              <Button
                type="button"
                variant={!useExistingResume ? "default" : "outline"}
                onClick={() => setUseExistingResume(false)}
                className="flex-1"
              >
                Upload New Resume
              </Button>
            </div>
            
            {useExistingResume ? (
              <div className="space-y-4">
                {isLoadingResumes ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : userResumes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userResumes.map(resume => (
                      <div
                        key={resume.id}
                        className={`border rounded-lg p-4 cursor-pointer ${
                          selectedResumeId === resume.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => handleResumeSelect(resume.id)}
                      >
                        <div className="flex items-start">
                          <FileText className="h-10 w-10 text-primary mr-3" />
                          <div>
                            <p className="font-medium">{resume.name}</p>
                            <p className="text-sm text-gray-500">
                              Last updated: {new Date(resume.id.split('-')[0]).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium mb-1">No Resumes Found</h3>
                    <p className="text-gray-500 mb-4">
                      You don't have any resumes saved. Please upload a new one.
                    </p>
                    <Button
                      type="button"
                      onClick={() => setUseExistingResume(false)}
                    >
                      Upload Resume
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    Upload your resume (PDF or Word, max 5MB)
                  </p>
                  <Input
                    type="file"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('resume')?.click()}
                  >
                    Select File
                  </Button>
                  {resumeFile && (
                    <p className="mt-2 text-sm font-medium">
                      Selected: {resumeFile.name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Cover Letter</h2>
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Write a cover letter to introduce yourself</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why you're a good fit for this position..."
                className="min-h-[200px]"
              />
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
            <div className="space-y-2">
              <Label htmlFor="notes">Optional: Add any additional information</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information you'd like to share..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
