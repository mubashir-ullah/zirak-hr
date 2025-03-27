'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  MailIcon,
  PhoneIcon,
  BriefcaseIcon,
  CalendarIcon,
  FileTextIcon,
  ClipboardCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  MessageSquareIcon,
  StarIcon,
  DownloadIcon,
  ClockIcon,
  GraduationCapIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

// Mock applicant data
const mockApplicant = {
  id: 1,
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '+1 (555) 123-4567',
  jobTitle: 'Senior Frontend Developer',
  jobId: 1,
  appliedDate: '2025-03-25',
  status: 'new',
  matchScore: 92,
  skills: ['React', 'JavaScript', 'TypeScript', 'Redux', 'HTML', 'CSS'],
  experience: '7 years',
  education: [
    {
      degree: 'Bachelor of Computer Science',
      institution: 'University of Technology',
      year: '2018',
    },
    {
      degree: 'Master of Software Engineering',
      institution: 'Tech Institute',
      year: '2020',
    }
  ],
  workHistory: [
    {
      title: 'Frontend Developer',
      company: 'Tech Solutions Inc.',
      location: 'San Francisco, CA',
      startDate: '2020-06',
      endDate: '2023-05',
      description: 'Developed and maintained frontend applications using React and TypeScript. Implemented responsive designs and improved performance of existing applications.',
    },
    {
      title: 'Junior Web Developer',
      company: 'Digital Agency',
      location: 'Boston, MA',
      startDate: '2018-08',
      endDate: '2020-05',
      description: 'Created websites and web applications for clients using HTML, CSS, and JavaScript. Collaborated with designers to implement UI/UX designs.',
    }
  ],
  resumeUrl: '/resumes/john-smith.pdf',
  coverLetterUrl: '/cover-letters/john-smith.pdf',
  notes: 'Strong candidate with excellent frontend skills.',
  interviews: [
    {
      id: 1,
      type: 'Initial Screening',
      date: '2025-04-02',
      time: '10:00 AM',
      interviewer: 'Jane Doe',
      status: 'scheduled',
      notes: '',
    }
  ],
  assessments: [
    {
      id: 1,
      name: 'Frontend Technical Assessment',
      score: 85,
      maxScore: 100,
      completedDate: '2025-03-28',
      status: 'completed',
    }
  ]
};

