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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, Filter, ArrowUpDown, Star, 
  MessageCircle, Briefcase, MapPin, 
  ChevronRight, Download, Share2, X,
  Code, Database, Server, Globe
} from 'lucide-react'

interface Candidate {
  id: string
  name: string
  title: string
  location: string
  country: string
  city: string
  matchScore: number
  skills: string[]
  experience: number
  education: string
  availability: string
  languages: { language: string, proficiency: string }[]
  germanLevel?: string // A1, A2, B1, B2, C1, C2
  visaStatus: string
  avatar: string
}

interface TechnicalSkillCategory {
  name: string
  skills: string[]
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
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [skillsFilter, setSkillsFilter] = useState<string[]>([])
  const [availableSkills, setAvailableSkills] = useState<string[]>([])
  const [skillCategories, setSkillCategories] = useState<string[]>([])
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('all')
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [languageFilter, setLanguageFilter] = useState<string>('all')
  const [languageProficiencyFilter, setLanguageProficiencyFilter] = useState<string>('all')
  const [germanLevelFilter, setGermanLevelFilter] = useState<string>('all')
  const [visaRequiredFilter, setVisaRequiredFilter] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')
  const [aiMatchingEnabled, setAiMatchingEnabled] = useState(true)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  
  // Country-city mapping for dynamic city selection
  const countryCityMap = {
    pakistan: ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta', 'Faisalabad', 'Multan', 'Rawalpindi', 'Sialkot', 'Gujranwala'],
    germany: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dresden', 'Nuremberg'],
    usa: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
    uk: ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Edinburgh', 'Bristol', 'Leeds', 'Sheffield', 'Newcastle'],
    canada: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Ottawa', 'Edmonton', 'Quebec City', 'Winnipeg', 'Hamilton', 'Victoria'],
    australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Hobart'],
    uae: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
    saudi_arabia: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif', 'Tabuk', 'Buraidah', 'Khobar', 'Abha'],
    qatar: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Umm Salal', 'Al Daayen', 'Madinat ash Shamal'],
    kuwait: ['Kuwait City', 'Hawalli', 'Salmiya', 'Al Ahmadi', 'Sabah Al Salem', 'Farwaniya', 'Al Jahra'],
    oman: ['Muscat', 'Seeb', 'Salalah', 'Sohar', 'Sur', 'Nizwa', 'Barka', 'Ibri']
  };
  
  // Get available cities based on selected country
  const getAvailableCities = () => {
    if (countryFilter === 'all') return [];
    return countryCityMap[countryFilter as keyof typeof countryCityMap] || [];
  };
  
  // Reset city filter when country changes
  useEffect(() => {
    setCityFilter('all');
  }, [countryFilter]);
  
  // Fetch available skills when component mounts
  useEffect(() => {
    if (!isLoading) {
      fetchTechnicalSkills();
    }
  }, [isLoading]);
  
  // Fetch technical skills from the API
  const fetchTechnicalSkills = async () => {
    setIsLoadingSkills(true);
    try {
      const response = await fetch('/api/talent/skills/technical');
      if (!response.ok) {
        throw new Error('Failed to fetch technical skills');
      }
      
      const data = await response.json();
      setAvailableSkills(data.skills);
      setSkillCategories(data.categories);
    } catch (error) {
      console.error('Failed to fetch technical skills:', error);
      // Fallback to empty arrays if API fails
      setAvailableSkills([]);
      setSkillCategories([]);
    } finally {
      setIsLoadingSkills(false);
    }
  };
  
  // Fetch skills by category
  const fetchSkillsByCategory = async (category: string) => {
    if (category === 'all') {
      fetchTechnicalSkills();
      return;
    }
    
    setIsLoadingSkills(true);
    try {
      const response = await fetch(`/api/talent/skills/technical?category=${category}`);
      if (!response.ok) {
        throw new Error('Failed to fetch skills for category');
      }
      
      const data = await response.json();
      setAvailableSkills(data.skills);
    } catch (error) {
      console.error('Failed to fetch skills for category:', error);
      setAvailableSkills([]);
    } finally {
      setIsLoadingSkills(false);
    }
  };
  
  // Handle skill category change
  const handleCategoryChange = (category: string) => {
    setSelectedSkillCategory(category);
    fetchSkillsByCategory(category);
  };
  
