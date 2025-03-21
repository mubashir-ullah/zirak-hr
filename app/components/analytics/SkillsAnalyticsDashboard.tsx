import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  ArrowUpIcon, ArrowDownIcon, MinusIcon, 
  ChartBarIcon, ChartPieIcon, ChartLineIcon,
  AcademicCapIcon, BriefcaseIcon, LightBulbIcon
} from '@heroicons/react/24/outline';

// Define types
interface Skill {
  name: string;
  category: string;
  demandScore: number;
  growthRate: number;
  competitionLevel: number;
  jobPostings: number;
  verifiedUsers: number;
}

interface AnalyticsData {
  trending: Skill[];
  growing: Skill[];
  lowCompetition: Skill[];
  categorySummary: {
    category: string;
    averageDemand: number;
    skillCount: number;
  }[];
  timeSeries: {
    date: string;
    jobPostings: number;
    applications: number;
    searches: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const SkillsAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categorySkills, setCategorySkills] = useState<Skill[]>([]);
  const [skillsToCompare, setSkillsToCompare] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<Skill[] | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'comparison'>('overview');

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch trending skills
        const trendingResponse = await fetch('/api/analytics/skills?type=trending&limit=10');
        const trendingData = await trendingResponse.json();
        
        // Fetch growing skills
        const growingResponse = await fetch('/api/analytics/skills?type=growing&limit=10');
        const growingData = await growingResponse.json();
        
        // Fetch low competition skills
        const lowCompResponse = await fetch('/api/analytics/skills?type=low-competition&limit=10');
        const lowCompData = await lowCompResponse.json();
        
        // Fetch summary statistics
        const summaryResponse = await fetch('/api/analytics/skills?type=summary');
        const summaryData = await summaryResponse.json();
        
        setAnalyticsData({
          trending: trendingData.data || [],
          growing: growingData.data || [],
          lowCompetition: lowCompData.data || [],
          categorySummary: summaryData.data?.topCategories || [],
          timeSeries: summaryData.data?.jobPostingTrends || []
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, []);
  
  // Fetch skills by category
  useEffect(() => {
    if (!selectedCategory) return;
    
    const fetchCategorySkills = async () => {
      try {
        const response = await fetch(`/api/analytics/skills?type=category&category=${selectedCategory}`);
        const data = await response.json();
        setCategorySkills(data.data || []);
      } catch (err) {
        console.error(`Error fetching skills for category ${selectedCategory}:`, err);
      }
    };
    
    fetchCategorySkills();
  }, [selectedCategory]);
  
  // Fetch comparison data
  useEffect(() => {
    if (skillsToCompare.length === 0) {
      setComparisonData(null);
      return;
    }
    
    const fetchComparisonData = async () => {
      try {
        const response = await fetch('/api/analytics/skills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ skills: skillsToCompare })
        });
        
        const data = await response.json();
        setComparisonData(data.comparisonData || []);
      } catch (err) {
        console.error('Error fetching skill comparison data:', err);
      }
    };
    
    fetchComparisonData();
  }, [skillsToCompare]);
  
  // Handle adding/removing skills for comparison
  const toggleSkillComparison = (skillName: string) => {
    if (skillsToCompare.includes(skillName)) {
      setSkillsToCompare(skillsToCompare.filter(s => s !== skillName));
    } else {
      if (skillsToCompare.length < 5) { // Limit to 5 skills for comparison
        setSkillsToCompare([...skillsToCompare, skillName]);
      }
    }
  };
  
  // Render trend indicator
  const renderTrendIndicator = (value: number | null) => {
    if (value === null) return <MinusIcon className="h-5 w-5 text-gray-400" />;
    
    if (value > 10) return <ArrowUpIcon className="h-5 w-5 text-green-500" />;
    if (value < -10) return <ArrowDownIcon className="h-5 w-5 text-red-500" />;
    return <MinusIcon className="h-5 w-5 text-yellow-500" />;
  };
  
