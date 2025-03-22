'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Briefcase, MapPin, Clock, Building, ChevronLeft, Calendar, FileText, 
  CheckCircle, XCircle, AlertCircle, MessageSquare, Send, Download, 
  Clock8, ArrowUpRight, Hourglass, User, Phone, Video, Users, Trash
} from 'lucide-react'

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  description: string;
  requirements: string[];
  skills: string[];
  experienceLevel: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  remote: boolean;
  postedDate: string;
  applicationDeadline: string;
}

interface Interview {
  date: string;
  type: string;
  interviewerName: string;
  notes: string;
  status: string;
}

interface Application {
  _id: string;
  jobId: Job;
  status: string;
  appliedDate: string;
  lastStatusUpdateDate: string;
  resumeUrl: string;
  coverLetter: string;
  notes: string;
  interviews?: Interview[];
  interviewDate?: string;
  interviewType?: string;
  interviewNotes?: string;
  rejectionReason?: string;
  hiringManagerNotes?: string;
  statusHistory?: {
    status: string;
    date: string;
    note?: string;
  }[];
}

interface ApplicationDetailViewProps {
  applicationId: string;
  onBack: () => void;
  onRefresh: () => void;
}

export default function ApplicationDetailView({ applicationId, onBack, onRefresh }: ApplicationDetailViewProps) {
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [withdrawReason, setWithdrawReason] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawError, setWithdrawError] = useState('')
  const [activeTab, setActiveTab] = useState('details')
  const [feedbackNote, setFeedbackNote] = useState('')
  const [sendingFeedback, setSendingFeedback] = useState(false)

  // Fetch application details
  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetails()
    }
  }, [applicationId])

  const fetchApplicationDetails = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch(`/api/talent/jobs/apply/${applicationId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch application details')
      }
      
      const data = await response.json()
      setApplication(data)
    } catch (error) {
      console.error('Error fetching application details:', error)
      setError('Failed to load application details. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle application withdrawal
  const handleWithdrawApplication = async () => {
    if (!withdrawReason.trim()) {
      setWithdrawError('Please provide a reason for withdrawing your application')
      return
    }
    
    try {
      setWithdrawing(true)
      setWithdrawError('')
      
      const response = await fetch(`/api/talent/jobs/apply/${applicationId}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: withdrawReason })
      })
      
      if (!response.ok) {
        throw new Error('Failed to withdraw application')
      }
      
      setWithdrawDialogOpen(false)
      fetchApplicationDetails()
      onRefresh()
    } catch (error) {
      console.error('Error withdrawing application:', error)
      setWithdrawError('Failed to withdraw application. Please try again later.')
    } finally {
      setWithdrawing(false)
    }
  }

  // Handle sending feedback
  const handleSendFeedback = async () => {
    if (!feedbackNote.trim()) {
      return
    }
    
    try {
      setSendingFeedback(true)
      
      const response = await fetch(`/api/talent/jobs/apply/${applicationId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feedback: feedbackNote })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send feedback')
      }
      
      setFeedbackNote('')
      fetchApplicationDetails()
    } catch (error) {
      console.error('Error sending feedback:', error)
    } finally {
      setSendingFeedback(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format date with time
  const formatDateTime = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Applied
          </Badge>
        )
      case 'screening':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Hourglass className="h-3 w-3 mr-1" />
            Screening
          </Badge>
        )
      case 'interview':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Calendar className="h-3 w-3 mr-1" />
            Interview
          </Badge>
        )
      case 'offer':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <FileText className="h-3 w-3 mr-1" />
            Offer
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case 'withdrawn':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Trash className="h-3 w-3 mr-1" />
            Withdrawn
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        )
    }
  }

  // Get interview type icon
  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="h-4 w-4 mr-1" />
      case 'video':
        return <Video className="h-4 w-4 mr-1" />
      case 'in-person':
        return <Users className="h-4 w-4 mr-1" />
      default:
        return <Calendar className="h-4 w-4 mr-1" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Applications
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!application) {
    return (
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Applications
        </Button>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Application Not Found</AlertTitle>
          <AlertDescription>The application you're looking for could not be found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Applications
      </Button>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{application.jobId.title}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Building className="h-4 w-4 mr-1" />
                {application.jobId.company}
              </CardDescription>
            </div>
            {getStatusBadge(application.status)}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {application.jobId.location}
              {application.jobId.remote && " (Remote)"}
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <Briefcase className="h-3 w-3 mr-1" />
              {application.jobId.jobType}
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Applied on {formatDate(application.appliedDate)}
            </Badge>
          </div>
          
          {/* Application Timeline */}
          <div className="relative border-l border-gray-200 dark:border-gray-700 ml-4 pl-6 py-2 mt-6 mb-4">
            {/* Applied */}
            <div className="mb-6 relative">
              <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-blue-500"></div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Applied</h3>
              <time className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(application.appliedDate)}</time>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                You submitted your application
              </p>
            </div>
            
            {/* Status History */}
            {application.statusHistory && application.statusHistory.map((history, index) => (
              <div key={index} className="mb-6 relative">
                <div className={`absolute -left-10 mt-1.5 h-4 w-4 rounded-full ${
                  history.status === 'rejected' ? 'bg-red-500' : 
                  history.status === 'withdrawn' ? 'bg-gray-500' : 
                  history.status === 'offer' ? 'bg-green-500' : 
                  history.status === 'interview' ? 'bg-purple-500' : 
                  'bg-yellow-500'
                }`}></div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {history.status === 'screening' ? 'Application Under Review' :
                   history.status === 'interview' ? 'Interview Scheduled' :
                   history.status === 'offer' ? 'Offer Received' :
                   history.status === 'rejected' ? 'Application Rejected' :
                   history.status === 'withdrawn' ? 'Application Withdrawn' :
                   'Status Updated'}
                </h3>
                <time className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(history.date)}</time>
                {history.note && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {history.note}
                  </p>
                )}
              </div>
            ))}
            
            {/* Current Status */}
            {!application.statusHistory?.some(h => h.status === application.status) && (
              <div className="mb-6 relative">
                <div className={`absolute -left-10 mt-1.5 h-4 w-4 rounded-full ${
                  application.status === 'rejected' ? 'bg-red-500' : 
                  application.status === 'withdrawn' ? 'bg-gray-500' : 
                  application.status === 'offer' ? 'bg-green-500' : 
                  application.status === 'interview' ? 'bg-purple-500' : 
                  application.status === 'screening' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {application.status === 'screening' ? 'Application Under Review' :
                   application.status === 'interview' ? 'Interview Scheduled' :
                   application.status === 'offer' ? 'Offer Received' :
                   application.status === 'rejected' ? 'Application Rejected' :
                   application.status === 'withdrawn' ? 'Application Withdrawn' :
                   'Current Status'}
                </h3>
                <time className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(application.lastStatusUpdateDate)}</time>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="details">Application Details</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="job">Job Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Cover Letter</h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md text-sm whitespace-pre-wrap">
                    {application.coverLetter || "No cover letter provided"}
                  </div>
                </div>
                
                {application.notes && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Additional Notes</h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md text-sm whitespace-pre-wrap">
                      {application.notes}
                    </div>
                  </div>
                )}
                
                {application.resumeUrl && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Resume</h3>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      Download Resume
                    </Button>
                  </div>
                )}
                
                {application.rejectionReason && (
                  <Alert variant="destructive" className="mt-4">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Application Rejected</AlertTitle>
                    <AlertDescription>
                      {application.rejectionReason}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Feedback</CardTitle>
              <CardDescription>
                Send additional information or ask questions about your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Type your message here..."
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="default" 
                disabled={!feedbackNote.trim() || sendingFeedback || application.status === 'withdrawn'}
                onClick={handleSendFeedback}
              >
                {sendingFeedback ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Send Message
                  </>
                )}
              </Button>
              
              {application.status !== 'withdrawn' && (
                <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                      Withdraw Application
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw Application</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to withdraw your application? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Please provide a reason for withdrawing your application
                        </label>
                        <Textarea
                          placeholder="e.g., I've accepted another offer, The position no longer matches my career goals..."
                          value={withdrawReason}
                          onChange={(e) => setWithdrawReason(e.target.value)}
                        />
                        {withdrawError && (
                          <p className="text-sm text-red-500">{withdrawError}</p>
                        )}
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleWithdrawApplication}
                        disabled={withdrawing}
                      >
                        {withdrawing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Withdrawing...
                          </>
                        ) : (
                          "Withdraw Application"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="interviews" className="space-y-4">
          {application.interviews && application.interviews.length > 0 ? (
            application.interviews.map((interview, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    {getInterviewTypeIcon(interview.type)}
                    {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview
                  </CardTitle>
                  <CardDescription>
                    {formatDateTime(interview.date)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {interview.interviewerName && (
                      <div className="flex items-start">
                        <User className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                        <div>
                          <span className="text-sm font-medium">Interviewer:</span>
                          <p className="text-sm">{interview.interviewerName}</p>
                        </div>
                      </div>
                    )}
                    
                    {interview.notes && (
                      <div className="flex items-start">
                        <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                        <div>
                          <span className="text-sm font-medium">Notes:</span>
                          <p className="text-sm">{interview.notes}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center mt-2">
                      <Badge 
                        variant="outline" 
                        className={`
                          ${interview.status === 'scheduled' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                            interview.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                            'bg-red-50 text-red-700 border-red-200'}
                        `}
                      >
                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">No Interviews Scheduled</CardTitle>
                <CardDescription>
                  You don't have any interviews scheduled for this application yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  When the employer schedules an interview, you'll see the details here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="job" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{application.jobId.title}</CardTitle>
              <CardDescription className="flex items-center">
                <Building className="h-4 w-4 mr-1" />
                {application.jobId.company}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {application.jobId.location}
                    {application.jobId.remote && " (Remote)"}
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {application.jobId.jobType}
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {application.jobId.experienceLevel}
                  </Badge>
                  {application.jobId.salary && (
                    <Badge variant="outline" className="flex items-center">
                      <Clock8 className="h-3 w-3 mr-1" />
                      {application.jobId.salary.min.toLocaleString()} - {application.jobId.salary.max.toLocaleString()} {application.jobId.salary.currency}
                    </Badge>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <div className="text-sm whitespace-pre-wrap">
                    {application.jobId.description}
                  </div>
                </div>
                
                {application.jobId.requirements && application.jobId.requirements.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Requirements</h3>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {application.jobId.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {application.jobId.skills && application.jobId.skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Skills</h3>
                    <div className="flex flex-wrap gap-1">
                      {application.jobId.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center"
                    onClick={() => window.open(`/jobs/${application.jobId._id}`, '_blank')}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    View Full Job Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
