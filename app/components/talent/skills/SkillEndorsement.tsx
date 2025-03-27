'use client'

import { useState, useEffect } from 'react'
import { 
  ThumbsUp, User, BadgeCheck, Search, 
  Plus, X, Check, Loader2, Users, Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Endorser {
  id: string;
  name: string;
  position?: string;
  company?: string;
  relationship?: string;
  avatarUrl?: string;
  email?: string;
}

interface Endorsement {
  id: string;
  skillId: string;
  endorserId: string;
  endorser: Endorser;
  comment?: string;
  createdAt: string;
}

interface Skill {
  id: string;
  name: string;
  endorsements: Endorsement[];
}

interface SkillEndorsementProps {
  skills: Skill[];
  onRefresh?: () => void;
}

export default function SkillEndorsement({ skills, onRefresh }: SkillEndorsementProps) {
  const [activeTab, setActiveTab] = useState('received')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Endorser[]>([])
  const [selectedEndorsers, setSelectedEndorsers] = useState<Endorser[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  
  // Mock search for connections
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    // Simulate API call with mock data
    const mockConnections: Endorser[] = [
      { id: 'user1', name: 'John Smith', position: 'Senior Developer', company: 'Tech Corp', relationship: 'Colleague', avatarUrl: '' },
      { id: 'user2', name: 'Sarah Johnson', position: 'Project Manager', company: 'Innovate Inc', relationship: 'Manager', avatarUrl: '' },
      { id: 'user3', name: 'Michael Brown', position: 'CTO', company: 'StartUp Co', relationship: 'Connection', avatarUrl: '' },
      { id: 'user4', name: 'Emily Davis', position: 'UX Designer', company: 'Design Studio', relationship: 'Colleague', avatarUrl: '' },
    ]
    
    const filteredResults = mockConnections.filter(
      connection => connection.name.toLowerCase().includes(query.toLowerCase())
    )
    
    setSearchResults(filteredResults)
  }
  
  const handleSelectEndorser = (endorser: Endorser) => {
    if (!selectedEndorsers.some(e => e.id === endorser.id)) {
      setSelectedEndorsers([...selectedEndorsers, endorser])
    }
    setSearchQuery('')
    setSearchResults([])
  }
  
  const handleRemoveEndorser = (endorserId: string) => {
    setSelectedEndorsers(selectedEndorsers.filter(e => e.id !== endorserId))
  }
  
  const handleAddByEmail = () => {
    if (!emailInput.trim() || !emailInput.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      })
      return
    }
    
    const newEndorser: Endorser = {
      id: `email-${Date.now()}`,
      name: emailInput,
      email: emailInput,
    }
    
    setSelectedEndorsers([...selectedEndorsers, newEndorser])
    setEmailInput('')
  }
  
  const handleSendRequests = async () => {
    if (!selectedSkill || selectedEndorsers.length === 0) {
      return
    }
    
    try {
      setIsSending(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: 'Endorsement Requests Sent',
        description: `Sent ${selectedEndorsers.length} endorsement requests for ${selectedSkill.name}.`,
        variant: 'default',
      })
      
      setRequestDialogOpen(false)
      setSelectedEndorsers([])
      setSelectedSkill(null)
      
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error sending endorsement requests:', error)
      toast({
        title: 'Error',
        description: 'Failed to send endorsement requests. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  const renderReceivedEndorsements = () => {
    const allEndorsements = skills.flatMap(skill => 
      skill.endorsements.map(endorsement => ({
        ...endorsement,
        skillName: skill.name
      }))
    )
    
    if (allEndorsements.length === 0) {
      return (
        <div className="text-center py-8">
          <ThumbsUp className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-lg font-medium">No Endorsements Yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
            You haven't received any skill endorsements yet. Request endorsements from your connections to strengthen your profile.
          </p>
        </div>
      )
    }
    
    return (
      <div className="space-y-4">
        {skills.map(skill => (
          <div key={skill.id} className="space-y-2">
            {skill.endorsements.length > 0 && (
              <>
                <div className="flex items-center">
                  <h3 className="text-lg font-medium">{skill.name}</h3>
                  <Badge variant="secondary" className="ml-2">
                    {skill.endorsements.length}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skill.endorsements.map(endorsement => (
                    <Card key={endorsement.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start">
                          <Avatar className="h-10 w-10 mr-3">
                            {endorsement.endorser.avatarUrl ? (
                              <AvatarImage src={endorsement.endorser.avatarUrl} alt={endorsement.endorser.name} />
                            ) : (
                              <AvatarFallback>{getInitials(endorsement.endorser.name)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{endorsement.endorser.name}</CardTitle>
                            {(endorsement.endorser.position || endorsement.endorser.company) && (
                              <CardDescription>
                                {endorsement.endorser.position}
                                {endorsement.endorser.position && endorsement.endorser.company && ' at '}
                                {endorsement.endorser.company}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      {endorsement.comment && (
                        <CardContent>
                          <p className="text-sm text-gray-600 dark:text-gray-300">"{endorsement.comment}"</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
                <Separator className="my-4" />
              </>
            )}
          </div>
        ))}
      </div>
    )
  }
  
  const renderRequestEndorsements = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Request Skill Endorsements</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Endorsements from colleagues and managers add credibility to your skills and increase your visibility to potential employers.
          </p>
          <Button onClick={() => setRequestDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Endorsements
          </Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Your Skills</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {skills.map(skill => (
              <Card key={skill.id} className="hover:border-primary cursor-pointer transition-colors" onClick={() => {
                setSelectedSkill(skill)
                setRequestDialogOpen(true)
              }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{skill.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {skill.endorsements.length} endorsements
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Endorsements
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Skill Endorsements</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="request">Request</TabsTrigger>
        </TabsList>
        
        <TabsContent value="received" className="mt-0">
          {renderReceivedEndorsements()}
        </TabsContent>
        
        <TabsContent value="request" className="mt-0">
          {renderRequestEndorsements()}
        </TabsContent>
      </Tabs>
      
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Skill Endorsements</DialogTitle>
            <DialogDescription>
              {selectedSkill ? 
                `Request endorsements for ${selectedSkill.name} from your connections.` :
                'Select a skill and connections to request endorsements.'}
            </DialogDescription>
          </DialogHeader>
          
          {!selectedSkill ? (
            <div className="space-y-3 py-2">
              <label className="text-sm font-medium">Select a skill to endorse</label>
              <div className="grid grid-cols-2 gap-2">
                {skills.map(skill => (
                  <Button
                    key={skill.id}
                    variant={selectedSkill?.id === skill.id ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setSelectedSkill(skill)}
                  >
                    {skill.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium block mb-2">Selected Skill</label>
                <Badge className="mr-1">{selectedSkill.name}</Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full"
                  onClick={() => setSelectedSkill(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium block">Search Connections</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by name..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                
                {searchResults.length > 0 && (
                  <div className="border rounded-md mt-1 max-h-40 overflow-y-auto">
                    {searchResults.map(result => (
                      <div 
                        key={result.id} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                        onClick={() => handleSelectEndorser(result)}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{getInitials(result.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{result.name}</p>
                            <p className="text-xs text-gray-500">{result.position}</p>
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-gray-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium block">Add by Email</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Enter email address..."
                      className="pl-8"
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" onClick={handleAddByEmail}>Add</Button>
                </div>
              </div>
              
              {selectedEndorsers.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Selected Connections ({selectedEndorsers.length})</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEndorsers.map(endorser => (
                      <Badge key={endorser.id} variant="secondary" className="flex items-center gap-1">
                        {endorser.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full ml-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={() => handleRemoveEndorser(endorser.id)}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendRequests} 
              disabled={!selectedSkill || selectedEndorsers.length === 0 || isSending}
            >
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Requests
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
