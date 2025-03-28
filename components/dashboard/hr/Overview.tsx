'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Briefcase, Users, FileText, BarChart3, ChevronRight, 
  Clock, Calendar, UserPlus, CheckCircle, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'

// Activity type definition
type Activity = {
  _id: string
  type: 'application' | 'interview' | 'job' | 'candidate'
  title: string
  description: string
  timestamp: string
  icon: string
  color: string
}

// Job type definition
type Job = {
  _id: string
  title: string
  type: string
  location: string
  applicants: number
  postedDate: string
  closingDate: string
  status: string
}

// Stats type definition
type Stats = {
  activeJobs: number
  totalCandidates: number
  pendingApplications: number
  scheduledInterviews: number
}

export default function Overview() {
  const { data: session } = useSession()
  const [timeFilter, setTimeFilter] = useState('month')
  const [profileData, setProfileData] = useState({
    name: '',
    position: '',
    profilePicture: '',
    companyName: '',
    companyLogo: ''
  })
  const [stats, setStats] = useState<Stats>({
    activeJobs: 0,
    totalCandidates: 0,
    pendingApplications: 0,
    scheduledInterviews: 0
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState({
    profile: true,
    stats: true,
    activities: true,
    jobs: true
  })
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.email) return
      
      try {
        const response = await fetch('/api/user/profile')
        const data = await response.json()
        
        if (data.success) {
          setProfileData({
            name: data.userProfile?.name || session?.user?.name || '',
            position: data.userProfile?.position || 'HR Manager',
            profilePicture: data.userProfile?.profilePicture || '',
            companyName: data.companyInfo?.companyName || 'Your Company',
            companyLogo: data.companyInfo?.logoUrl || ''
          })
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setLoading(prev => ({ ...prev, profile: false }))
      }
    }
    
    fetchProfileData()
  }, [session])
  
  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.email) return
      
      try {
        const response = await fetch(`/api/dashboard/hr/stats?timeframe=${timeFilter}`)
        const data = await response.json()
        
        if (data.success) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(prev => ({ ...prev, stats: false }))
      }
    }
    
    fetchStats()
  }, [session, timeFilter])
  
  // Fetch recent activities
  useEffect(() => {
    const fetchActivities = async () => {
      if (!session?.user?.email) return
      
      try {
        const response = await fetch(`/api/dashboard/hr/activities?timeframe=${timeFilter}`)
        const data = await response.json()
        
        if (data.success) {
          setActivities(data.activities)
        }
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(prev => ({ ...prev, activities: false }))
      }
    }
    
    fetchActivities()
  }, [session, timeFilter])
  
  // Fetch job postings
  useEffect(() => {
    const fetchJobs = async () => {
      if (!session?.user?.email) return
      
      try {
        const response = await fetch('/api/dashboard/hr/jobs')
        const data = await response.json()
        
        if (data.success) {
          setJobs(data.jobs)
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(prev => ({ ...prev, jobs: false }))
      }
    }
    
    fetchJobs()
  }, [session])
  
  // Get icon component based on string name
  const getIconComponent = (iconName: string, size: number = 20, className: string = '') => {
    switch (iconName) {
      case 'UserPlus':
        return <UserPlus size={size} className={className} />
      case 'CheckCircle':
        return <CheckCircle size={size} className={className} />
      case 'Briefcase':
        return <Briefcase size={size} className={className} />
      case 'Users':
        return <Users size={size} className={className} />
      default:
        return <UserPlus size={size} className={className} />
    }
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return 'Invalid date'
    }
  }
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">HR Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'HR Manager'}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button 
            variant={timeFilter === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('week')}
            className={timeFilter !== 'week' ? 'dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10' : ''}
          >
            Week
          </Button>
          <Button 
            variant={timeFilter === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('month')}
            className={timeFilter !== 'month' ? 'dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10' : ''}
          >
            Month
          </Button>
          <Button 
            variant={timeFilter === 'quarter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('quarter')}
            className={timeFilter !== 'quarter' ? 'dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10' : ''}
          >
            Quarter
          </Button>
        </div>
      </div>
      
      {/* Company Profile Summary */}
      <Card className="mb-8">
        <CardContent className="p-6">
          {loading.profile ? (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Skeleton className="w-24 h-24 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-6" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                {profileData.companyLogo ? (
                  <Image 
                    src={profileData.companyLogo} 
                    alt={profileData.companyName} 
                    width={96}
                    height={96}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Briefcase size={40} className="text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-center md:text-left">{profileData.companyName}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-center md:text-left">
                  Managed by {profileData.name || session?.user?.name}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-[#D6FF00]" />
                      <span className="font-medium">Active Jobs</span>
                    </div>
                    {loading.stats ? (
                      <Skeleton className="h-8 w-12 mt-2" />
                    ) : (
                      <p className="text-2xl font-bold mt-2">{stats.activeJobs}</p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-[#D6FF00]" />
                      <span className="font-medium">Candidates</span>
                    </div>
                    {loading.stats ? (
                      <Skeleton className="h-8 w-12 mt-2" />
                    ) : (
                      <p className="text-2xl font-bold mt-2">{stats.totalCandidates}</p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-[#D6FF00]" />
                      <span className="font-medium">Applications</span>
                    </div>
                    {loading.stats ? (
                      <Skeleton className="h-8 w-12 mt-2" />
                    ) : (
                      <p className="text-2xl font-bold mt-2">{stats.pendingApplications}</p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-[#D6FF00]" />
                      <span className="font-medium">Interviews</span>
                    </div>
                    {loading.stats ? (
                      <Skeleton className="h-8 w-12 mt-2" />
                    ) : (
                      <p className="text-2xl font-bold mt-2">{stats.scheduledInterviews}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="hidden md:block">
                <Link href="/dashboard/hr/profile">
                  <Button variant="outline" className="dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Activity and Job Postings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your recruitment activities</CardDescription>
          </CardHeader>
          <CardContent>
            {loading.activities ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-start">
                    <Skeleton className="w-10 h-10 rounded-full mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity._id} className="flex items-start">
                    <div className={`w-10 h-10 rounded-full bg-${activity.color}-100 dark:bg-${activity.color}-900 flex items-center justify-center mr-3`}>
                      {getIconComponent(activity.icon, 20, `text-${activity.color}-600 dark:text-${activity.color}-400`)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No recent activities found</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-center dark:text-[#D6FF00] dark:hover:bg-[#D6FF00]/10">
              View All Activities <ChevronRight size={16} className="ml-1" />
            </Button>
          </CardFooter>
        </Card>
        
        {/* Active Job Postings */}
        <Card>
          <CardHeader>
            <CardTitle>Active Job Postings</CardTitle>
            <CardDescription>Currently open positions at your company</CardDescription>
          </CardHeader>
          <CardContent>
            {loading.jobs ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <Skeleton key={index} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job._id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{job.type} • {job.location}</p>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded">
                        {job.applicants} applicants
                      </div>
                    </div>
                    <div className="flex items-center mt-3 text-sm">
                      <Clock size={14} className="mr-1 text-gray-500" />
                      <span className="text-gray-500">Posted {formatDate(job.postedDate)}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-gray-500">Closes {formatDate(job.closingDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No active job postings found</p>
                <Link href="/dashboard/hr/jobs/create" className="mt-4 inline-block">
                  <Button size="sm">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Post a New Job
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-center dark:text-[#D6FF00] dark:hover:bg-[#D6FF00]/10">
              View All Jobs <ChevronRight size={16} className="ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/hr/jobs/create" className="w-full">
            <Button className="w-full justify-center py-6" variant="default">
              <Briefcase className="mr-2 h-5 w-5" />
              Post New Job
            </Button>
          </Link>
          <Link href="/dashboard/hr/candidates" className="w-full">
            <Button 
              variant="outline"
              className="w-full justify-center py-6 dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10"
            >
              <Users className="mr-2 h-5 w-5" />
              Browse Candidates
            </Button>
          </Link>
          <Link href="/dashboard/hr/applications" className="w-full">
            <Button 
              variant="outline"
              className="w-full justify-center py-6 dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10"
            >
              <FileText className="mr-2 h-5 w-5" />
              Review Applications
            </Button>
          </Link>
          <Link href="/dashboard/hr/analytics" className="w-full">
            <Button 
              variant="outline"
              className="w-full justify-center py-6 dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              View Analytics
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Profile Completion Reminder */}
      <Card className="bg-gray-50 dark:bg-gray-800 border-none">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <h3 className="text-lg font-semibold">Complete Your Profile</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Update your company information to attract better talent matches
              </p>
            </div>
            <Link href="/dashboard/hr/profile">
              <Button className="dark:bg-[#D6FF00] dark:text-black dark:hover:bg-[#c2e600]">
                Update Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
