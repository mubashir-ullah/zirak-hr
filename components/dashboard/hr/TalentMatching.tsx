'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCompletion } from 'ai/react'
import { 
  Users, Search, Filter, ArrowRight, Briefcase, 
  MapPin, Clock, Sparkles, ChevronDown, ChevronUp, 
  Download, Share2, Star, StarHalf, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'

// Candidate type definition
type Candidate = {
  _id: string
  name: string
  title: string
  location: string
  experience: number
  skills: string[]
  education: string
  bio: string
  matchScore: number
  profilePicture?: string
  availability: string
  salary?: string
}

// Job type definition
type Job = {
  _id: string
  title: string
  department: string
  location: string
  type: string
  skills: string[]
  description: string
  status: string
}

export default function TalentMatching() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('ai-matching')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState({
    jobs: true,
    candidates: true,
    aiMatching: false
  })
  const [matchCriteria, setMatchCriteria] = useState({
    skills: true,
    experience: true,
    education: true,
    location: false,
    availability: false
  })
  const [skillsWeight, setSkillsWeight] = useState(70)
  const [experienceWeight, setExperienceWeight] = useState(20)
  const [educationWeight, setEducationWeight] = useState(10)
  const [customPrompt, setCustomPrompt] = useState('')
  
  // AI completion hook from Vercel AI SDK
  const { complete, completion, isLoading: aiLoading } = useCompletion({
    api: '/api/ai/talent-matching',
  })
  
  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      if (!session?.user?.email) return
      
      try {
        const response = await fetch('/api/dashboard/hr/jobs')
        const data = await response.json()
        
        if (data.success) {
          setJobs(data.jobs || [])
          if (data.jobs?.length > 0) {
            setSelectedJob(data.jobs[0])
          }
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
        // Mock data for development
        const mockJobs = [
          {
            _id: '1',
            title: 'Senior Frontend Developer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
            description: 'We are looking for a senior frontend developer with experience in React and TypeScript.',
            status: 'Active'
          },
          {
            _id: '2',
            title: 'UX/UI Designer',
            department: 'Design',
            location: 'New York, NY',
            type: 'Full-time',
            skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
            description: 'We are seeking a talented UX/UI Designer to create amazing user experiences.',
            status: 'Active'
          },
          {
            _id: '3',
            title: 'DevOps Engineer',
            department: 'Operations',
            location: 'Remote',
            type: 'Full-time',
            skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
            description: 'Looking for a DevOps engineer to help us scale our infrastructure.',
            status: 'Active'
          }
        ]
        setJobs(mockJobs)
        setSelectedJob(mockJobs[0])
      } finally {
        setLoading(prev => ({ ...prev, jobs: false }))
      }
    }
    
    fetchJobs()
  }, [session])
  
  // Fetch candidates when a job is selected
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!selectedJob || !session?.user?.email) return
      
      setLoading(prev => ({ ...prev, candidates: true }))
      
      try {
        const response = await fetch(`/api/dashboard/hr/candidates?jobId=${selectedJob._id}`)
        const data = await response.json()
        
        if (data.success) {
          setCandidates(data.candidates || [])
        }
      } catch (error) {
        console.error('Error fetching candidates:', error)
        // Mock data for development
        const mockCandidates = [
          {
            _id: '1',
            name: 'John Smith',
            title: 'Senior Frontend Developer',
            location: 'San Francisco, CA',
            experience: 7,
            skills: ['React', 'TypeScript', 'Next.js', 'Redux', 'GraphQL'],
            education: 'BS Computer Science, Stanford University',
            bio: 'Experienced frontend developer with a passion for creating beautiful and functional user interfaces.',
            matchScore: 92,
            availability: 'Immediate',
            salary: '$120,000 - $140,000'
          },
          {
            _id: '2',
            name: 'Emily Johnson',
            title: 'Frontend Developer',
            location: 'Remote',
            experience: 4,
            skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Tailwind'],
            education: 'BS Computer Engineering, MIT',
            bio: 'Frontend developer focused on creating responsive and accessible web applications.',
            matchScore: 85,
            availability: '2 weeks',
            salary: '$90,000 - $110,000'
          },
          {
            _id: '3',
            name: 'Michael Chen',
            title: 'Full Stack Developer',
            location: 'New York, NY',
            experience: 6,
            skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript'],
            education: 'MS Information Systems, NYU',
            bio: 'Full stack developer with experience in building scalable web applications.',
            matchScore: 78,
            availability: '1 month',
            salary: '$110,000 - $130,000'
          },
          {
            _id: '4',
            name: 'Sarah Williams',
            title: 'UI/UX Developer',
            location: 'Chicago, IL',
            experience: 5,
            skills: ['React', 'Figma', 'UI Design', 'CSS', 'Accessibility'],
            education: 'BFA Design, RISD',
            bio: 'Developer with a strong design background, focused on creating beautiful and usable interfaces.',
            matchScore: 73,
            availability: 'Immediate',
            salary: '$95,000 - $115,000'
          }
        ]
        setCandidates(mockCandidates)
      } finally {
        setLoading(prev => ({ ...prev, candidates: false }))
      }
    }
    
    fetchCandidates()
  }, [selectedJob, session])
  
  // Run AI matching
  const runAIMatching = async () => {
    if (!selectedJob) return
    
    setLoading(prev => ({ ...prev, aiMatching: true }))
    
    try {
      const prompt = customPrompt || `Find the best candidates for the ${selectedJob.title} position. 
      The job requires the following skills: ${selectedJob.skills.join(', ')}. 
      The job is located in ${selectedJob.location} and is a ${selectedJob.type} position.
      Job description: ${selectedJob.description}
      
      Prioritize skills (${skillsWeight}%), experience (${experienceWeight}%), and education (${educationWeight}%).
      ${matchCriteria.location ? 'Consider location as a factor.' : ''}
      ${matchCriteria.availability ? 'Consider availability as a factor.' : ''}`;
      
      await complete(prompt)
      
      toast({
        title: "AI Matching Complete",
        description: "Candidates have been ranked based on your criteria",
      })
    } catch (error) {
      console.error('Error running AI matching:', error)
      toast({
        title: "Error",
        description: "Failed to run AI matching. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(prev => ({ ...prev, aiMatching: false }))
    }
  }
  
  // Render match score badge
  const renderMatchScore = (score: number) => {
    let color = 'bg-gray-200 text-gray-800'
    
    if (score >= 90) {
      color = 'bg-green-100 text-green-800'
    } else if (score >= 80) {
      color = 'bg-emerald-100 text-emerald-800'
    } else if (score >= 70) {
      color = 'bg-blue-100 text-blue-800'
    } else if (score >= 60) {
      color = 'bg-yellow-100 text-yellow-800'
    } else {
      color = 'bg-gray-100 text-gray-800'
    }
    
    return (
      <div className={`px-2 py-1 rounded-full text-sm font-medium ${color}`}>
        {score}% Match
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">AI Talent Matching</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Find the perfect candidates for your open positions using AI
        </p>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Job Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Job</CardTitle>
              <CardDescription>Choose a job to find matching candidates</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.jobs ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <Select
                      value={selectedJob?._id}
                      onValueChange={(value) => {
                        const job = jobs.find(j => j._id === value)
                        if (job) setSelectedJob(job)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a job" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs.map((job) => (
                          <SelectItem key={job._id} value={job._id}>
                            {job.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedJob && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-medium text-lg">{selectedJob.title}</h3>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                          <Briefcase size={16} className="mr-1" />
                          <span>{selectedJob.department}</span>
                          <span className="mx-2">•</span>
                          <MapPin size={16} className="mr-1" />
                          <span>{selectedJob.location}</span>
                          <span className="mx-2">•</span>
                          <Clock size={16} className="mr-1" />
                          <span>{selectedJob.type}</span>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {selectedJob.description}
                          </p>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedJob.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">Matching Criteria</h3>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">Skills Weight</label>
                            <span className="text-sm">{skillsWeight}%</span>
                          </div>
                          <Slider
                            value={[skillsWeight]}
                            min={0}
                            max={100}
                            step={5}
                            onValueChange={(value) => setSkillsWeight(value[0])}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">Experience Weight</label>
                            <span className="text-sm">{experienceWeight}%</span>
                          </div>
                          <Slider
                            value={[experienceWeight]}
                            min={0}
                            max={100}
                            step={5}
                            onValueChange={(value) => setExperienceWeight(value[0])}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">Education Weight</label>
                            <span className="text-sm">{educationWeight}%</span>
                          </div>
                          <Slider
                            value={[educationWeight]}
                            min={0}
                            max={100}
                            step={5}
                            onValueChange={(value) => setEducationWeight(value[0])}
                          />
                        </div>
                        
                        <div className="pt-2">
                          <label className="text-sm font-medium mb-2 block">Additional Criteria</label>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant={matchCriteria.location ? "default" : "outline"}
                              size="sm"
                              onClick={() => setMatchCriteria(prev => ({ ...prev, location: !prev.location }))}
                            >
                              Location
                            </Button>
                            <Button
                              variant={matchCriteria.availability ? "default" : "outline"}
                              size="sm"
                              onClick={() => setMatchCriteria(prev => ({ ...prev, availability: !prev.availability }))}
                            >
                              Availability
                            </Button>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <label className="text-sm font-medium mb-2 block">Custom AI Prompt (Optional)</label>
                          <Textarea
                            placeholder="Enter specific instructions for the AI matching..."
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="h-24"
                          />
                        </div>
                        
                        <Button 
                          className="w-full mt-4"
                          onClick={runAIMatching}
                          disabled={loading.aiMatching || !selectedJob}
                        >
                          {loading.aiMatching ? (
                            <>
                              <Loader2 size={16} className="mr-2 animate-spin" />
                              Running AI Matching...
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} className="mr-2" />
                              Run AI Matching
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Candidates */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Matching Candidates</CardTitle>
              <CardDescription>
                {candidates.length} candidates found for {selectedJob?.title || 'this position'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.candidates ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {candidates.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium">No candidates found</h3>
                      <p className="mt-1 text-gray-500">Try adjusting your search criteria</p>
                    </div>
                  ) : (
                    candidates
                      .sort((a, b) => b.matchScore - a.matchScore)
                      .map((candidate) => (
                        <div 
                          key={candidate._id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={candidate.profilePicture} alt={candidate.name} />
                                  <AvatarFallback className="bg-[#d6ff00] text-black">
                                    {candidate.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div>
                                  <h3 className="font-medium">{candidate.name}</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.title}</p>
                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <MapPin size={12} className="mr-1" />
                                    <span>{candidate.location}</span>
                                    <span className="mx-1">•</span>
                                    <span>{candidate.experience} years exp.</span>
                                    {candidate.availability && (
                                      <>
                                        <span className="mx-1">•</span>
                                        <Clock size={12} className="mr-1" />
                                        <span>{candidate.availability}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                {renderMatchScore(candidate.matchScore)}
                              </div>
                            </div>
                            
                            <Accordion type="single" collapsible className="mt-2">
                              <AccordionItem value="details">
                                <AccordionTrigger className="py-2 text-sm">
                                  View Details
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-3 pt-2">
                                    <div>
                                      <h4 className="text-sm font-medium">Bio</h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {candidate.bio}
                                      </p>
                                    </div>
                                    
                                    <div>
                                      <h4 className="text-sm font-medium">Skills</h4>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {candidate.skills.map((skill, index) => (
                                          <Badge 
                                            key={index} 
                                            variant={selectedJob?.skills.includes(skill) ? "default" : "secondary"}
                                          >
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="text-sm font-medium">Education</h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {candidate.education}
                                      </p>
                                    </div>
                                    
                                    {candidate.salary && (
                                      <div>
                                        <h4 className="text-sm font-medium">Expected Salary</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          {candidate.salary}
                                        </p>
                                      </div>
                                    )}
                                    
                                    <div className="pt-2 flex gap-2">
                                      <Button size="sm" variant="outline">
                                        <Share2 size={14} className="mr-1" />
                                        Share
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        <Download size={14} className="mr-1" />
                                        Resume
                                      </Button>
                                      <Button size="sm">
                                        Contact
                                      </Button>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
              
              {/* AI Insights */}
              {completion && (
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-medium">AI Insights</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {completion}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
