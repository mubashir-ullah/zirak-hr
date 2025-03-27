'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  SearchIcon, 
  FilterIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  ClipboardCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MoreHorizontalIcon
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
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for applicants
const mockApplicants = [
  {
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
    education: 'Bachelor of Computer Science',
    resumeUrl: '/resumes/john-smith.pdf',
    coverLetterUrl: '/cover-letters/john-smith.pdf',
    notes: 'Strong candidate with excellent frontend skills.',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 234-5678',
    jobTitle: 'Senior Frontend Developer',
    jobId: 1,
    appliedDate: '2025-03-24',
    status: 'review',
    matchScore: 88,
    skills: ['React', 'JavaScript', 'TypeScript', 'Angular', 'HTML', 'CSS'],
    experience: '6 years',
    education: 'Master of Computer Science',
    resumeUrl: '/resumes/sarah-johnson.pdf',
    coverLetterUrl: '/cover-letters/sarah-johnson.pdf',
    notes: 'Good experience with both React and Angular.',
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '+1 (555) 345-6789',
    jobTitle: 'Senior Frontend Developer',
    jobId: 1,
    appliedDate: '2025-03-23',
    status: 'new',
    matchScore: 85,
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Node.js'],
    experience: '5 years',
    education: 'Bachelor of Information Technology',
    resumeUrl: '/resumes/michael-brown.pdf',
    coverLetterUrl: '/cover-letters/michael-brown.pdf',
    notes: 'Solid frontend skills with some backend experience.',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '+1 (555) 456-7890',
    jobTitle: 'Senior Frontend Developer',
    jobId: 1,
    appliedDate: '2025-03-22',
    status: 'interview',
    matchScore: 90,
    skills: ['React', 'JavaScript', 'TypeScript', 'Redux', 'HTML', 'CSS', 'GraphQL'],
    experience: '8 years',
    education: 'Master of Software Engineering',
    resumeUrl: '/resumes/emily-davis.pdf',
    coverLetterUrl: '/cover-letters/emily-davis.pdf',
    notes: 'Excellent communication skills and technical knowledge.',
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '+1 (555) 567-8901',
    jobTitle: 'Senior Frontend Developer',
    jobId: 1,
    appliedDate: '2025-03-21',
    status: 'offer',
    matchScore: 95,
    skills: ['React', 'JavaScript', 'TypeScript', 'Redux', 'HTML', 'CSS', 'Testing'],
    experience: '9 years',
    education: 'PhD in Computer Science',
    resumeUrl: '/resumes/david-wilson.pdf',
    coverLetterUrl: '/cover-letters/david-wilson.pdf',
    notes: 'Top candidate with exceptional technical skills and leadership experience.',
  },
  {
    id: 6,
    name: 'Jennifer Lee',
    email: 'jennifer.lee@example.com',
    phone: '+1 (555) 678-9012',
    jobTitle: 'UX Designer',
    jobId: 2,
    appliedDate: '2025-03-20',
    status: 'new',
    matchScore: 87,
    skills: ['UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Prototyping'],
    experience: '4 years',
    education: 'Bachelor of Design',
    resumeUrl: '/resumes/jennifer-lee.pdf',
    coverLetterUrl: '/cover-letters/jennifer-lee.pdf',
    notes: 'Creative designer with good portfolio.',
  },
  {
    id: 7,
    name: 'Robert Garcia',
    email: 'robert.garcia@example.com',
    phone: '+1 (555) 789-0123',
    jobTitle: 'DevOps Engineer',
    jobId: 3,
    appliedDate: '2025-03-19',
    status: 'interview',
    matchScore: 91,
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
    experience: '6 years',
    education: 'Master of Information Systems',
    resumeUrl: '/resumes/robert-garcia.pdf',
    coverLetterUrl: '/cover-letters/robert-garcia.pdf',
    notes: 'Strong DevOps background with excellent cloud experience.',
  },
  {
    id: 8,
    name: 'Amanda Martinez',
    email: 'amanda.martinez@example.com',
    phone: '+1 (555) 890-1234',
    jobTitle: 'Product Manager',
    jobId: 4,
    appliedDate: '2025-03-18',
    status: 'rejected',
    matchScore: 82,
    skills: ['Product Management', 'Agile', 'User Stories', 'Roadmapping', 'Analytics'],
    experience: '5 years',
    education: 'MBA',
    resumeUrl: '/resumes/amanda-martinez.pdf',
    coverLetterUrl: '/cover-letters/amanda-martinez.pdf',
    notes: 'Good product background but lacks technical knowledge required for this role.',
  },
];