  // Add a skill to the filter
  const addSkill = (skill: string) => {
    if (skill && !skillsFilter.includes(skill)) {
      setSkillsFilter([...skillsFilter, skill]);
      setSkillInput('');
    }
  };
  
  // Remove a skill from the filter
  const removeSkill = (skill: string) => {
    setSkillsFilter(skillsFilter.filter(s => s !== skill));
  };
  
  // Filter skills based on input
  const filteredSkills = skillInput
    ? availableSkills.filter(skill => 
        skill.toLowerCase().includes(skillInput.toLowerCase()) && 
        !skillsFilter.includes(skill)
      )
    : [];
  
  // Simulate loading candidates data
  useEffect(() => {
    if (!isLoading) {
      loadDefaultCandidates();
    }
  }, [isLoading])
  
  const loadDefaultCandidates = () => {
    // Mock data for default candidates
    const defaultCandidates: Candidate[] = [
      {
        id: '1',
        name: 'Aisha Khan',
        title: 'Senior Frontend Developer',
        location: 'Karachi, Pakistan',
        country: 'Pakistan',
        city: 'Karachi',
        matchScore: 95,
        skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
        experience: 5,
        education: 'BS Computer Science',
        availability: 'Immediately',
        languages: [
          { language: 'English', proficiency: 'Fluent' },
          { language: 'Urdu', proficiency: 'Native' },
          { language: 'German', proficiency: 'Basic' }
        ],
        germanLevel: 'A1',
        visaStatus: 'Not Required',
        avatar: '/images/default-avatar.png'
      },
      {
        id: '2',
        name: 'Omar Farooq',
        title: 'Full Stack Developer',
        location: 'Lahore, Pakistan',
        country: 'Pakistan',
        city: 'Lahore',
        matchScore: 87,
        skills: ['Node.js', 'React', 'MongoDB', 'Express'],
        experience: 3,
        education: 'MS Software Engineering',
        availability: '2 weeks',
        languages: [
          { language: 'English', proficiency: 'Fluent' },
          { language: 'Urdu', proficiency: 'Native' },
          { language: 'German', proficiency: 'Intermediate' }
        ],
        germanLevel: 'B1',
        visaStatus: 'Required',
        avatar: '/images/default-avatar.png'
      },
      {
        id: '3',
        name: 'Fatima Ali',
        title: 'UI/UX Designer',
        location: 'Islamabad, Pakistan',
        country: 'Pakistan',
        city: 'Islamabad',
        matchScore: 82,
        skills: ['Figma', 'Adobe XD', 'UI Design', 'User Research'],
        experience: 4,
        education: 'BFA Design',
        availability: '1 month',
        languages: [
          { language: 'English', proficiency: 'Intermediate' },
          { language: 'Urdu', proficiency: 'Native' },
          { language: 'German', proficiency: 'Fluent' }
        ],
        germanLevel: 'C1',
        visaStatus: 'Not Required',
        avatar: '/images/default-avatar.png'
      }
    ];
    
    setCandidates(defaultCandidates);
  }
  
