'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useToast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, Filter, ArrowUpDown, Star, 
  MessageCircle, Briefcase, MapPin, 
  ChevronRight, Download, Share2
} from 'lucide-react'

interface Candidate {
  id: string
  name: string
  title: string
  location: string
  matchScore: number
  skills: string[]
  experience: number
  education: string
  availability: string
  avatar: string
}

interface TalentPoolSectionProps {
  isLoading: boolean
}

export default function TalentPoolSection({ isLoading }: TalentPoolSectionProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [experienceFilter, setExperienceFilter] = useState([0, 10])
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [skillsFilter, setSkillsFilter] = useState<string[]>([])
  const [aiMatchingEnabled, setAiMatchingEnabled] = useState(true)
  
  // Simulate loading candidates data
  useEffect(() => {
    if (!isLoading && searchQuery) {
      handleSearch()
    }
  }, [isLoading])
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Search query required',
        description: 'Please enter a job title, skill, or keyword to search for candidates.',
        variant: 'destructive'
      })
      return
    }
    
    setIsSearching(true)
    
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/talent/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     query: searchQuery,
      //     useAI: aiMatchingEnabled,
      //     filters: {
      //       experience: experienceFilter,
      //       location: locationFilter !== 'all' ? locationFilter : undefined,
      //       skills: skillsFilter.length > 0 ? skillsFilter : undefined
      //     }
      //   })
      // })
      // const data = await response.json()
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock data
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          name: 'Aisha Khan',
          title: 'Senior Frontend Developer',
          location: 'Karachi, Pakistan',
          matchScore: 95,
          skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
          experience: 5,
          education: 'BS Computer Science',
          availability: 'Immediately',
          avatar: '/images/default-avatar.png'
        },
        {
          id: '2',
          name: 'Omar Farooq',
          title: 'Full Stack Developer',
          location: 'Lahore, Pakistan',
          matchScore: 87,
          skills: ['Node.js', 'React', 'MongoDB', 'Express'],
          experience: 3,
          education: 'MS Software Engineering',
          availability: '2 weeks',
          avatar: '/images/default-avatar.png'
        },
        {
          id: '3',
          name: 'Fatima Ali',
          title: 'UI/UX Designer',
          location: 'Islamabad, Pakistan',
          matchScore: 82,
          skills: ['Figma', 'Adobe XD', 'UI Design', 'User Research'],
          experience: 4,
          education: 'BFA Design',
          availability: '1 month',
          avatar: '/images/default-avatar.png'
        },
        {
          id: '4',
          name: 'Hassan Ahmed',
          title: 'Backend Developer',
          location: 'Karachi, Pakistan',
          matchScore: 79,
          skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
          experience: 2,
          education: 'BS Software Engineering',
          availability: 'Immediately',
          avatar: '/images/default-avatar.png'
        },
        {
          id: '5',
          name: 'Zainab Malik',
          title: 'DevOps Engineer',
          location: 'Lahore, Pakistan',
          matchScore: 75,
          skills: ['AWS', 'Kubernetes', 'CI/CD', 'Terraform'],
          experience: 6,
          education: 'MS Cloud Computing',
          availability: '2 weeks',
          avatar: '/images/default-avatar.png'
        }
      ]
      
      setCandidates(mockCandidates)
      
      toast({
        title: 'Search Complete',
        description: `Found ${mockCandidates.length} candidates matching your criteria.`,
      })
    } catch (error) {
      console.error('Failed to search candidates:', error)
      toast({
        title: 'Error',
        description: 'Failed to search candidates. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSearching(false)
    }
  }
  
  const handleContactCandidate = (candidateId: string) => {
    toast({
      title: 'Contact Request Sent',
      description: 'Your message has been sent to the candidate.',
    })
  }
  
  const handleSaveCandidate = (candidateId: string) => {
    toast({
      title: 'Candidate Saved',
      description: 'Candidate has been saved to your talent pool.',
    })
  }
  
  const handleDownloadResume = (candidateId: string) => {
    toast({
      title: 'Resume Download',
      description: 'Resume download started.',
    })
  }
  
  const handleShareCandidate = (candidateId: string) => {
    toast({
      title: 'Share Candidate',
      description: 'Sharing options opened.',
    })
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-grow" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 mt-8">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          AI-Powered Talent Matching
          <Image
            src="/images/robot.svg"
            alt="AI"
            width={24}
            height={24}
            className="ml-2 dark:invert"
          />
        </h2>
        <p className="text-muted-foreground mb-4">
          Find the perfect candidates for your open positions using our AI matching technology.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for skills, job titles, or keywords"
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-[#d6ff00] text-black hover:bg-[#c2eb00]"
          >
            {isSearching ? 'Searching...' : 'Find Talent'}
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Card className="p-4 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Filters</h3>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Clear All
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Experience (years)</Label>
                <Slider
                  defaultValue={[0, 10]}
                  max={15}
                  step={1}
                  onValueChange={(value) => setExperienceFilter(value as [number, number])}
                  className="my-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{experienceFilter[0]} years</span>
                  <span>{experienceFilter[1]} years</span>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Location</Label>
                <Select 
                  defaultValue="all" 
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="karachi">Karachi</SelectItem>
                    <SelectItem value="lahore">Lahore</SelectItem>
                    <SelectItem value="islamabad">Islamabad</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="ai-matching"
                  checked={aiMatchingEnabled}
                  onCheckedChange={setAiMatchingEnabled}
                />
                <Label htmlFor="ai-matching" className="flex items-center">
                  Enable AI Matching
                  <Image
                    src="/images/robot.svg"
                    alt="AI"
                    width={16}
                    height={16}
                    className="ml-1 dark:invert"
                  />
                </Label>
              </div>
            </div>
          </Card>
          
          <div className="flex-[3]">
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Candidates</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
                <TabsTrigger value="contacted">Contacted</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                {candidates.length > 0 ? (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                      {candidates.map((candidate) => (
                        <Card key={candidate.id} className="p-4">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-shrink-0">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                                <AvatarFallback>{candidate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            </div>
                            
                            <div className="flex-grow">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                                <h3 className="font-bold text-lg">{candidate.name}</h3>
                                <div className="flex items-center">
                                  <Badge variant="outline" className="bg-[#d6ff00] text-black border-none">
                                    {candidate.matchScore}% Match
                                  </Badge>
                                </div>
                              </div>
                              
                              <p className="text-muted-foreground mb-1">{candidate.title}</p>
                              
                              <div className="flex items-center text-sm text-muted-foreground mb-3">
                                <MapPin className="h-3 w-3 mr-1" />
                                {candidate.location}
                                <span className="mx-2">•</span>
                                <Briefcase className="h-3 w-3 mr-1" />
                                {candidate.experience} years
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {candidate.skills.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mt-4">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleContactCandidate(candidate.id)}
                                  className="bg-[#d6ff00] text-black hover:bg-[#c2eb00]"
                                >
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Contact
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleSaveCandidate(candidate.id)}
                                >
                                  <Star className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleDownloadResume(candidate.id)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Resume
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleShareCandidate(candidate.id)}
                                >
                                  <Share2 className="h-4 w-4 mr-1" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">
                      {searchQuery ? 
                        'No candidates found matching your criteria. Try adjusting your search or filters.' : 
                        'Start searching to see AI-matched candidates here.'}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="saved" className="mt-4">
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    You haven't saved any candidates yet.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="contacted" className="mt-4">
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    You haven't contacted any candidates yet.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  )
}
