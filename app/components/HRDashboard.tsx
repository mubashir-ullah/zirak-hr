'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  BriefcaseIcon, 
  CalendarIcon, 
  FileTextIcon, 
  PieChartIcon, 
  UsersIcon,
  PlusCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  Building2Icon
} from 'lucide-react';
import DashboardShell from '@/app/components/layout/DashboardShell';
import DashboardHeader from '@/app/components/layout/DashboardHeader';
import { useToast } from '@/components/ui/use-toast';

// Mock data for the dashboard
const mockJobPostings = [
  { id: 1, title: 'Senior Frontend Developer', applicants: 24, status: 'active', posted: '2025-03-20' },
  { id: 2, title: 'UX Designer', applicants: 18, status: 'active', posted: '2025-03-18' },
  { id: 3, title: 'DevOps Engineer', applicants: 12, status: 'active', posted: '2025-03-15' },
  { id: 4, title: 'Product Manager', applicants: 32, status: 'active', posted: '2025-03-10' },
  { id: 5, title: 'Backend Developer', applicants: 16, status: 'filled', posted: '2025-02-28' },
];

const mockCandidates = [
  { id: 1, name: 'John Smith', role: 'Senior Frontend Developer', status: 'interview', matchScore: 92 },
  { id: 2, name: 'Sarah Johnson', role: 'UX Designer', status: 'review', matchScore: 88 },
  { id: 3, name: 'Michael Brown', role: 'DevOps Engineer', status: 'new', matchScore: 85 },
  { id: 4, name: 'Emily Davis', role: 'Product Manager', status: 'interview', matchScore: 90 },
  { id: 5, name: 'David Wilson', role: 'Backend Developer', status: 'offer', matchScore: 95 },
];

const mockInterviews = [
  { id: 1, candidate: 'John Smith', position: 'Senior Frontend Developer', date: '2025-03-28', time: '10:00 AM' },
  { id: 2, candidate: 'Emily Davis', position: 'Product Manager', date: '2025-03-29', time: '2:00 PM' },
  { id: 3, candidate: 'Alex Johnson', position: 'UX Designer', date: '2025-03-30', time: '11:30 AM' },
];

export default function HRDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const handleCreateJob = () => {
    router.push('/dashboard/hiring-manager/jobs/create');
  };

  const handleViewAllJobs = () => {
    router.push('/dashboard/hiring-manager/jobs');
  };

  const handleViewAllCandidates = () => {
    router.push('/dashboard/hiring-manager/applicants');
  };

  const handleViewCompanyProfile = () => {
    router.push('/dashboard/hiring-manager/company');
  };

  const handleViewAllInterviews = () => {
    router.push('/dashboard/hiring-manager/interviews');
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Hiring Manager Dashboard"
        text="Manage your job postings, candidates, and hiring pipeline."
      >
        <Button onClick={handleCreateJob}>
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Post New Job
        </Button>
      </DashboardHeader>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <PieChartIcon className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="jobs">
            <BriefcaseIcon className="mr-2 h-4 w-4" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="candidates">
            <UsersIcon className="mr-2 h-4 w-4" />
            Candidates
          </TabsTrigger>
          <TabsTrigger value="interviews">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Interviews
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building2Icon className="mr-2 h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Job Postings</CardTitle>
                <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockJobPostings.filter(job => job.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockCandidates.length}</div>
                <p className="text-xs text-muted-foreground">
                  +8 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockInterviews.length}</div>
                <p className="text-xs text-muted-foreground">
                  +1 from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hiring Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24%</div>
                <p className="text-xs text-muted-foreground">
                  +5.2% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Job Postings</CardTitle>
                <CardDescription>
                  Your most recent job postings and their performance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockJobPostings.slice(0, 3).map(job => (
                    <div key={job.id} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.applicants} applicants • Posted on {new Date(job.posted).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {job.status === 'active' ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            Filled
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full" onClick={handleViewAllJobs}>
                  View All Jobs
                </Button>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
                <CardDescription>
                  Your scheduled interviews for the next few days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockInterviews.map(interview => (
                    <div key={interview.id} className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{interview.candidate}</p>
                        <p className="text-sm text-muted-foreground">
                          {interview.position} • {interview.date} at {interview.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full" onClick={handleViewAllInterviews}>
                  View All Interviews
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Postings</CardTitle>
              <CardDescription>
                Manage your current job postings and create new ones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockJobPostings.map(job => (
                  <div key={job.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.applicants} applicants • Posted on {new Date(job.posted).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {job.status === 'active' ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          Filled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <Button variant="outline" onClick={handleViewAllJobs}>
                  View All
                </Button>
                <Button onClick={handleCreateJob}>
                  <PlusCircleIcon className="mr-2 h-4 w-4" />
                  Post New Job
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidates</CardTitle>
              <CardDescription>
                Review and manage candidates for your job postings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCandidates.map(candidate => (
                  <div key={candidate.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {candidate.role} • Match Score: {candidate.matchScore}%
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {candidate.status === 'new' && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          <ClockIcon className="mr-1 h-3 w-3" />
                          New
                        </span>
                      )}
                      {candidate.status === 'review' && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          <FileTextIcon className="mr-1 h-3 w-3" />
                          Review
                        </span>
                      )}
                      {candidate.status === 'interview' && (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          Interview
                        </span>
                      )}
                      {candidate.status === 'offer' && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          <CheckCircleIcon className="mr-1 h-3 w-3" />
                          Offer
                        </span>
                      )}
                      {candidate.status === 'rejected' && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          <XCircleIcon className="mr-1 h-3 w-3" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-6 w-full" onClick={handleViewAllCandidates}>
                View All Candidates
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>
                Your scheduled interviews for the next few days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInterviews.map(interview => (
                  <div key={interview.id} className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{interview.candidate}</p>
                      <p className="text-sm text-muted-foreground">
                        {interview.position} • {interview.date} at {interview.time}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-6 w-full" onClick={handleViewAllInterviews}>
                View All Interviews
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>
                  Manage your company profile, team members, and company culture.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="flex flex-col space-y-8 md:flex-row md:space-x-8 md:space-y-0">
                  <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 md:w-1/3">
                    <Building2Icon className="h-8 w-8 text-primary" />
                    <h3 className="text-center text-lg font-medium">Company Profile</h3>
                    <p className="text-center text-sm text-muted-foreground">
                      Manage your company details, mission, values, and culture.
                    </p>
                    <Button variant="outline" className="mt-auto w-full" onClick={handleViewCompanyProfile}>
                      View Profile
                    </Button>
                  </div>
                  <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 md:w-1/3">
                    <UsersIcon className="h-8 w-8 text-primary" />
                    <h3 className="text-center text-lg font-medium">Team Management</h3>
                    <p className="text-center text-sm text-muted-foreground">
                      Manage your team members, roles, and permissions.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-auto w-full" 
                      onClick={() => router.push('/dashboard/hiring-manager/company/team')}
                    >
                      Manage Team
                    </Button>
                  </div>
                  <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 md:w-1/3">
                    <FileTextIcon className="h-8 w-8 text-primary" />
                    <h3 className="text-center text-lg font-medium">Edit Profile</h3>
                    <p className="text-center text-sm text-muted-foreground">
                      Update your company information, logo, and details.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-auto w-full" 
                      onClick={() => router.push('/dashboard/hiring-manager/company/edit')}
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hiring Analytics</CardTitle>
              <CardDescription>
                View analytics and insights about your hiring process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Analytics Coming Soon</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Detailed hiring analytics will be available in a future update.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
