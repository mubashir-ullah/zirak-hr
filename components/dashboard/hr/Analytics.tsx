'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  BarChart3, PieChart, LineChart, Calendar, 
  ArrowUp, ArrowDown, Users, Briefcase, FileText, 
  Clock, Filter, Download, RefreshCw, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// Analytics data types
type OverviewStats = {
  totalJobs: number
  totalJobsChange: number
  activeJobs: number
  activeJobsChange: number
  totalCandidates: number
  totalCandidatesChange: number
  totalApplications: number
  totalApplicationsChange: number
  averageTimeToHire: number
  averageTimeToHireChange: number
  conversionRate: number
  conversionRateChange: number
}

type ApplicationsData = {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }[]
}

type SourcesData = {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor: string[]
    borderWidth: number
  }[]
}

type JobsData = {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string
  }[]
}

type StagesData = {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor: string[]
    borderWidth: number
  }[]
}

export default function Analytics() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('month')
  const [loading, setLoading] = useState({
    overview: true,
    applications: true,
    sources: true,
    jobs: true,
    stages: true
  })
  
  // Analytics data states
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    totalJobs: 0,
    totalJobsChange: 0,
    activeJobs: 0,
    activeJobsChange: 0,
    totalCandidates: 0,
    totalCandidatesChange: 0,
    totalApplications: 0,
    totalApplicationsChange: 0,
    averageTimeToHire: 0,
    averageTimeToHireChange: 0,
    conversionRate: 0,
    conversionRateChange: 0
  })
  
  const [applicationsData, setApplicationsData] = useState<ApplicationsData>({
    labels: [],
    datasets: []
  })
  
  const [sourcesData, setSourcesData] = useState<SourcesData>({
    labels: [],
    datasets: []
  })
  
  const [jobsData, setJobsData] = useState<JobsData>({
    labels: [],
    datasets: []
  })
  
  const [stagesData, setStagesData] = useState<StagesData>({
    labels: [],
    datasets: []
  })
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!session?.user?.email) return
      
      // Fetch overview stats
      setLoading(prev => ({ ...prev, overview: true }))
      try {
        const overviewResponse = await fetch(`/api/dashboard/hr/analytics/overview?timeRange=${timeRange}`)
        const overviewData = await overviewResponse.json()
        
        if (overviewData.success) {
          setOverviewStats(overviewData.stats)
        }
      } catch (error) {
        console.error('Error fetching overview stats:', error)
        // Mock data for development
        setOverviewStats({
          totalJobs: 24,
          totalJobsChange: 8.5,
          activeJobs: 12,
          activeJobsChange: 4.2,
          totalCandidates: 342,
          totalCandidatesChange: 12.3,
          totalApplications: 156,
          totalApplicationsChange: 5.7,
          averageTimeToHire: 18,
          averageTimeToHireChange: -2.5,
          conversionRate: 4.8,
          conversionRateChange: 0.7
        })
      } finally {
        setLoading(prev => ({ ...prev, overview: false }))
      }
      
      // Fetch applications data
      setLoading(prev => ({ ...prev, applications: true }))
      try {
        const applicationsResponse = await fetch(`/api/dashboard/hr/analytics/applications?timeRange=${timeRange}`)
        const applicationsData = await applicationsResponse.json()
        
        if (applicationsData.success) {
          setApplicationsData(applicationsData.data)
        }
      } catch (error) {
        console.error('Error fetching applications data:', error)
        // Mock data for development
        const labels = timeRange === 'week' 
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          : timeRange === 'month'
            ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        setApplicationsData({
          labels,
          datasets: [
            {
              label: 'Applications',
              data: timeRange === 'week' 
                ? [12, 19, 15, 8, 22, 14, 10]
                : timeRange === 'month'
                  ? [45, 52, 38, 41]
                  : [35, 42, 50, 58, 62, 70, 68, 72, 80, 85, 90, 95],
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
            }
          ]
        })
      } finally {
        setLoading(prev => ({ ...prev, applications: false }))
      }
      
      // Fetch sources data
      setLoading(prev => ({ ...prev, sources: true }))
      try {
        const sourcesResponse = await fetch(`/api/dashboard/hr/analytics/sources?timeRange=${timeRange}`)
        const sourcesData = await sourcesResponse.json()
        
        if (sourcesData.success) {
          setSourcesData(sourcesData.data)
        }
      } catch (error) {
        console.error('Error fetching sources data:', error)
        // Mock data for development
        setSourcesData({
          labels: ['LinkedIn', 'Indeed', 'Company Website', 'Referral', 'Other'],
          datasets: [
            {
              label: 'Application Sources',
              data: [45, 25, 15, 10, 5],
              backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
            }
          ]
        })
      } finally {
        setLoading(prev => ({ ...prev, sources: false }))
      }
      
      // Fetch jobs data
      setLoading(prev => ({ ...prev, jobs: true }))
      try {
        const jobsResponse = await fetch(`/api/dashboard/hr/analytics/jobs?timeRange=${timeRange}`)
        const jobsData = await jobsResponse.json()
        
        if (jobsData.success) {
          setJobsData(jobsData.data)
        }
      } catch (error) {
        console.error('Error fetching jobs data:', error)
        // Mock data for development
        setJobsData({
          labels: ['Engineering', 'Design', 'Marketing', 'Sales', 'Operations', 'HR'],
          datasets: [
            {
              label: 'Jobs by Department',
              data: [8, 5, 4, 6, 3, 2],
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }
          ]
        })
      } finally {
        setLoading(prev => ({ ...prev, jobs: false }))
      }
      
      // Fetch stages data
      setLoading(prev => ({ ...prev, stages: true }))
      try {
        const stagesResponse = await fetch(`/api/dashboard/hr/analytics/stages?timeRange=${timeRange}`)
        const stagesData = await stagesResponse.json()
        
        if (stagesData.success) {
          setStagesData(stagesData.data)
        }
      } catch (error) {
        console.error('Error fetching stages data:', error)
        // Mock data for development
        setStagesData({
          labels: ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Hired'],
          datasets: [
            {
              label: 'Candidates by Stage',
              data: [100, 65, 40, 25, 15, 10],
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
            }
          ]
        })
      } finally {
        setLoading(prev => ({ ...prev, stages: false }))
      }
    }
    
    fetchAnalyticsData()
  }, [session, timeRange])
  
  // Chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }
  
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }
  
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  }
  
  // Render stat card with change indicator
  const renderStatCard = (
    title: string, 
    value: number | string, 
    change: number, 
    icon: React.ReactNode,
    suffix?: string,
    loading?: boolean
  ) => {
    const isPositive = change > 0
    const isNegative = change < 0
    const changeText = `${isPositive ? '+' : ''}${change.toFixed(1)}%`
    
    return (
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                  {icon}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                  {suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
                </p>
                <div className="flex items-center mt-1">
                  {isPositive ? (
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : isNegative ? (
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <span className="h-4 w-4 mr-1" />
                  )}
                  <p className={`text-sm ${
                    isPositive ? 'text-green-500' : 
                    isNegative ? 'text-red-500' : 
                    'text-gray-500 dark:text-gray-400'
                  }`}>
                    {changeText} from previous {timeRange}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and analyze your recruitment metrics
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 90 days</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <RefreshCw size={16} />
          </Button>
          
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-5 md:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="stages">Stages</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderStatCard(
              'Total Jobs', 
              overviewStats.totalJobs, 
              overviewStats.totalJobsChange,
              <Briefcase className="h-4 w-4 text-blue-500" />,
              undefined,
              loading.overview
            )}
            
            {renderStatCard(
              'Active Jobs', 
              overviewStats.activeJobs, 
              overviewStats.activeJobsChange,
              <Briefcase className="h-4 w-4 text-green-500" />,
              undefined,
              loading.overview
            )}
            
            {renderStatCard(
              'Total Candidates', 
              overviewStats.totalCandidates, 
              overviewStats.totalCandidatesChange,
              <Users className="h-4 w-4 text-purple-500" />,
              undefined,
              loading.overview
            )}
            
            {renderStatCard(
              'Total Applications', 
              overviewStats.totalApplications, 
              overviewStats.totalApplicationsChange,
              <FileText className="h-4 w-4 text-yellow-500" />,
              undefined,
              loading.overview
            )}
            
            {renderStatCard(
              'Avg. Time to Hire', 
              overviewStats.averageTimeToHire, 
              overviewStats.averageTimeToHireChange,
              <Clock className="h-4 w-4 text-red-500" />,
              'days',
              loading.overview
            )}
            
            {renderStatCard(
              'Conversion Rate', 
              overviewStats.conversionRate, 
              overviewStats.conversionRateChange,
              <BarChart3 className="h-4 w-4 text-indigo-500" />,
              '%',
              loading.overview
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Applications Trend</CardTitle>
                <CardDescription>Number of applications over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {loading.applications ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    </div>
                  ) : (
                    <Line options={lineOptions} data={applicationsData} />
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Application Sources</CardTitle>
                <CardDescription>Where candidates are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {loading.sources ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    </div>
                  ) : (
                    <Pie options={pieOptions} data={sourcesData} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Applications Tab */}
        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Applications Trend</CardTitle>
              <CardDescription>Number of applications over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {loading.applications ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <Line options={lineOptions} data={applicationsData} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sources Tab */}
        <TabsContent value="sources" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Sources</CardTitle>
              <CardDescription>Where candidates are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {loading.sources ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <Pie options={pieOptions} data={sourcesData} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Jobs Tab */}
        <TabsContent value="jobs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Jobs by Department</CardTitle>
              <CardDescription>Distribution of job postings across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {loading.jobs ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <Bar options={barOptions} data={jobsData} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Stages Tab */}
        <TabsContent value="stages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recruitment Funnel</CardTitle>
              <CardDescription>Candidates at each stage of the recruitment process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {loading.stages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <Pie options={pieOptions} data={stagesData} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