export default function ApplicantList({ jobId = null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [applicants, setApplicants] = useState(mockApplicants);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('matchScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Filter applicants based on job ID if provided
  const jobApplicants = jobId 
    ? applicants.filter(applicant => applicant.jobId === parseInt(jobId))
    : applicants;

  // Filter applicants based on search query and status
  const filteredApplicants = jobApplicants.filter(applicant => {
    // Filter by search query
    const matchesSearch = 
      applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort applicants
  const sortedApplicants = [...filteredApplicants].sort((a, b) => {
    if (sortBy === 'matchScore') {
      return sortOrder === 'desc' ? b.matchScore - a.matchScore : a.matchScore - b.matchScore;
    } else if (sortBy === 'appliedDate') {
      return sortOrder === 'desc' 
        ? new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
        : new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
    } else if (sortBy === 'name') {
      return sortOrder === 'desc'
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name);
    }
    return 0;
  });

  // Handle viewing applicant details
  const handleViewApplicant = (applicant) => {
    router.push(`/dashboard/hiring-manager/applicants/${applicant.id}`);
  };

  // Handle changing applicant status
  const handleChangeStatus = (applicant, newStatus) => {
    // In a real app, this would make an API call
    const updatedApplicants = applicants.map(a => 
      a.id === applicant.id ? { ...a, status: newStatus } : a
    );
    setApplicants(updatedApplicants);
    
    toast({
      title: "Status Updated",
      description: `${applicant.name}'s status has been updated to ${newStatus}.`,
    });
  };

  // Handle rejecting an applicant
  const handleRejectApplicant = (applicant) => {
    setSelectedApplicant(applicant);
    setShowRejectDialog(true);
  };

  // Confirm rejection
  const confirmRejectApplicant = () => {
    // In a real app, this would make an API call
    const updatedApplicants = applicants.map(a => 
      a.id === selectedApplicant.id ? { ...a, status: 'rejected', notes: a.notes + `\n\nRejection reason: ${rejectReason}` } : a
    );
    setApplicants(updatedApplicants);
    
    toast({
      title: "Applicant Rejected",
      description: `${selectedApplicant.name} has been rejected.`,
    });
    
    setShowRejectDialog(false);
    setSelectedApplicant(null);
    setRejectReason('');
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

  // Toggle sort order
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {jobId ? `Applicants for ${jobApplicants[0]?.jobTitle || 'Job'}` : 'All Applicants'}
          </h2>
          <p className="text-muted-foreground">
            {filteredApplicants.length} applicants found
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or skills..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="review">In Review</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle>Applicants</CardTitle>
          <CardDescription>
            Review and manage job applicants
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <button 
                    className="flex items-center space-x-1 hover:text-primary"
                    onClick={() => toggleSort('name')}
                  >
                    <span>Applicant</span>
                    {getSortIcon('name')}
                  </button>
                </TableHead>
                <TableHead>Job</TableHead>
                <TableHead>
                  <button 
                    className="flex items-center space-x-1 hover:text-primary"
                    onClick={() => toggleSort('matchScore')}
                  >
                    <span>Match Score</span>
                    {getSortIcon('matchScore')}
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center space-x-1 hover:text-primary"
                    onClick={() => toggleSort('appliedDate')}
                  >
                    <span>Applied Date</span>
                    {getSortIcon('appliedDate')}
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedApplicants.length > 0 ? (
                sortedApplicants.map((applicant) => (
                  <TableRow key={applicant.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{applicant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{applicant.name}</div>
                          <div className="text-sm text-muted-foreground">{applicant.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{applicant.jobTitle}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={applicant.matchScore} className="w-[80px]" />
                        <span>{applicant.matchScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(applicant.appliedDate)}</TableCell>
                    <TableCell>{getStatusBadge(applicant.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewApplicant(applicant)}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          {applicant.status !== 'new' && (
                            <DropdownMenuItem onClick={() => handleChangeStatus(applicant, 'new')}>
                              Mark as New
                            </DropdownMenuItem>
                          )}
                          {applicant.status !== 'review' && (
                            <DropdownMenuItem onClick={() => handleChangeStatus(applicant, 'review')}>
                              Move to Review
                            </DropdownMenuItem>
                          )}
                          {applicant.status !== 'interview' && (
                            <DropdownMenuItem onClick={() => handleChangeStatus(applicant, 'interview')}>
                              Schedule Interview
                            </DropdownMenuItem>
                          )}
                          {applicant.status !== 'offer' && (
                            <DropdownMenuItem onClick={() => handleChangeStatus(applicant, 'offer')}>
                              Extend Offer
                            </DropdownMenuItem>
                          )}
                          {applicant.status !== 'rejected' && (
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleRejectApplicant(applicant)}
                            >
                              <XCircleIcon className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No applicants found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Applicant</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {selectedApplicant?.name}? Please provide a reason for rejection.
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
    </div>
  );
}
