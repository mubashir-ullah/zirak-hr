'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  BarChart, PieChart, LineChart, BarChart2, 
  TrendingUp, Users, Briefcase, Clock, 
  Download, RefreshCcw, Filter, ChevronDown
} from 'lucide-react'
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

// Register ChartJS components
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

interface AnalyticsSectionProps {
  isLoading: boolean
}

export default function AnalyticsSection({ isLoading }: AnalyticsSectionProps) {
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState('month')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  const [analyticsData, setAnalyticsData] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    applications: 0,
    timeToHire: 0,
    conversionRate: 0,
    applicationTrend: {
      labels: [] as string[],
      data: [] as number[]
    },
    sourcesData: {
      labels: [] as string[],
      data: [] as number[]
    },
    departmentData: {
      labels: [] as string[],
      data: [] as number[]
    },
    stagesData: {
      labels: [] as string[],
      data: [] as number[]
    }
  })
  
  // Simulate loading analytics data
  useEffect(() => {
    if (!isLoading) {
      fetchAnalyticsData()
    }
  }, [isLoading, timeRange])
  
  const fetchAnalyticsData = async () => {
    try {
      // In a real app, this would be API calls
      // const overviewResponse = await fetch(`/api/dashboard/hr/analytics/overview?timeRange=${timeRange}`)
      // const applicationsResponse = await fetch(`/api/dashboard/hr/analytics/applications?timeRange=${timeRange}`)
      // const sourcesResponse = await fetch(`/api/dashboard/hr/analytics/sources?timeRange=${timeRange}`)
      // const jobsResponse = await fetch(`/api/dashboard/hr/analytics/jobs?timeRange=${timeRange}`)
      // const stagesResponse = await fetch(`/api/dashboard/hr/analytics/stages?timeRange=${timeRange}`)
      
      // Simulate API delay
      setIsRefreshing(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data based on time range
      let labels: string[] = []
      if (timeRange === 'week') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      } else if (timeRange === 'month') {
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      } else if (timeRange === 'quarter') {
        labels = ['Jan', 'Feb', 'Mar']
      } else {
        labels = ['Q1', 'Q2', 'Q3', 'Q4']
      }
      
      setAnalyticsData({
        totalJobs: 15,
        activeJobs: 8,
        totalCandidates: 124,
        applications: 47,
        timeToHire: 18,
        conversionRate: 12.5,
        applicationTrend: {
          labels,
          data: labels.map(() => Math.floor(Math.random() * 20) + 5)
        },
        sourcesData: {
          labels: ['LinkedIn', 'Website', 'Referrals', 'Job Boards', 'Other'],
          data: [40, 25, 15, 15, 5]
        },
        departmentData: {
          labels: ['Engineering', 'Design', 'Marketing', 'Sales', 'Operations'],
          data: [5, 3, 2, 3, 2]
        },
        stagesData: {
          labels: ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Hired'],
          data: [100, 60, 40, 25, 15, 10]
        }
      })
      
      setIsRefreshing(false)
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load analytics data. Please try again.',
        variant: 'destructive'
      })
      setIsRefreshing(false)
    }
  }
  
  const handleRefresh = () => {
    fetchAnalyticsData()
    toast({
      title: 'Data Refreshed',
      description: 'Analytics data has been updated.',
    })
  }
  
  const handleExport = (format: string) => {
    toast({
      title: 'Export Started',
      description: `Exporting analytics data as ${format.toUpperCase()}...`,
    })
    // In a real app, this would trigger a download
  }

  // Chart configurations
  const applicationTrendConfig = {
    labels: analyticsData.applicationTrend.labels,
    datasets: [
      {
        label: 'Applications',
        data: analyticsData.applicationTrend.data,
        borderColor: '#d6ff00',
        backgroundColor: 'rgba(214, 255, 0, 0.2)',
        tension: 0.3,
        fill: true
      }
    ]
  }
  
  const sourcesConfig = {
    labels: analyticsData.sourcesData.labels,
    datasets: [
      {
        data: analyticsData.sourcesData.data,
        backgroundColor: [
          '#d6ff00',
          '#36a2eb',
          '#ff6384',
          '#4bc0c0',
          '#9966ff'
        ],
        borderWidth: 1
      }
    ]
  }
  
  const departmentConfig = {
    labels: analyticsData.departmentData.labels,
    datasets: [
      {
        label: 'Jobs by Department',
        data: analyticsData.departmentData.data,
        backgroundColor: '#d6ff00',
      }
    ]
  }
  
  const stagesConfig = {
    labels: analyticsData.stagesData.labels,
    datasets: [
      {
        label: 'Candidates',
        data: analyticsData.stagesData.data,
        backgroundColor: '#d6ff00',
      }
    ]
  }
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full mt-6" />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold">Analytics Dashboard</h2>
            <p className="text-muted-foreground">Track your recruitment metrics and performance</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Select defaultValue="export">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="export" disabled>Export As</SelectItem>
                <SelectItem value="pdf" onSelect={() => handleExport('pdf')}>PDF</SelectItem>
                <SelectItem value="csv" onSelect={() => handleExport('csv')}>CSV</SelectItem>
                <SelectItem value="excel" onSelect={() => handleExport('excel')}>Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">
              <BarChart2 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="applications">
              <TrendingUp className="h-4 w-4 mr-2" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="sources">
              <PieChart className="h-4 w-4 mr-2" />
              Sources
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Briefcase className="h-4 w-4 mr-2" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="stages">
              <Users className="h-4 w-4 mr-2" />
              Stages
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Jobs</h3>
                <p className="text-2xl font-bold mt-2">{analyticsData.totalJobs}</p>
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Active Jobs</h3>
                <p className="text-2xl font-bold mt-2">{analyticsData.activeJobs}</p>
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Candidates</h3>
                <p className="text-2xl font-bold mt-2">{analyticsData.totalCandidates}</p>
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Applications</h3>
                <p className="text-2xl font-bold mt-2">{analyticsData.applications}</p>
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Time to Hire</h3>
                <p className="text-2xl font-bold mt-2">{analyticsData.timeToHire} days</p>
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Conversion Rate</h3>
                <p className="text-2xl font-bold mt-2">{analyticsData.conversionRate}%</p>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-4 lg:col-span-2">
                <h3 className="text-md font-medium mb-4">Applications Trend</h3>
                <div className="h-80">
                  <Line data={applicationTrendConfig} options={chartOptions} />
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="text-md font-medium mb-4">Application Sources</h3>
                <div className="h-80">
                  <Pie data={sourcesConfig} options={chartOptions} />
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="applications">
            <Card className="p-4">
              <h3 className="text-md font-medium mb-4">Applications Over Time</h3>
              <div className="h-96">
                <Line data={applicationTrendConfig} options={chartOptions} />
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="sources">
            <Card className="p-4">
              <h3 className="text-md font-medium mb-4">Candidate Sources</h3>
              <div className="h-96">
                <Pie data={sourcesConfig} options={chartOptions} />
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="departments">
            <Card className="p-4">
              <h3 className="text-md font-medium mb-4">Jobs by Department</h3>
              <div className="h-96">
                <Bar data={departmentConfig} options={chartOptions} />
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="stages">
            <Card className="p-4">
              <h3 className="text-md font-medium mb-4">Recruitment Funnel</h3>
              <div className="h-96">
                <Bar data={stagesConfig} options={chartOptions} />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
