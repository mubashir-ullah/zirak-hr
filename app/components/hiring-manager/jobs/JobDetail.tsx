'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BriefcaseIcon, 
  MapPinIcon, 
  CalendarIcon, 
  DollarSignIcon,
  ClockIcon,
  UsersIcon,
  BuildingIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  BarChartIcon,
  ShareIcon
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

// Mock job data
const mockJob = {
  id: 1,
  title: 'Senior Frontend Developer',
  company: 'Zirak Technologies',
  location: 'New York, NY',
  locationType: 'hybrid',
  employmentType: 'full-time',
  experienceLevel: 'senior',
  salaryMin: 120000,
  salaryMax: 150000,
  applicants: 24,
  status: 'active',
  posted: '2025-03-20',
  deadline: '2025-04-20',
  description: `
    We are looking for a Senior Frontend Developer to join our team and help us build amazing user experiences. You will be responsible for implementing visual elements and their behaviors with user interactions. You will work with both front-end and back-end web developers to build all client-side logic. You will also be bridging the gap between the visual elements and the server-side infrastructure, taking an active role on both sides, and defining how the application looks and functions.
  `,
  requirements: `
    - 5+ years of experience in frontend development
    - Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model
    - Thorough understanding of React.js and its core principles
    - Experience with popular React.js workflows (such as Redux)
    - Familiarity with newer specifications of ECMAScript
    - Experience with data structure libraries (e.g., Immutable.js)
    - Knowledge of isomorphic React is a plus
    - Understanding of RESTful APIs
    - Knowledge of modern authorization mechanisms, such as JSON Web Token
    - Familiarity with modern front-end build pipelines and tools
    - Experience with common front-end development tools such as Babel, Webpack, NPM, etc.
    - A knack for benchmarking and optimization
    - Familiarity with code versioning tools (such as Git)
  `,
  responsibilities: `
    - Developing new user-facing features using React.js
    - Building reusable components and front-end libraries for future use
    - Translating designs and wireframes into high-quality code
    - Optimizing components for maximum performance across a vast array of web-capable devices and browsers
    - Participating in code reviews and providing constructive feedback to other developers
  `,
  benefits: `
    - Competitive salary
    - Health, dental, and vision insurance
    - 401(k) with company match
    - Flexible work hours
    - Remote work options
    - Professional development budget
    - Generous vacation policy
    - Parental leave
    - Company-sponsored events and team building activities
  `,
  skills: ['React', 'JavaScript', 'TypeScript', 'Redux', 'HTML', 'CSS', 'REST APIs', 'Git'],
  applicantsList: [
    { id: 1, name: 'John Smith', matchScore: 92, status: 'interview' },
    { id: 2, name: 'Sarah Johnson', matchScore: 88, status: 'review' },
    { id: 3, name: 'Michael Brown', matchScore: 85, status: 'new' },
    { id: 4, name: 'Emily Davis', matchScore: 90, status: 'interview' },
    { id: 5, name: 'David Wilson', matchScore: 95, status: 'offer' },
  ]
};