  // Format date for charts
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Skills Analytics Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('overview')}
        >
          <div className="flex items-center">
            <ChartPieIcon className="h-5 w-5 mr-2" />
            Overview
          </div>
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'trends' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('trends')}
        >
          <div className="flex items-center">
            <ChartLineIcon className="h-5 w-5 mr-2" />
            Trends
          </div>
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'comparison' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('comparison')}
        >
          <div className="flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Comparison
          </div>
        </button>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && analyticsData && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-4">
                  <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Top In-Demand Skills</h3>
                  <p className="text-sm text-gray-600">Skills with highest demand score</p>
                </div>
              </div>
              <div className="mt-4">
                <ul className="space-y-2">
                  {analyticsData.trending.slice(0, 5).map((skill, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <div className="flex items-center">
                        <span className="text-sm font-semibold mr-2">{skill.demandScore}</span>
                        {renderTrendIndicator(skill.growthRate)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-2 mr-4">
                  <ArrowUpIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Fastest Growing Skills</h3>
                  <p className="text-sm text-gray-600">Skills with highest growth rate</p>
                </div>
              </div>
              <div className="mt-4">
                <ul className="space-y-2">
                  {analyticsData.growing.slice(0, 5).map((skill, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <div className="flex items-center">
                        <span className="text-sm font-semibold mr-2">+{skill.growthRate.toFixed(1)}%</span>
                        {renderTrendIndicator(skill.growthRate)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <div className="flex items-center">
                <div className="bg-yellow-100 rounded-full p-2 mr-4">
                  <LightBulbIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Opportunity Skills</h3>
                  <p className="text-sm text-gray-600">High demand, low competition</p>
                </div>
              </div>
              <div className="mt-4">
                <ul className="space-y-2">
                  {analyticsData.lowCompetition.slice(0, 5).map((skill, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <div className="flex items-center">
                        <span className="text-sm font-semibold mr-2">{skill.demandScore}</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Low Competition
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Category Distribution */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Skill Categories by Demand</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.categorySummary}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="averageDemand" name="Average Demand" fill="#8884d8" />
                  <Bar dataKey="skillCount" name="Skill Count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      {/* Trends Tab */}
      {activeTab === 'trends' && analyticsData && (
        <div className="space-y-8">
          {/* Time Series Chart */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Posting Trends (Last 30 Days)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analyticsData.timeSeries.map(item => ({
                    ...item,
                    date: formatDate(item.date)
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="jobPostings" name="Job Postings" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="applications" name="Applications" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="searches" name="Searches" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Category Selection */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills by Category</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
              {['programming', 'frontend', 'backend', 'database', 'devops', 'testing', 
                'mobile', 'ai_ml', 'blockchain', 'ar_vr', 'iot', 'cybersecurity'].map(category => (
                <button
                  key={category}
                  className={`py-2 px-3 rounded-md text-sm ${selectedCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.replace('_', '/')}
                </button>
              ))}
            </div>
            
            {selectedCategory && (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categorySkills.slice(0, 10)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="demandScore" name="Demand Score" fill="#8884d8" />
                    <Bar dataKey="jobPostings" name="Job Postings" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Compare Skills</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select up to 5 skills to compare their demand, growth, and competition metrics.
            </p>
            
            {/* Skill Selection */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-2">Selected Skills:</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {skillsToCompare.length === 0 ? (
                  <span className="text-sm text-gray-500 italic">No skills selected</span>
                ) : (
                  skillsToCompare.map(skill => (
                    <span 
                      key={skill} 
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {skill}
                      <button 
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        onClick={() => toggleSkillComparison(skill)}
                      >
                        &times;
                      </button>
                    </span>
                  ))
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['JavaScript', 'TypeScript', 'Python', 'React', 'Angular', 'Node.js', 
                  'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'SQL', 'Machine Learning'].map(skill => (
                  <button
                    key={skill}
                    className={`py-2 px-3 rounded-md text-sm ${skillsToCompare.includes(skill) 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => toggleSkillComparison(skill)}
                    disabled={skillsToCompare.length >= 5 && !skillsToCompare.includes(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Comparison Charts */}
            {comparisonData && comparisonData.length > 0 && (
              <div className="space-y-6">
                {/* Demand Score Comparison */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Demand Score Comparison</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparisonData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="demandScore" name="Demand Score" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Growth Rate Comparison */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Growth Rate Comparison</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparisonData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="growthRate" name="Growth Rate (%)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Competition Level Comparison */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Competition Level Comparison</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparisonData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="competitionLevel" name="Competition Level" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsAnalyticsDashboard;
