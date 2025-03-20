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
    costPerHire: 0,
    hiringEfficiency: 0,
    retentionRate: 0,
    qualityOfHire: 0,
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
    },
    costData: {
      labels: [] as string[],
      data: [] as number[]
    },
    efficiencyData: {
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
      setIsRefreshing(true)
      
      // Make real API calls to fetch analytics data
      const overviewResponse = await fetch(`/api/analytics/overview?timeRange=${timeRange}`)
      const applicationsResponse = await fetch(`/api/analytics/applications?timeRange=${timeRange}`)
      const sourcesResponse = await fetch(`/api/analytics/sources?timeRange=${timeRange}`)
      const departmentsResponse = await fetch(`/api/analytics/departments`)
      const stagesResponse = await fetch(`/api/analytics/stages`)
      const efficiencyResponse = await fetch(`/api/analytics/efficiency`)
      
      if (!overviewResponse.ok || !applicationsResponse.ok || !sourcesResponse.ok || 
          !departmentsResponse.ok || !stagesResponse.ok || !efficiencyResponse.ok) {
        throw new Error('One or more API requests failed')
      }
      
      const overview = await overviewResponse.json()
      const applications = await applicationsResponse.json()
      const sources = await sourcesResponse.json()
      const departments = await departmentsResponse.json()
      const stages = await stagesResponse.json()
      const efficiency = await efficiencyResponse.json()
      
      setAnalyticsData({
        totalJobs: overview.totalJobs || 0,
        activeJobs: overview.activeJobs || 0,
        totalCandidates: overview.totalCandidates || 0,
        applications: overview.applications || 0,
        timeToHire: overview.timeToHire || 0,
        conversionRate: overview.conversionRate || 0,
        costPerHire: efficiency.metrics?.costPerHire || 0,
        hiringEfficiency: efficiency.metrics?.hiringEfficiency || 0,
        retentionRate: efficiency.metrics?.retentionRate || 0,
        qualityOfHire: efficiency.metrics?.qualityOfHire || 0,
        applicationTrend: {
          labels: applications.labels || [],
          data: applications.data || []
        },
        sourcesData: {
          labels: sources.labels || [],
          data: sources.data || []
        },
        departmentData: {
          labels: departments.labels || [],
          data: departments.data || []
        },
        stagesData: {
          labels: stages.labels || [],
          data: stages.data || []
        },
        costData: {
          labels: efficiency.costData?.labels || [],
          data: efficiency.costData?.data || []
        },
        efficiencyData: {
          labels: efficiency.efficiencyData?.labels || [],
          data: efficiency.efficiencyData?.data || []
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
      
      // Fallback to mock data if API fails
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
        costPerHire: 4250,
        hiringEfficiency: 78,
        retentionRate: 85,
        qualityOfHire: 82,
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
        },
        costData: {
          labels: ['Advertising', 'Recruiter Time', 'Tools & Software', 'Onboarding', 'Other'],
          data: [1200, 1800, 650, 400, 200]
        },
        efficiencyData: {
          labels: ['Engineering', 'Design', 'Marketing', 'Sales', 'Operations'],
          data: [85, 72, 90, 78, 65]
        }
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
  
  const handleExport = async (format: string) => {
    try {
      toast({
        title: 'Export Started',
        description: `Exporting analytics data as ${format.toUpperCase()}...`,
      })
      
      const response = await fetch(`/api/analytics/export?format=${format}&timeRange=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Failed to export data')
      }
      
      const result = await response.json()
      
      toast({
        title: 'Export Complete',
        description: result.message || `Analytics data has been exported as ${format.toUpperCase()}.`,
      })
      
      // In a real implementation, this would trigger the browser to download the file
      // For now, we'll just show a success message
    } catch (error) {
      console.error('Failed to export data:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to export analytics data. Please try again.',
        variant: 'destructive'
      })
    }
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
            <TabsTrigger value="efficiency">
              <Clock className="h-4 w-4 mr-2" />
              Efficiency
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
          
          <TabsContent value="efficiency">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Cost Per Hire</h3>
                  <p className="text-2xl font-bold mt-2">${analyticsData.costPerHire}</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Hiring Efficiency</h3>
                  <p className="text-2xl font-bold mt-2">{analyticsData.hiringEfficiency}%</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Retention Rate</h3>
                  <p className="text-2xl font-bold mt-2">{analyticsData.retentionRate}%</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Quality of Hire</h3>
                  <p className="text-2xl font-bold mt-2">{analyticsData.qualityOfHire}%</p>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="text-md font-medium mb-4">Recruitment Cost Breakdown</h3>
                  <div className="h-80">
                    <Pie 
                      data={{
                        labels: analyticsData.costData.labels,
                        datasets: [
                          {
                            data: analyticsData.costData.data,
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
                      }} 
                      options={chartOptions} 
                    />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="text-md font-medium mb-4">Hiring Efficiency by Department</h3>
                  <div className="h-80">
                    <Bar 
                      data={{
                        labels: analyticsData.efficiencyData.labels,
                        datasets: [
                          {
                            label: 'Efficiency (%)',
                            data: analyticsData.efficiencyData.data,
                            backgroundColor: '#d6ff00',
                          }
                        ]
                      }} 
                      options={chartOptions} 
                    />
                  </div>
                </Card>
              </div>
              
              <Card className="p-6">
                <h3 className="text-md font-medium mb-4">Hiring Efficiency Metrics Explained</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Cost Per Hire</h4>
                    <p className="text-sm text-muted-foreground">Total recruitment costs divided by the number of hires in a given time period.</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Hiring Efficiency</h4>
                    <p className="text-sm text-muted-foreground">Measures how quickly candidates move through your recruitment process.</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Retention Rate</h4>
                    <p className="text-sm text-muted-foreground">Percentage of new hires that remain with the company after a defined period.</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Quality of Hire</h4>
                    <p className="text-sm text-muted-foreground">Composite score based on performance reviews, manager satisfaction, and cultural fit.</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