export default function ApplicantDetail({ applicantId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [applicant, setApplicant] = useState(mockApplicant);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [notes, setNotes] = useState(mockApplicant.notes);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState({
    type: 'Technical Interview',
    date: '',
    time: '',
    interviewer: '',
  });

  // In a real app, we would fetch the applicant data based on the applicantId
  // useEffect(() => {
  //   const fetchApplicantData = async () => {
  //     try {
  //       const response = await fetch(`/api/hiring-manager/applicants/${applicantId}`);
  //       const data = await response.json();
  //       setApplicant(data);
  //       setNotes(data.notes);
  //     } catch (error) {
  //       console.error('Error fetching applicant data:', error);
  //     }
  //   };
  //
  //   fetchApplicantData();
  // }, [applicantId]);

  // Handle changing applicant status
  const handleChangeStatus = (newStatus) => {
    // In a real app, this would make an API call
    setApplicant({ ...applicant, status: newStatus });
    
    toast({
      title: "Status Updated",
      description: `${applicant.name}'s status has been updated to ${newStatus}.`,
    });
  };

  // Handle rejecting an applicant
  const handleRejectApplicant = () => {
    setShowRejectDialog(true);
  };

  // Confirm rejection
  const confirmRejectApplicant = () => {
    // In a real app, this would make an API call
    setApplicant({ ...applicant, status: 'rejected' });
    setNotes(notes + `\n\nRejection reason: ${rejectReason}`);
    
    toast({
      title: "Applicant Rejected",
      description: `${applicant.name} has been rejected.`,
    });
    
    setShowRejectDialog(false);
    setRejectReason('');
  };

  // Handle saving notes
  const handleSaveNotes = () => {
    // In a real app, this would make an API call
    toast({
      title: "Notes Saved",
      description: "Applicant notes have been saved successfully.",
    });
  };

  // Handle scheduling an interview
  const handleScheduleInterview = () => {
    setShowScheduleDialog(true);
  };

  // Confirm interview scheduling
  const confirmScheduleInterview = () => {
    // In a real app, this would make an API call
    const newInterview = {
      id: applicant.interviews.length + 1,
      ...interviewDetails,
      status: 'scheduled',
      notes: '',
    };
    
    setApplicant({
      ...applicant,
      interviews: [...applicant.interviews, newInterview],
      status: 'interview',
    });
    
    toast({
      title: "Interview Scheduled",
      description: `${interviewDetails.type} has been scheduled for ${applicant.name}.`,
    });
    
    setShowScheduleDialog(false);
    setInterviewDetails({
      type: 'Technical Interview',
      date: '',
      time: '',
      interviewer: '',
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">New</Badge>;
      case 'review':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Review</Badge>;
      case 'interview':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Interview</Badge>;
      case 'offer':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Offer</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{applicant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{applicant.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className="flex items-center text-muted-foreground">
                <MailIcon className="mr-1 h-4 w-4" />
                <span>{applicant.email}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <PhoneIcon className="mr-1 h-4 w-4" />
                <span>{applicant.phone}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <BriefcaseIcon className="mr-1 h-4 w-4" />
                <span>Applied for: {applicant.jobTitle}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <CalendarIcon className="mr-1 h-4 w-4" />
                <span>Applied on: {formatDate(applicant.appliedDate)}</span>
              </div>
            </div>
            <div className="mt-2">
              {getStatusBadge(applicant.status)}
              <Badge variant="secondary" className="ml-2">
                <StarIcon className="mr-1 h-3 w-3" />
                {applicant.matchScore}% Match
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {applicant.status !== 'interview' && applicant.status !== 'offer' && applicant.status !== 'rejected' && (
            <Button onClick={handleScheduleInterview}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          )}
          {applicant.status !== 'offer' && applicant.status !== 'rejected' && (
            <Button variant="outline" onClick={() => handleChangeStatus('offer')}>
              <CheckCircleIcon className="mr-2 h-4 w-4" />
              Extend Offer
            </Button>
          )}
          {applicant.status !== 'rejected' && (
            <Button variant="destructive" onClick={handleRejectApplicant}>
              <XCircleIcon className="mr-2 h-4 w-4" />
              Reject
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="resume">Resume & Cover Letter</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {applicant.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Match Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall Match</span>
                    <span className="font-medium">{applicant.matchScore}%</span>
                  </div>
                  <Progress value={applicant.matchScore} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    This candidate has a strong match for the {applicant.jobTitle} position based on skills, experience, and qualifications.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {applicant.workHistory.map((job, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                        {job.endDate ? new Date(job.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present'}
                      </p>
                    </div>
                    <p className="text-sm">{job.description}</p>
                    {index < applicant.workHistory.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applicant.education.map((edu, index) => (
                  <div key={index} className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{edu.degree}</h3>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{edu.year}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resume" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Resume Preview</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Preview not available. Click the button below to download.
                    </p>
                    <Button variant="outline" className="mt-4">
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Download Resume
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Cover Letter Preview</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Preview not available. Click the button below to download.
                    </p>
                    <Button variant="outline" className="mt-4">
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Download Cover Letter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Scheduled Interviews</CardTitle>
                <CardDescription>
                  Manage interview schedule for {applicant.name}
                </CardDescription>
              </div>
              <Button onClick={handleScheduleInterview}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
            </CardHeader>
            <CardContent>
              {applicant.interviews.length > 0 ? (
                <div className="space-y-4">
                  {applicant.interviews.map((interview) => (
                    <Card key={interview.id}>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{interview.type}</CardTitle>
                          <Badge variant={interview.status === 'scheduled' ? 'outline' : 'secondary'}>
                            {interview.status === 'scheduled' ? 'Scheduled' : 'Completed'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="grid gap-2 md:grid-cols-3">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(interview.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{interview.time}</span>
                          </div>
                          <div className="flex items-center">
                            <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Interviewer: {interview.interviewer}</span>
                          </div>
                        </div>
                        {interview.notes && (
                          <div className="mt-4">
                            <p className="text-sm font-medium">Notes:</p>
                            <p className="text-sm text-muted-foreground">{interview.notes}</p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 border-t flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                        {interview.status === 'scheduled' && (
                          <Button size="sm">
                            Complete & Add Feedback
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Interviews Scheduled</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Schedule an interview with this candidate to begin the interview process.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills Assessments</CardTitle>
              <CardDescription>
                View assessment results for {applicant.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applicant.assessments.length > 0 ? (
                <div className="space-y-4">
                  {applicant.assessments.map((assessment) => (
                    <Card key={assessment.id}>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{assessment.name}</CardTitle>
                          <Badge variant={assessment.status === 'completed' ? 'secondary' : 'outline'}>
                            {assessment.status === 'completed' ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {assessment.status === 'completed' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>Score</span>
                              <span className="font-medium">{assessment.score}/{assessment.maxScore} ({Math.round((assessment.score / assessment.maxScore) * 100)}%)</span>
                            </div>
                            <Progress value={(assessment.score / assessment.maxScore) * 100} className="h-2" />
                            <div className="flex items-center text-sm text-muted-foreground">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              <span>Completed on: {formatDate(assessment.completedDate)}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 border-t flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {assessment.status !== 'completed' && (
                          <Button size="sm">
                            Send Reminder
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <ClipboardCheckIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Assessments</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This candidate has not completed any assessments yet.
                    </p>
                    <Button variant="outline" className="mt-4">
                      Send Assessment
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recruiter Notes</CardTitle>
              <CardDescription>
                Add notes and comments about this candidate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes about this candidate..."
                className="min-h-[200px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveNotes}>
                Save Notes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Applicant</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {applicant.name}? Please provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reject-reason" className="text-sm font-medium">
                Reason for Rejection
              </label>
              <textarea
                id="reject-reason"
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Please provide a reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRejectApplicant}
              disabled={!rejectReason.trim()}
            >
              Reject Applicant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Schedule an interview with {applicant.name} for the {applicant.jobTitle} position.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="interview-type" className="text-sm font-medium">
                Interview Type
              </label>
              <select
                id="interview-type"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={interviewDetails.type}
                onChange={(e) => setInterviewDetails({ ...interviewDetails, type: e.target.value })}
              >
                <option value="Initial Screening">Initial Screening</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="Behavioral Interview">Behavioral Interview</option>
                <option value="Culture Fit">Culture Fit</option>
                <option value="Final Interview">Final Interview</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="interview-date" className="text-sm font-medium">
                Date
              </label>
              <input
                id="interview-date"
                type="date"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={interviewDetails.date}
                onChange={(e) => setInterviewDetails({ ...interviewDetails, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="interview-time" className="text-sm font-medium">
                Time
              </label>
              <input
                id="interview-time"
                type="time"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={interviewDetails.time}
                onChange={(e) => setInterviewDetails({ ...interviewDetails, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="interviewer" className="text-sm font-medium">
                Interviewer
              </label>
              <input
                id="interviewer"
                type="text"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="e.g. Jane Doe"
                value={interviewDetails.interviewer}
                onChange={(e) => setInterviewDetails({ ...interviewDetails, interviewer: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmScheduleInterview}
              disabled={!interviewDetails.date || !interviewDetails.time || !interviewDetails.interviewer}
            >
              Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