export default function JobDetail({ jobId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [job, setJob] = useState(mockJob);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // In a real app, we would fetch the job data based on the jobId
  // useEffect(() => {
  //   const fetchJobData = async () => {
  //     try {
  //       const response = await fetch(`/api/hiring-manager/jobs/${jobId}`);
  //       const data = await response.json();
  //       setJob(data);
  //     } catch (error) {
  //       console.error('Error fetching job data:', error);
  //     }
  //   };
  //
  //   fetchJobData();
  // }, [jobId]);

  // Handle job editing
  const handleEditJob = () => {
    router.push(`/dashboard/hiring-manager/jobs/edit/${job.id}`);
  };

  // Handle job deletion
  const handleDeleteJob = () => {
    setShowDeleteDialog(true);
  };

  // Confirm job deletion
  const confirmDeleteJob = () => {
    // In a real app, this would make an API call
    toast({
      title: "Job Deleted",
      description: `The job posting "${job.title}" has been deleted.`,
    });
    
    router.push('/dashboard/hiring-manager/jobs');
  };

  // Handle viewing all applicants
  const handleViewAllApplicants = () => {
    router.push(`/dashboard/hiring-manager/jobs/${job.id}/applicants`);
  };

  // Handle changing job status
  const handleChangeStatus = (newStatus) => {
    // In a real app, this would make an API call
    setJob({ ...job, status: newStatus });
    
    toast({
      title: "Status Updated",
      description: `The job posting status has been updated to ${newStatus}.`,
    });
  };

  // Format salary range
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (min && !max) return `$${min.toLocaleString()}+`;
    if (!min && max) return `Up to $${max.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{job.title}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="flex items-center text-muted-foreground">
              <BuildingIcon className="mr-1 h-4 w-4" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPinIcon className="mr-1 h-4 w-4" />
              <span>{job.location} ({job.locationType})</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <DollarSignIcon className="mr-1 h-4 w-4" />
              <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <CalendarIcon className="mr-1 h-4 w-4" />
              <span>Posted: {formatDate(job.posted)}</span>
            </div>
            {job.deadline && (
              <div className="flex items-center text-muted-foreground">
                <ClockIcon className="mr-1 h-4 w-4" />
                <span>Deadline: {formatDate(job.deadline)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleEditJob}>
            <EditIcon className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => handleChangeStatus(job.status === 'active' ? 'filled' : 'active')}>
            {job.status === 'active' ? (
              <>
                <CheckCircleIcon className="mr-2 h-4 w-4" />
                Mark as Filled
              </>
            ) : (
              <>
                <CheckCircleIcon className="mr-2 h-4 w-4" />
                Mark as Active
              </>
            )}
          </Button>
          <Button variant="destructive" onClick={handleDeleteJob}>
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <Badge variant="outline" className={`
            ${job.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}
            ${job.status === 'filled' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
            ${job.status === 'draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
            ${job.status === 'expired' ? 'bg-red-50 text-red-700 border-red-200' : ''}
          `}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center">
          <UsersIcon className="mr-1 h-4 w-4 text-muted-foreground" />
          <span>{job.applicants} Applicants</span>
        </div>
        <div className="flex items-center">
          <BriefcaseIcon className="mr-1 h-4 w-4 text-muted-foreground" />
          <span>{job.employmentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">
            Job Details
          </TabsTrigger>
          <TabsTrigger value="applicants">
            Applicants ({job.applicants})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{job.description}</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {job.requirements.split('\n').filter(req => req.trim()).map((req, index) => (
                    <li key={index}>{req.replace(/^-\s*/, '')}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {job.responsibilities.split('\n').filter(resp => resp.trim()).map((resp, index) => (
                    <li key={index}>{resp.replace(/^-\s*/, '')}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {job.benefits.split('\n').filter(benefit => benefit.trim()).map((benefit, index) => (
                    <li key={index}>{benefit.replace(/^-\s*/, '')}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Share Job</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/jobs/${job.id}`);
                  toast({
                    title: "Link Copied",
                    description: "Job posting link has been copied to clipboard.",
                  });
                }}>
                  <ShareIcon className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button variant="outline" onClick={() => {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/jobs/${job.id}`)}`, '_blank');
                }}>
                  Share on LinkedIn
                </Button>
                <Button variant="outline" onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`We're hiring a ${job.title} at ${job.company}! Check out the job posting:`)}&url=${encodeURIComponent(`${window.location.origin}/jobs/${job.id}`)}`, '_blank');
                }}>
                  Share on Twitter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applicants" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Applicants</CardTitle>
                <CardDescription>
                  Showing {Math.min(5, job.applicantsList.length)} of {job.applicants} applicants
                </CardDescription>
              </div>
              <Button onClick={handleViewAllApplicants}>View All Applicants</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {job.applicantsList.slice(0, 5).map((applicant) => (
                  <div key={applicant.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {applicant.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{applicant.name}</p>
                        <p className="text-sm text-muted-foreground">Match Score: {applicant.matchScore}%</p>
                      </div>
                    </div>
                    <div>
                      {applicant.status === 'new' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          New
                        </Badge>
                      )}
                      {applicant.status === 'review' && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          In Review
                        </Badge>
                      )}
                      {applicant.status === 'interview' && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          Interview
                        </Badge>
                      )}
                      {applicant.status === 'offer' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Offer
                        </Badge>
                      )}
                      {applicant.status === 'rejected' && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline" className="w-full" onClick={handleViewAllApplicants}>
                View All Applicants
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Performance Analytics</CardTitle>
              <CardDescription>
                View analytics and insights about this job posting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <BarChartIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Analytics Coming Soon</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Detailed job performance analytics will be available in a future update.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the job posting "{job.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteJob}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