  // Filter candidates based on selected filters
  const filteredCandidates = candidates.filter(candidate => {
    // Filter by search query
    if (searchQuery && !candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    // Filter by tab
    if (activeTab === 'shortlisted' && candidate.matchScore < 80) {
      return false;
    }
    
    // Filter by experience
    if (candidate.experience < experienceFilter[0] || candidate.experience > experienceFilter[1]) {
      return false;
    }
    
    // Filter by country
    if (countryFilter !== 'all' && candidate.country.toLowerCase() !== countryFilter.toLowerCase()) {
      return false;
    }
    
    // Filter by city
    if (cityFilter !== 'all' && candidate.city.toLowerCase() !== cityFilter.toLowerCase()) {
      return false;
    }
    
    // Filter by skills - candidate must have ALL selected skills
    if (skillsFilter.length > 0 && !skillsFilter.every(skill => 
      candidate.skills.some(candidateSkill => 
        candidateSkill.toLowerCase() === skill.toLowerCase()
      )
    )) {
      return false;
    }
    
    // Filter by language
    if (languageFilter !== 'all' && !candidate.languages.some(lang => 
      lang.language.toLowerCase() === languageFilter.toLowerCase()
    )) {
      return false;
    }
    
    // Filter by language proficiency
    if (languageProficiencyFilter !== 'all' && languageFilter !== 'all' && !candidate.languages.some(lang => 
      lang.language.toLowerCase() === languageFilter.toLowerCase() && 
      lang.proficiency.toLowerCase() === languageProficiencyFilter.toLowerCase()
    )) {
      return false;
    }
    
    // Filter by German level
    if (germanLevelFilter !== 'all' && candidate.germanLevel !== germanLevelFilter) {
      return false;
    }
    
    // Filter by visa status
    if (visaRequiredFilter !== 'all') {
      const requiresVisa = visaRequiredFilter === 'required';
      if (requiresVisa && candidate.visaStatus !== 'Required') {
        return false;
      }
      if (!requiresVisa && candidate.visaStatus === 'Required') {
        return false;
      }
    }
    
    // Filter by availability
    if (availabilityFilter !== 'all' && candidate.availability !== availabilityFilter) {
      return false;
    }
    
    return true;
  });
  
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
      // Call the real API endpoint
      const response = await fetch('/api/talent/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery,
          useAI: aiMatchingEnabled,
          filters: {
            experience: experienceFilter,
            location: locationFilter !== 'all' ? locationFilter : undefined,
            country: countryFilter !== 'all' ? countryFilter : undefined,
            city: cityFilter !== 'all' ? cityFilter : undefined,
            skills: skillsFilter.length > 0 ? skillsFilter : undefined,
            language: languageFilter !== 'all' ? languageFilter : undefined,
            languageProficiency: languageProficiencyFilter !== 'all' ? languageProficiencyFilter : undefined,
            germanLevel: germanLevelFilter !== 'all' ? germanLevelFilter : undefined,
            visaRequired: visaRequiredFilter !== 'all' ? visaRequiredFilter : undefined,
            availability: availabilityFilter !== 'all' ? availabilityFilter : undefined
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to search candidates')
      }
      
      const data = await response.json()
      
      // Update the candidates state with the API response
      setCandidates(data)
      
      toast({
        title: 'Search Complete',
        description: `Found ${data.length} candidates matching your criteria.`,
      })
    } catch (error) {
      console.error('Failed to search candidates:', error)
      toast({
        title: 'Error',
        description: 'Failed to search candidates. Please try again.',
        variant: 'destructive'
      })
      
      // Fallback to default candidates if the API fails
      loadDefaultCandidates()
    } finally {
      setIsSearching(false)
    }
  }
  
  const clearFilters = () => {
    setExperienceFilter([0, 10]);
    setLocationFilter('all');
    setCountryFilter('all');
    setCityFilter('all');
    setSkillsFilter([]);
    setLanguageFilter('all');
    setLanguageProficiencyFilter('all');
    setGermanLevelFilter('all');
    setVisaRequiredFilter('all');
    setAvailabilityFilter('all');
    
    toast({
      title: 'Filters Cleared',
      description: 'All filters have been reset to default values.',
    });
  }
  
