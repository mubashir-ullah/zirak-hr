'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2Icon,
  GlobeIcon,
  MapPinIcon,
  UsersIcon,
  CalendarIcon,
  EditIcon,
  BriefcaseIcon,
  HeartIcon,
  LightbulbIcon,
  AwardIcon
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

// Mock company data
const mockCompanyData = {
  companyName: 'Zirak Technologies',
  industry: 'Information Technology',
  companySize: '51-200',
  foundedYear: '2020',
  website: 'https://zirak.tech',
  location: 'San Francisco, CA',
  description: 'Zirak Technologies is a forward-thinking tech company specializing in AI-powered HR solutions. We help companies streamline their hiring processes and find the best talent for their teams.',
  mission: 'To revolutionize the hiring process through innovative technology and human-centered design.',
  values: 'Innovation, Integrity, Inclusion, Excellence',
  culture: 'We foster a collaborative environment where creativity thrives. Our team is diverse, passionate, and committed to making a difference in the HR tech space.',
  benefits: 'Competitive salary, health insurance, flexible work hours, remote work options, professional development budget, generous vacation policy.',
  logo: '/company-logo.png',
  teamMembers: [
    {
      id: 1,
      name: 'John Smith',
      position: 'CEO',
      email: 'john.smith@zirak.tech',
      role: 'admin',
      avatar: '/avatars/john-smith.png',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      position: 'HR Director',
      email: 'sarah.johnson@zirak.tech',
      role: 'admin',
      avatar: '/avatars/sarah-johnson.png',
    },
    {
      id: 3,
      name: 'Michael Brown',
      position: 'Recruiter',
      email: 'michael.brown@zirak.tech',
      role: 'recruiter',
      avatar: '/avatars/michael-brown.png',
    },
    {
      id: 4,
      name: 'Emily Davis',
      position: 'Technical Interviewer',
      email: 'emily.davis@zirak.tech',
      role: 'interviewer',
      avatar: '/avatars/emily-davis.png',
    },
  ],
  jobPostings: [
    { id: 1, title: 'Senior Frontend Developer', applicants: 24, status: 'active', posted: '2025-03-20' },
    { id: 2, title: 'UX Designer', applicants: 18, status: 'active', posted: '2025-03-18' },
    { id: 3, title: 'DevOps Engineer', applicants: 12, status: 'active', posted: '2025-03-15' },
    { id: 4, title: 'Product Manager', applicants: 32, status: 'active', posted: '2025-03-10' },
    { id: 5, title: 'Backend Developer', applicants: 16, status: 'filled', posted: '2025-02-28' },
  ],
};

export default function CompanyProfile({ companyData = null }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use mock data if no company data is provided
  const company = companyData || mockCompanyData;

  // Handle edit profile
  const handleEditProfile = () => {
    router.push('/dashboard/hiring-manager/company/edit');
  };

  // Handle view all jobs
  const handleViewAllJobs = () => {
    router.push('/dashboard/hiring-manager/jobs');
  };

  // Handle view all team members
  const handleViewAllTeamMembers = () => {
    router.push('/dashboard/hiring-manager/company/team');
  };

  // Format values as badges
  const formatValues = (valuesString) => {
    if (!valuesString) return [];
    return valuesString.split(',').map(value => value.trim());
  };

  // Format benefits as list items
  const formatBenefits = (benefitsString) => {
    if (!benefitsString) return [];
    return benefitsString.split(',').map(benefit => benefit.trim());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={company.logo} alt={company.companyName} />
            <AvatarFallback>{company.companyName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{company.companyName}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className="flex items-center text-muted-foreground">
                <Building2Icon className="mr-1 h-4 w-4" />
                <span>{company.industry}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPinIcon className="mr-1 h-4 w-4" />
                <span>{company.location}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <UsersIcon className="mr-1 h-4 w-4" />
                <span>{company.companySize} employees</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <CalendarIcon className="mr-1 h-4 w-4" />
                <span>Founded: {company.foundedYear}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <GlobeIcon className="mr-1 h-4 w-4" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {company.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>
          </div>
        </div>
        <Button onClick={handleEditProfile}>
          <EditIcon className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About {company.companyName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{company.description}</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <LightbulbIcon className="h-5 w-5 text-primary" />
                <CardTitle>Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{company.mission}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <AwardIcon className="h-5 w-5 text-primary" />
                <CardTitle>Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formatValues(company.values).map((value, index) => (
                    <Badge key={index} variant="secondary">{value}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <HeartIcon className="h-5 w-5 text-primary" />
                <CardTitle>Culture</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{company.culture}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <BriefcaseIcon className="h-5 w-5 text-primary" />
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {formatBenefits(company.benefits).map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  {company.teamMembers.length} team members
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleViewAllTeamMembers}>
                Manage Team
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {company.teamMembers.map((member) => (
                  <div key={member.id} className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 mb-2">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.position}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                    <Badge variant="outline" className="mt-2">
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Job Postings</CardTitle>
                <CardDescription>
                  {company.jobPostings.length} job postings
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleViewAllJobs}>
                View All Jobs
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {company.jobPostings.map((job) => (
                  <div key={job.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="font-medium">{job.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>Posted: {new Date(job.posted).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{job.applicants} applicants</span>
                      </div>
                    </div>
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline" className="w-full" onClick={handleViewAllJobs}>
                View All Job Postings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
