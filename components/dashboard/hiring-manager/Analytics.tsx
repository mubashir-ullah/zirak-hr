'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

// Mock data for analytics
const MOCK_MONTHLY_APPLICATIONS = [
  { month: 'Jan', count: 15 },
  { month: 'Feb', count: 22 },
  { month: 'Mar', count: 28 },
  { month: 'Apr', count: 18 },
  { month: 'May', count: 25 },
  { month: 'Jun', count: 32 },
  { month: 'Jul', count: 38 },
  { month: 'Aug', count: 42 },
  { month: 'Sep', count: 35 },
  { month: 'Oct', count: 48 },
  { month: 'Nov', count: 52 },
  { month: 'Dec', count: 45 },
]

const MOCK_SOURCE_DATA = [
  { source: 'Job Board', percentage: 35 },
  { source: 'Company Website', percentage: 25 },
  { source: 'LinkedIn', percentage: 20 },
  { source: 'Referrals', percentage: 15 },
  { source: 'Other', percentage: 5 },
]

const MOCK_HIRING_FUNNEL = [
  { stage: 'Applications', count: 120 },
  { stage: 'Screening', count: 75 },
  { stage: 'Interview', count: 40 },
  { stage: 'Assessment', count: 25 },
  { stage: 'Final Interview', count: 15 },
  { stage: 'Offer', count: 8 },
  { stage: 'Hired', count: 6 },
]

const MOCK_TOP_JOBS = [
  { title: 'Senior Frontend Developer', applications: 32, timeToHire: '22 days' },
  { title: 'UX/UI Designer', applications: 28, timeToHire: '18 days' },
  { title: 'Backend Developer', applications: 24, timeToHire: '25 days' },
  { title: 'DevOps Engineer', applications: 18, timeToHire: '30 days' },
  { title: 'Product Manager', applications: 16, timeToHire: '28 days' },
]

export default function HiringManagerAnalytics() {
  const [timeRange, setTimeRange] = useState('last6Months')
  
  // Calculate the max value for the chart
  const maxApplications = Math.max(...MOCK_MONTHLY_APPLICATIONS.map(item => item.count))
  
  // Calculate conversion rates for the hiring funnel
  const calculateConversionRate = (index: number) => {
    if (index === 0) return '100%'
    const previousStage = MOCK_HIRING_FUNNEL[index - 1].count
    const currentStage = MOCK_HIRING_FUNNEL[index].count
    const rate = (currentStage / previousStage) * 100
    return `${rate.toFixed(1)}%`
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Recruitment Analytics</h1>
      
      {/* Time range selector */}
      <div className="flex space-x-2 mb-6">
        <Button 
          variant={timeRange === 'last30Days' ? 'default' : 'outline'} 
          onClick={() => setTimeRange('last30Days')}
          size="sm"
          className={timeRange !== 'last30Days' ? 'dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10' : ''}
        >
          Last 30 Days
        </Button>
        <Button 
          variant={timeRange === 'last3Months' ? 'default' : 'outline'} 
          onClick={() => setTimeRange('last3Months')}
          size="sm"
          className={timeRange !== 'last3Months' ? 'dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10' : ''}
        >
          Last 3 Months
        </Button>
        <Button 
          variant={timeRange === 'last6Months' ? 'default' : 'outline'} 
          onClick={() => setTimeRange('last6Months')}
          size="sm"
          className={timeRange !== 'last6Months' ? 'dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10' : ''}
        >
          Last 6 Months
        </Button>
        <Button 
          variant={timeRange === 'lastYear' ? 'default' : 'outline'} 
          onClick={() => setTimeRange('lastYear')}
          size="sm"
          className={timeRange !== 'lastYear' ? 'dark:text-[#D6FF00] dark:border-[#D6FF00] dark:hover:bg-[#D6FF00]/10' : ''}
        >
          Last Year
        </Button>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Applications</h3>
          <p className="text-2xl font-bold">120</p>
          <p className="text-xs text-green-500">↑ 15% from previous period</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Time to Hire</h3>
          <p className="text-2xl font-bold">24 days</p>
          <p className="text-xs text-green-500">↓ 3 days from previous period</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Offer Acceptance Rate</h3>
          <p className="text-2xl font-bold">75%</p>
          <p className="text-xs text-red-500">↓ 5% from previous period</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost per Hire</h3>
          <p className="text-2xl font-bold">$3,250</p>
          <p className="text-xs text-green-500">↓ $450 from previous period</p>
        </div>
      </div>
      
      {/* Monthly Applications Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Applications</h2>
        <div className="h-64 flex items-end space-x-2">
          {MOCK_MONTHLY_APPLICATIONS.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-[#d6ff00] rounded-t"
                style={{ 
                  height: `${(item.count / maxApplications) * 100}%`,
                  minHeight: '4px'
                }}
              ></div>
              <p className="text-xs mt-2">{item.month}</p>
              <p className="text-xs font-medium">{item.count}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Application Sources */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Application Sources</h2>
          <div className="space-y-4">
            {MOCK_SOURCE_DATA.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.source}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-[#d6ff00] h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Hiring Funnel */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Hiring Funnel</h2>
          <div className="space-y-4">
            {MOCK_HIRING_FUNNEL.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.stage}</span>
                  <div>
                    <span className="mr-2">{item.count}</span>
                    <span className="text-xs text-gray-500">
                      {index > 0 && `(${calculateConversionRate(index)} conversion)`}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-[#d6ff00] h-2 rounded-full" 
                    style={{ 
                      width: `${(item.count / MOCK_HIRING_FUNNEL[0].count) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Top Performing Jobs */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Top Performing Jobs</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applications</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time to Hire</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Efficiency</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {MOCK_TOP_JOBS.map((job, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{job.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{job.applications}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{job.timeToHire}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        parseInt(job.timeToHire) < 20 ? 'bg-green-500' : 
                        parseInt(job.timeToHire) < 30 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span>
                        {parseInt(job.timeToHire) < 20 ? 'High' : 
                         parseInt(job.timeToHire) < 30 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* AI Insights */}
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
        <div className="flex items-start">
          <div className="w-10 h-10 rounded-full bg-[#d6ff00] flex items-center justify-center text-black font-bold mr-4">
            AI
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">AI Recruitment Insights</h2>
            <div className="space-y-4 text-sm">
              <p>
                <span className="font-medium">Insight:</span> Your time-to-hire for Frontend Developer positions has decreased by 18% compared to last quarter.
              </p>
              <p>
                <span className="font-medium">Insight:</span> Candidates from LinkedIn have a 25% higher interview-to-offer conversion rate than other sources.
              </p>
              <p>
                <span className="font-medium">Insight:</span> Job descriptions with specific skill requirements receive 30% more qualified applications.
              </p>
              <p>
                <span className="font-medium">Recommendation:</span> Consider adding more technical assessment stages for Backend Developer roles to improve quality of hires.
              </p>
            </div>
            <Button className="mt-4">Generate More Insights</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