  const handleContactCandidate = async (candidateId: string) => {
    try {
      // In a real app, you would get the actual user ID from authentication
      const userId = 'current-user-id';
      
      // In a real app, you would have a form for the user to enter a message
      const message = 'I would like to discuss a potential opportunity with you.';
      
      const response = await fetch('/api/talent/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, userId, message })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send contact request');
      }
      
      const data = await response.json();
      
      toast({
        title: 'Contact Request Sent',
        description: data.message || 'Your message has been sent to the candidate.',
      });
    } catch (error) {
      console.error('Failed to send contact request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send contact request. Please try again.',
        variant: 'destructive'
      });
    }
  }
  
  const handleSaveCandidate = async (candidateId: string) => {
    try {
      // In a real app, you would get the actual user ID from authentication
      const userId = 'current-user-id';
      
      const response = await fetch('/api/talent/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, userId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save candidate');
      }
      
      const data = await response.json();
      
      toast({
        title: data.alreadySaved ? 'Already Saved' : 'Candidate Saved',
        description: data.message || 'Candidate has been saved to your talent pool.',
      });
    } catch (error) {
      console.error('Failed to save candidate:', error);
      toast({
        title: 'Error',
        description: 'Failed to save candidate. Please try again.',
        variant: 'destructive'
      });
    }
  }
  
  const handleDownloadResume = async (candidateId: string) => {
    try {
      toast({
        title: 'Download Started',
        description: 'Preparing resume for download...',
      });
      
      const response = await fetch(`/api/talent/resume/${candidateId}`);
      
      if (!response.ok) {
        throw new Error('Failed to download resume');
      }
      
      const data = await response.json();
      
      // In a real app, this would trigger the browser to download the file
      // For now, we'll just show a success message
      toast({
        title: 'Resume Ready',
        description: `${data.fileName} is ready for download.`,
      });
      
      // Simulate download by opening a new window (in a real app, this would be a direct download)
      if (data.downloadUrl) {
        // window.open(data.downloadUrl, '_blank');
        console.log('Download URL:', data.downloadUrl);
      }
    } catch (error) {
      console.error('Failed to download resume:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download resume. Please try again.',
        variant: 'destructive'
      });
    }
  }
  
  const handleShareCandidate = (candidateId: string) => {
    toast({
      title: 'Share Candidate',
      description: 'Sharing options opened.',
    })
  }
  
  const handleViewProfile = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    toast({
      title: 'Profile Opened',
      description: `Viewing ${candidate.name}'s profile details.`,
    });
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
          Talent Pool
          <Image
            src="/images/robot.svg"
            alt="AI"
            width={32}
            height={32}
            className="ml-2 dark:invert"
          />
        </h2>
        <p className="text-muted-foreground mb-4">
          Browse and filter candidates from our talent pool to find the perfect match for your open positions.
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs"
                onClick={clearFilters}
              >
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
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              </Button>
              
              {showAdvancedFilters && (
                <div className="space-y-4 pt-2 border-t">
                  <div>
                    <Label className="mb-2 block">Country</Label>
                    <Select 
                      value={countryFilter}
                      onValueChange={setCountryFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        <SelectGroup>
                          <SelectLabel>Europe</SelectLabel>
                          <SelectItem value="germany">Germany</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>North America</SelectLabel>
                          <SelectItem value="usa">United States</SelectItem>
                          <SelectItem value="canada">Canada</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Asia</SelectLabel>
                          <SelectItem value="pakistan">Pakistan</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Middle East</SelectLabel>
                          <SelectItem value="uae">United Arab Emirates</SelectItem>
                          <SelectItem value="saudi_arabia">Saudi Arabia</SelectItem>
                          <SelectItem value="qatar">Qatar</SelectItem>
                          <SelectItem value="kuwait">Kuwait</SelectItem>
                          <SelectItem value="oman">Oman</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Oceania</SelectLabel>
                          <SelectItem value="australia">Australia</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">City</Label>
                    <Select 
                      value={cityFilter}
                      onValueChange={setCityFilter}
                      disabled={countryFilter === 'all'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={countryFilter === 'all' ? "Select a country first" : "Select city"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {getAvailableCities().map(city => (
                          <SelectItem key={city.toLowerCase()} value={city.toLowerCase()}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {countryFilter === 'all' && (
                      <p className="text-xs text-muted-foreground mt-1">Please select a country first</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Language</Label>
                    <Select 
                      value={languageFilter}
                      onValueChange={setLanguageFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Languages</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="urdu">Urdu</SelectItem>
                        <SelectItem value="arabic">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Language Proficiency</Label>
                    <Select 
                      value={languageProficiencyFilter}
                      onValueChange={setLanguageProficiencyFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select proficiency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Proficiency</SelectItem>
                        <SelectItem value="native">Native</SelectItem>
                        <SelectItem value="fluent">Fluent</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">German Language Level (CEFR)</Label>
                    <Select 
                      value={germanLevelFilter}
                      onValueChange={setGermanLevelFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select German level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Level</SelectItem>
                        <SelectItem value="A1">A1 (Beginner)</SelectItem>
                        <SelectItem value="A2">A2 (Elementary)</SelectItem>
                        <SelectItem value="B1">B1 (Intermediate)</SelectItem>
                        <SelectItem value="B2">B2 (Upper Intermediate)</SelectItem>
                        <SelectItem value="C1">C1 (Advanced)</SelectItem>
                        <SelectItem value="C2">C2 (Proficient)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Visa Status</Label>
                    <Select 
                      value={visaRequiredFilter}
                      onValueChange={setVisaRequiredFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visa status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="required">Visa Required</SelectItem>
                        <SelectItem value="not-required">No Visa Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Joining Availability</Label>
                    <Select 
                      value={availabilityFilter}
                      onValueChange={setAvailabilityFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Availability</SelectItem>
                        <SelectItem value="immediately">Immediately</SelectItem>
                        <SelectItem value="2-weeks">Within 2 Weeks</SelectItem>
                        <SelectItem value="1-month">Within 1 Month</SelectItem>
                        <SelectItem value="3-months">Within 3 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Technical Skills</Label>
                    <Select value={selectedSkillCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {skillCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="relative">
                      <Input
                        placeholder="Search skills..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        className="h-8 text-xs"
                      />
                      {skillInput && filteredSkills.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                          {filteredSkills.map((skill, index) => (
                            <div
                              key={index}
                              className="px-3 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                              onClick={() => addSkill(skill)}
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {skillsFilter.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs py-0 h-6">
                          {skill}
                          <button 
                            onClick={() => removeSkill(skill)} 
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex justify-between mt-2">
                      <Button 
                        variant={selectedSkillCategory === 'programming' ? 'default' : 'ghost'} 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleCategoryChange('programming')}
                        title="Programming Languages"
                      >
                        <Code size={16} />
                      </Button>
                      <Button 
                        variant={selectedSkillCategory === 'frontend' ? 'default' : 'ghost'} 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleCategoryChange('frontend')}
                        title="Frontend Technologies"
                      >
                        <Globe size={16} />
                      </Button>
                      <Button 
                        variant={selectedSkillCategory === 'backend' ? 'default' : 'ghost'} 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleCategoryChange('backend')}
                        title="Backend Technologies"
                      >
                        <Server size={16} />
                      </Button>
                      <Button 
                        variant={selectedSkillCategory === 'database' ? 'default' : 'ghost'} 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleCategoryChange('database')}
                        title="Database Technologies"
                      >
                        <Database size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
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
                    width={20}
                    height={20}
                    className="ml-1.5 dark:invert"
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
                {filteredCandidates.length > 0 ? (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                      {filteredCandidates.map((candidate) => (
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
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 text-xs text-muted-foreground">
                                <div>
                                  <span className="font-medium">Languages:</span>{' '}
                                  {candidate.languages.map(l => `${l.language} (${l.proficiency})`).join(', ')}
                                  {candidate.germanLevel && (
                                    <span className="ml-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded-sm">
                                      German: {candidate.germanLevel}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <span className="font-medium">Visa Status:</span>{' '}
                                  {candidate.visaStatus}
                                </div>
                                <div>
                                  <span className="font-medium">Availability:</span>{' '}
                                  {candidate.availability}
                                </div>
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
                                  onClick={() => handleViewProfile(candidate)}
                                >
                                  <ChevronRight className="h-4 w-4 mr-1" />
                                  View Profile
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
      
      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Candidate Profile</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCandidate(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={selectedCandidate.avatar} alt={selectedCandidate.name} />
                    <AvatarFallback className="text-2xl">{selectedCandidate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Badge variant="outline" className="bg-[#d6ff00] text-black border-none mb-2">
                    {selectedCandidate.matchScore}% Match
                  </Badge>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownloadResume(selectedCandidate.id)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleShareCandidate(selectedCandidate.id)}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-1">{selectedCandidate.name}</h3>
                  <p className="text-lg text-muted-foreground mb-2">{selectedCandidate.title}</p>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedCandidate.location}
                    <span className="mx-2">•</span>
                    <Briefcase className="h-4 w-4 mr-1" />
                    {selectedCandidate.experience} years experience
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Education</h4>
                      <p>{selectedCandidate.education}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Availability</h4>
                      <p>{selectedCandidate.availability}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Languages</h4>
                      <ul className="list-disc list-inside">
                        {selectedCandidate.languages.map((lang, idx) => (
                          <li key={idx}>
                            {lang.language}: {lang.proficiency}
                            {lang.language === 'German' && selectedCandidate.germanLevel && 
                              ` (${selectedCandidate.germanLevel})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Visa Status</h4>
                      <p>{selectedCandidate.visaStatus}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-6">
                    <Button 
                      onClick={() => {
                        handleContactCandidate(selectedCandidate.id);
                        setSelectedCandidate(null);
                      }}
                      className="bg-[#d6ff00] text-black hover:bg-[#c2eb00]"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Candidate
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        handleSaveCandidate(selectedCandidate.id);
                        setSelectedCandidate(null);
                      }}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Save to Talent Pool
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
