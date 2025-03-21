import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, LineChart, PieChart } from 'lucide-react';

export default function AnalyticsSection() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Total Users" 
              value="1,248" 
              change="+12.5%" 
              isPositive={true}
              isLoading={isLoading}
            />
            <StatCard 
              title="Active Jobs" 
              value="347" 
              change="+8.2%" 
              isPositive={true}
              isLoading={isLoading}
            />
            <StatCard 
              title="Applications" 
              value="2,156" 
              change="+24.3%" 
              isPositive={true}
              isLoading={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                    <LineChart className="h-16 w-16 text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground">Line chart visualization</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Users by role</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                    <PieChart className="h-16 w-16 text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground">Pie chart visualization</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Server response time and API usage</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                  <LineChart className="h-16 w-16 text-muted-foreground" />
                  <p className="ml-2 text-muted-foreground">Line chart visualization</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Total Talents" 
              value="876" 
              change="+14.2%" 
              isPositive={true}
              isLoading={isLoading}
            />
            <StatCard 
              title="Hiring Managers" 
              value="342" 
              change="+7.8%" 
              isPositive={true}
              isLoading={isLoading}
            />
            <StatCard 
              title="Admins" 
              value="30" 
              change="+3.4%" 
              isPositive={true}
              isLoading={isLoading}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>User Registration Trend</CardTitle>
              <CardDescription>New user registrations over time by role</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                  <p className="ml-2 text-muted-foreground">Bar chart visualization</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>Daily active users over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                    <LineChart className="h-16 w-16 text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground">Line chart visualization</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>User retention rates by cohort</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                    <BarChart className="h-16 w-16 text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground">Bar chart visualization</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Jobs Tab */}
        <TabsContent value="jobs" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Total Jobs" 
              value="524" 
              change="+9.3%" 
              isPositive={true}
              isLoading={isLoading}
            />
            <StatCard 
              title="Active Jobs" 
              value="347" 
              change="+8.2%" 
              isPositive={true}
              isLoading={isLoading}
            />
            <StatCard 
              title="Filled Positions" 
              value="177" 
              change="+12.8%" 
              isPositive={true}
              isLoading={isLoading}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Job Postings by Category</CardTitle>
              <CardDescription>Distribution of job postings across categories</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                  <PieChart className="h-16 w-16 text-muted-foreground" />
                  <p className="ml-2 text-muted-foreground">Pie chart visualization</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Rate</CardTitle>
                <CardDescription>Applications per job over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                    <LineChart className="h-16 w-16 text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground">Line chart visualization</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Time to Fill</CardTitle>
                <CardDescription>Average days to fill positions by category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                    <BarChart className="h-16 w-16 text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground">Bar chart visualization</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="API Requests" 
              value="1.2M" 
              change="+18.7%" 
              isPositive={true}
              isLoading={isLoading}
            />
            <StatCard 
              title="Page Views" 
              value="3.8M" 
              change="+22.4%" 
              isPositive={true}
              isLoading={isLoading}
            />
            <StatCard 
              title="Avg. Session" 
              value="8m 42s" 
              change="+5.3%" 
              isPositive={true}
              isLoading={isLoading}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>System Usage</CardTitle>
              <CardDescription>API requests and server load over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                  <LineChart className="h-16 w-16 text-muted-foreground" />
                  <p className="ml-2 text-muted-foreground">Line chart visualization</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Popular Pages</CardTitle>
                <CardDescription>Most visited pages on the platform</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                    <BarChart className="h-16 w-16 text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground">Bar chart visualization</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Actions performed by users over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                    <LineChart className="h-16 w-16 text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground">Line chart visualization</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  change, 
  isPositive, 
  isLoading 
}: { 
  title: string; 
  value: string; 
  change: string; 
  isPositive: boolean; 
  isLoading: boolean; 
}) {
  return (
    <Card>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-12 bg-muted rounded animate-pulse"></div>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
            <p className={`text-sm mt-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {change} {isPositive ? '↑' : '↓'}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
