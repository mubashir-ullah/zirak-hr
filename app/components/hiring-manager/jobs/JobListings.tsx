'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BriefcaseIcon, 
  PlusCircleIcon, 
  SearchIcon, 
  FilterIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  UsersIcon,
  ClockIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

// Mock data for job listings
const mockJobs = [
  {
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
  },
  {
    id: 2,
    title: 'UX Designer',
    company: 'Zirak Technologies',
    location: 'San Francisco, CA',
    locationType: 'remote',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salaryMin: 90000,
    salaryMax: 120000,
    applicants: 18,
    status: 'active',
    posted: '2025-03-18',
    deadline: '2025-04-18',
  },
  {
    id: 3,
    title: 'DevOps Engineer',
    company: 'Zirak Technologies',
    location: 'Austin, TX',
    locationType: 'onsite',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salaryMin: 100000,
    salaryMax: 130000,
    applicants: 12,
    status: 'active',
    posted: '2025-03-15',
    deadline: '2025-04-15',
  },
  {
    id: 4,
    title: 'Product Manager',
    company: 'Zirak Technologies',
    location: 'Chicago, IL',
    locationType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    salaryMin: 110000,
    salaryMax: 140000,
    applicants: 32,
    status: 'active',
    posted: '2025-03-10',
    deadline: '2025-04-10',
  },
  {
    id: 5,
    title: 'Backend Developer',
    company: 'Zirak Technologies',
    location: 'Seattle, WA',
    locationType: 'remote',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salaryMin: 95000,
    salaryMax: 125000,
    applicants: 16,
    status: 'filled',
    posted: '2025-02-28',
    deadline: '2025-03-28',
  },
  {
    id: 6,
    title: 'Marketing Specialist',
    company: 'Zirak Technologies',
    location: 'Miami, FL',
    locationType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'entry',
    salaryMin: 60000,
    salaryMax: 80000,
    applicants: 45,
    status: 'draft',
    posted: '2025-03-25',
    deadline: '2025-04-25',
  },
  {
    id: 7,
    title: 'Data Scientist',
    company: 'Zirak Technologies',
    location: 'Boston, MA',
    locationType: 'remote',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    salaryMin: 130000,
    salaryMax: 160000,
    applicants: 8,
    status: 'active',
    posted: '2025-03-22',
    deadline: '2025-04-22',
  },
];

export default function JobListings() {
  const router = useRouter();
  const { toast } = useToast();
  const [jobs, setJobs] = useState(mockJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationTypeFilter, setLocationTypeFilter] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  // Handle job creation
  const handleCreateJob = () => {
    router.push('/dashboard/hiring-manager/jobs/create');
  };

  // Handle job editing
  const handleEditJob = (jobId) => {
    router.push(`/dashboard/hiring-manager/jobs/edit/${jobId}`);
  };

  // Handle job deletion
  const handleDeleteJob = (job) => {
    setJobToDelete(job);
    setShowDeleteDialog(true);
  };

  // Confirm job deletion
  const confirmDeleteJob = () => {
    // In a real app, this would make an API call
    setJobs(jobs.filter(job => job.id !== jobToDelete.id));
    
    toast({
      title: "Job Deleted",
      description: `The job posting "${jobToDelete.title}" has been deleted.`,
    });
    
    setShowDeleteDialog(false);
    setJobToDelete(null);
  };

  // Handle viewing job applicants
  const handleViewApplicants = (jobId) => {
    router.push(`/dashboard/hiring-manager/jobs/${jobId}/applicants`);
  };

  // Handle viewing job details
  const handleViewJob = (jobId) => {
    router.push(`/dashboard/hiring-manager/jobs/${jobId}`);
  };

  // Filter jobs based on search query and filters
  const filteredJobs = jobs.filter(job => {
    // Filter by search query
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    // Filter by location type
    const matchesLocationType = locationTypeFilter === 'all' || job.locationType === locationTypeFilter;
    
    return matchesSearch && matchesStatus && matchesLocationType;
  });

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Job Postings</h2>
          <p className="text-muted-foreground">
            Manage your job postings and view applicants.
          </p>
        </div>
        <Button onClick={handleCreateJob}>
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Post New Job
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={locationTypeFilter} onValueChange={setLocationTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle>Job Listings</CardTitle>
          <CardDescription>
            You have {filteredJobs.length} job postings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{job.location}</span>
                        <span className="text-xs text-muted-foreground">
                          {job.locationType === 'remote' && 'Remote'}
                          {job.locationType === 'onsite' && 'On-site'}
                          {job.locationType === 'hybrid' && 'Hybrid'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatSalary(job.salaryMin, job.salaryMax)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <UsersIcon className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{job.applicants}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.status === 'active' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      )}
                      {job.status === 'filled' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Filled
                        </Badge>
                      )}
                      {job.status === 'draft' && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Draft
                        </Badge>
                      )}
                      {job.status === 'expired' && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Expired
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDate(job.posted)}</span>
                        {job.deadline && (
                          <span className="flex items-center text-xs text-muted-foreground">
                            <ClockIcon className="mr-1 h-3 w-3" />
                            Closes: {formatDate(job.deadline)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewJob(job.id)}>
                            <EyeIcon className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditJob(job.id)}>
                            <EditIcon className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewApplicants(job.id)}>
                            <UsersIcon className="mr-2 h-4 w-4" />
                            View Applicants ({job.applicants})
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteJob(job)}
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No jobs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the job posting "{jobToDelete?.title}"? This action cannot be undone.
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
