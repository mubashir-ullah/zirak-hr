'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Briefcase, MapPin, Clock, Building, ChevronRight,
  ClipboardList, AlertCircle, CheckCircle, XCircle, HourglassIcon,
  Calendar, FileText, ChevronLeft, RefreshCw, Filter, Trash,
  Search, SortAsc, SortDesc
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import ApplicationDetailView from './ApplicationDetailView'

// Status badge colors
const statusColors = {
  applied: 'primary',
  screening: 'secondary',
  interview: 'purple',
  offer: 'green',
  rejected: 'destructive',
  withdrawn: 'muted'
};

// Status labels for display
const statusLabels = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn'
};

interface Application {
  _id: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  appliedDate: string;
  lastStatusUpdateDate: string;
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    jobType?: string;
    salary?: string;
    description?: string;
  };
  interviews?: {
    _id: string;
    date: string;
    type: 'phone' | 'video' | 'in-person';
    interviewerName: string;
    notes: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  }[];
  matchScore?: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const MyApplications: React.FC = () => {
  const { data: session } = useSession();
  
  // State for applications data
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters and pagination
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('appliedDate');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  
  // State for selected application
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState<boolean>(false);
  
  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder
      });
      
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      
      const response = await fetch(`/api/talent/jobs/applications?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await response.json();
      setApplications(data.applications);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Effect to fetch applications when filters or pagination changes
  useEffect(() => {
    if (session) {
      fetchApplications();
    }
  }, [session, page, status, sortBy, sortOrder]);
  
  // Handle search
  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchApplications();
  };
  
  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1); // Reset to first page when filter changes
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1); // Reset to first page when sort changes
  };
  
  // Handle sort order toggle
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  // Handle application selection
  const handleApplicationClick = (applicationId: string) => {
    setSelectedApplication(applicationId);
    setDetailViewOpen(true);
  };
  
  // Handle detail view close
  const handleDetailViewClose = (refreshNeeded: boolean = false) => {
    setDetailViewOpen(false);
    setSelectedApplication(null);
    
    // Refresh applications if needed (e.g., after withdrawal or feedback)
    if (refreshNeeded) {
      fetchApplications();
    }
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    const color = statusColors[status as keyof typeof statusColors] || 'default';
    const label = statusLabels[status as keyof typeof statusLabels] || status;
    
    let Icon;
    switch (status) {
      case 'applied':
        Icon = ClipboardList;
        break;
      case 'screening':
        Icon = HourglassIcon;
        break;
      case 'interview':
        Icon = Calendar;
        break;
      case 'offer':
        Icon = CheckCircle;
        break;
      case 'rejected':
        Icon = XCircle;
        break;
      case 'withdrawn':
        Icon = Trash;
        break;
      default:
        Icon = ClipboardList;
    }
    
    return (
      <Badge variant={color as any} className="flex items-center">
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };
  
  // Render match score
  const renderMatchScore = (score?: number) => {
    if (score === undefined) return null;
    
    let color = "text-red-500";
    if (score >= 80) color = "text-green-500";
    else if (score >= 60) color = "text-amber-500";
    
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground">
          Match:
        </span>
        <span className={`text-sm font-bold ${color}`}>
          {score}%
        </span>
      </div>
    );
  };
  
  // Render upcoming interview badge if any
  const renderUpcomingInterview = (application: Application) => {
    if (!application.interviews || application.interviews.length === 0) return null;
    
    // Find the next scheduled interview
    const upcomingInterview = application.interviews
      .filter(interview => interview.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    
    if (!upcomingInterview) return null;
    
    const interviewDate = new Date(upcomingInterview.date);
    const formattedDate = format(interviewDate, 'MMM d, yyyy');
    
    return (
      <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
        <Calendar className="h-3 w-3 mr-1" />
        Interview: {formattedDate}
      </Badge>
    );
  };
  
  if (!session) {
    return (
      <div className="p-6 text-center">
        <p>Please sign in to view your applications</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Applications</h2>
          <p className="text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchApplications}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
      
      {/* Filters and search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Input
            placeholder="Search by job title, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pr-10"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="screening">Screening</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Sort By" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="appliedDate">Date Applied</SelectItem>
            <SelectItem value="lastStatusUpdateDate">Last Updated</SelectItem>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="title">Job Title</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          onClick={toggleSortOrder}
          className="flex items-center"
        >
          {sortOrder === 'asc' ? (
            <>
              <SortAsc className="h-4 w-4 mr-1" />
              Ascending
            </>
          ) : (
            <>
              <SortDesc className="h-4 w-4 mr-1" />
              Descending
            </>
          )}
        </Button>
      </div>
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Applications list */}
          {applications.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-lg">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No applications found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {search || status !== 'all' 
                  ? 'Try adjusting your search filters'
                  : 'You haven\'t applied to any jobs yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card 
                  key={application._id}
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handleApplicationClick(application._id)}
                >
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-8">
                        <div className="flex flex-col">
                          <CardTitle className="text-lg mb-1">
                            {application.job.title}
                          </CardTitle>
                          <CardDescription className="flex items-center mb-2">
                            <Building className="h-4 w-4 mr-1" />
                            {application.job.company} • {application.job.location}
                          </CardDescription>
                          
                          <div className="flex items-center mt-2">
                            {renderStatusBadge(application.status)}
                            {renderUpcomingInterview(application)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:col-span-4 flex flex-col justify-between items-start md:items-end">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Applied: {format(new Date(application.appliedDate), 'MMM d, yyyy')}
                          </p>
                          {application.lastStatusUpdateDate && (
                            <p className="text-sm text-muted-foreground">
                              Updated: {format(new Date(application.lastStatusUpdateDate), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        
                        {renderMatchScore(application.matchScore)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) handlePageChange(page - 1);
                      }}
                      className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    // Calculate page numbers to show (current page and surrounding pages)
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }}
                          isActive={pageNum === page}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < pagination.totalPages) handlePageChange(page + 1);
                      }}
                      className={page >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
      
      {/* Application Detail View */}
      {selectedApplication && detailViewOpen && (
        <ApplicationDetailView 
          applicationId={selectedApplication}
          onClose={handleDetailViewClose}
        />
      )}
    </div>
  );
};

export default MyApplications;
