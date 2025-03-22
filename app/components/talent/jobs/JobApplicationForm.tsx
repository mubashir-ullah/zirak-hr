'use client'

import { useState } from 'react'
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
  onSubmit: (data: { coverLetter: string, resumeUrl: string, notes: string }) => void;
  onCancel: () => void;
}

export default function JobApplicationForm({ job, onSubmit, onCancel }: JobApplicationFormProps) {
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [useExistingResume, setUseExistingResume] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!coverLetter.trim()) {
      setError('Please provide a cover letter')
      return
    }
    
    if (!useExistingResume && !resumeUrl.trim()) {
      setError('Please provide a resume URL')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    // Submit form data
    onSubmit({
      coverLetter,
      resumeUrl: useExistingResume ? '' : resumeUrl,
      notes
    })
  }
  
  return (
    <Card className="h-full overflow-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader className="pb-2">
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            className="mb-2 w-fit"
            onClick={onCancel}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Job Details
          </Button>
          
          <CardTitle className="text-xl">Apply for {job.title}</CardTitle>
          <CardDescription>
            Complete the application form to apply for this position at {job.company}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div>
            <Label htmlFor="coverLetter" className="text-base font-medium">
              Cover Letter <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Introduce yourself and explain why you're a good fit for this position
            </p>
            <Textarea
              id="coverLetter"
              placeholder="Write your cover letter here..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[200px]"
              required
            />
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="useExistingResume"
                checked={useExistingResume}
                onChange={() => setUseExistingResume(!useExistingResume)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="useExistingResume" className="text-sm font-medium cursor-pointer">
                Use my existing resume
              </Label>
            </div>
            
            {!useExistingResume && (
              <div>
                <Label htmlFor="resumeUrl" className="text-base font-medium">
                  Resume URL <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Provide a link to your resume (Google Drive, Dropbox, etc.)
                </p>
                <div className="flex gap-2">
                  <Input
                    id="resumeUrl"
                    placeholder="https://drive.google.com/your-resume"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    className="flex-grow"
                    required={!useExistingResume}
                  />
                  <Button type="button" variant="outline" className="shrink-0">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div>
            <Label htmlFor="notes" className="text-base font-medium">
              Additional Notes (Optional)
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Any additional information you'd like to share with the employer
            </p>
            <Textarea
              id="notes"
              placeholder="Add any additional notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            type="button"
            variant="outline" 
            onClick={onCancel}
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
        </CardFooter>
      </form>
    </Card>
  )
}
