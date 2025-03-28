'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Mock data for demonstration
const mockJobStats = {
  activeJobs: 5,
  candidateMatches: 24,
  applications: 18,
  interviewsScheduled: 7,
  offersSent: 2
}

const mockRecentActivity = [
  {
    id: 1,
    message: 'New application received for Senior Frontend Developer',
    time: '1 day ago',
    type: 'application'
  },
  {
    id: 2,
    message: 'AI found 3 new candidate matches for UX Designer',
    time: '2 days ago',
    type: 'match'
  },
  {
    id: 3,
    message: 'Interview scheduled with John Doe for Backend Developer',
    time: '3 days ago',
    type: 'interview'
  },
  {
    id: 4,
    message: 'Offer sent to Sarah Smith for Product Manager position',
    time: '4 days ago',
    type: 'offer'
  },
  {
    id: 5,
    message: 'New job posting created: Full Stack Developer',
    time: '5 days ago',
    type: 'job'
  }
]

const mockPipelineData = [
  {
    id: 1,
    position: 'Frontend Developer',
    applications: 8,
    screening: 3,
    interview: 1,
    offer: 0,
    status: 'active'
  },
  {
    id: 2,
    position: 'UX Designer',
    applications: 5,
    screening: 2,
    interview: 2,
    offer: 1,
    status: 'active'
  },
  {
    id: 3,
    position: 'Backend Developer',
    applications: 4,
    screening: 4,
    interview: 2,
    offer: 0,
    status: 'active'
  },
  {
    id: 4,
    position: 'Product Manager',
    applications: 12,
    screening: 6,
    interview: 3,
    offer: 1,
    status: 'active'
  }
]

export default function HiringManagerOverview() {
  const { data: session } = useSession()
  const [timeFilter, setTimeFilter] = useState('week')
  const [pipelineFilter, setPipelineFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Filter pipeline data based on selected filter
  const filteredPipelineData = pipelineFilter === 'all' 
    ? mockPipelineData 
    : mockPipelineData.filter(job => job.status === pipelineFilter)
  
  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'application':
        return <FileText size={16} className="text-blue-500" />
      case 'match':
        return <CheckCircle2 size={16} className="text-green-500" />
      case 'interview':
        return <Calendar size={16} className="text-purple-500" />
      case 'offer':
        return <Briefcase size={16} className="text-orange-500" />
      case 'job':
        return <Briefcase size={16} className="text-[#d6ff00]" />
      default:
        return <AlertCircle size={16} className="text-gray-500" />
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d6ff00]"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Hiring Manager Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Hiring Manager'}
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
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Jobs</h2>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <Briefcase size={18} className="text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{mockJobStats.activeJobs}</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp size={14} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+2</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">from last {timeFilter}</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Matches</h2>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full">
              <Users size={18} className="text-green-500 dark:text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{mockJobStats.candidateMatches}</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp size={14} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+8</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">from last {timeFilter}</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications</h2>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-full">
              <FileText size={18} className="text-purple-500 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{mockJobStats.applications}</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp size={14} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+5</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">from last {timeFilter}</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Interviews</h2>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-full">
              <Calendar size={18} className="text-orange-500 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{mockJobStats.interviewsScheduled}</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp size={14} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+3</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">from last {timeFilter}</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Offers</h2>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
              <CheckCircle2 size={18} className="text-yellow-500 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{mockJobStats.offersSent}</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp size={14} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+1</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">from last {timeFilter}</span>
          </div>
        </div>
      </div>
      
      {/* Recent Activity and Hiring Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Link href="/dashboard/hiring-manager/analytics">
              <Button variant="outline" size="sm" className="dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10">View All</Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {mockRecentActivity.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="mr-4 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <p className="font-medium">{activity.message}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                    <Clock size={12} className="mr-1" /> {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Hiring Pipeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Hiring Pipeline</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  className="appearance-none bg-transparent border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-8 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#d6ff00] focus:border-transparent"
                  value={pipelineFilter}
                  onChange={(e) => setPipelineFilter(e.target.value)}
                >
                  <option value="all">All Jobs</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
                <Filter size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
              
              <Link href="/dashboard/hiring-manager/jobs">
                <Button variant="outline" size="sm" className="dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10">View All</Button>
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applications</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Screening</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interview</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Offer</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {filteredPipelineData.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/dashboard/hiring-manager/jobs/${job.id}`}>
                        {job.position}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                        {job.applications}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs">
                        {job.screening}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-xs">
                        {job.interview}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs">
                        {job.offer}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/hiring-manager/jobs/create">
            <Button className="w-full justify-center py-6" variant="default">
              <Briefcase className="mr-2 h-5 w-5" />
              Post New Job
            </Button>
          </Link>
          <Link href="/dashboard/hiring-manager/talent-pool">
            <Button 
              variant="outline"
              className="w-full justify-center py-6 dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10"
            >
              <Users className="mr-2 h-5 w-5" />
              Browse Talent Pool
            </Button>
          </Link>
          <Link href="/dashboard/hiring-manager/jobs">
            <Button 
              variant="outline"
              className="w-full justify-center py-6 dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10"
            >
              <FileText className="mr-2 h-5 w-5" />
              Review Applications
            </Button>
          </Link>
          <Link href="/dashboard/hiring-manager/analytics">
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
    </div>
  )
}
