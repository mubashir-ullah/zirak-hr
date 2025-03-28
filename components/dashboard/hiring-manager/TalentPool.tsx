'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

// Mock data for talent profiles
const MOCK_TALENT = [
  {
    id: 1,
    name: 'Alex Johnson',
    title: 'Senior Frontend Developer',
    skills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS'],
    experience: '7 years',
    location: 'San Francisco, CA',
    matchScore: 95,
    status: 'available',
    photo: null,
  },
  {
    id: 2,
    name: 'Samantha Lee',
    title: 'UX/UI Designer',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
    experience: '5 years',
    location: 'New York, NY',
    matchScore: 92,
    status: 'available',
    photo: null,
  },
  {
    id: 3,
    name: 'Michael Chen',
    title: 'Backend Developer',
    skills: ['Node.js', 'Express', 'MongoDB', 'AWS'],
    experience: '6 years',
    location: 'Seattle, WA',
    matchScore: 88,
    status: 'interviewing',
    photo: null,
  },
  {
    id: 4,
    name: 'Emma Wilson',
    title: 'Full Stack Developer',
    skills: ['JavaScript', 'React', 'Python', 'Django'],
    experience: '4 years',
    location: 'Austin, TX',
    matchScore: 85,
    status: 'available',
    photo: null,
  },
  {
    id: 5,
    name: 'David Kim',
    title: 'DevOps Engineer',
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
    experience: '8 years',
    location: 'Chicago, IL',
    matchScore: 82,
    status: 'considering',
    photo: null,
  },
  {
    id: 6,
    name: 'Olivia Martinez',
    title: 'Product Manager',
    skills: ['Agile', 'Scrum', 'Product Strategy', 'User Stories'],
    experience: '6 years',
    location: 'Los Angeles, CA',
    matchScore: 80,
    status: 'available',
    photo: null,
  },
]

export default function HiringManagerTalentPool() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSkill, setFilterSkill] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy] = useState('matchScore')
  const [selectedTalent, setSelectedTalent] = useState<number | null>(null)

  // Filter and sort talent
  const filteredTalent = MOCK_TALENT.filter(talent => {
    const matchesSearch = talent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         talent.title.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSkill = !filterSkill || talent.skills.some(skill => 
      skill.toLowerCase().includes(filterSkill.toLowerCase())
    )
    
    const matchesStatus = !filterStatus || talent.status === filterStatus
    
    return matchesSearch && matchesSkill && matchesStatus
  }).sort((a, b) => {
    if (sortBy === 'matchScore') {
      return b.matchScore - a.matchScore
    } else if (sortBy === 'experience') {
      return parseInt(b.experience) - parseInt(a.experience)
    }
    return 0
  })

  const handleTalentClick = (id: number) => {
    setSelectedTalent(id === selectedTalent ? null : id)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Talent Pool</h1>
      
      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <Input
              type="text"
              placeholder="Search by name or title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Filter by Skill</label>
            <Input
              type="text"
              placeholder="Enter skill"
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="interviewing">Interviewing</option>
              <option value="considering">Considering</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="matchScore">Match Score</option>
              <option value="experience">Experience</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Talent list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTalent.map(talent => (
          <div 
            key={talent.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all ${
              selectedTalent === talent.id ? 'ring-2 ring-[#d6ff00]' : ''
            }`}
            onClick={() => handleTalentClick(talent.id)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-[#d6ff00] flex items-center justify-center text-black font-bold">
                    {talent.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold">{talent.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{talent.title}</p>
                  </div>
                </div>
                <div className="bg-[#d6ff00] text-black font-bold rounded-full w-8 h-8 flex items-center justify-center">
                  {talent.matchScore}
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  <span className="font-medium mr-2">Experience:</span>
                  <span>{talent.experience}</span>
                </div>
                <div className="flex items-center text-sm mt-1">
                  <span className="font-medium mr-2">Location:</span>
                  <span>{talent.location}</span>
                </div>
                <div className="flex items-center text-sm mt-1">
                  <span className="font-medium mr-2">Status:</span>
                  <span className={`capitalize ${
                    talent.status === 'available' ? 'text-green-500' :
                    talent.status === 'interviewing' ? 'text-blue-500' : 'text-yellow-500'
                  }`}>
                    {talent.status}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {talent.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {selectedTalent === talent.id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">View Profile</Button>
                    <Button size="sm" variant="outline" className="flex-1">Contact</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filteredTalent.length === 0 && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 dark:text-gray-400">No talent matches your search criteria.</p>
        </div>
      )}
      
      <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">AI Talent Matching</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Zirak HR uses advanced AI algorithms to match the best talent to your job openings.
          Our matching considers skills, experience, culture fit, and career goals.
        </p>
        <Button>Run AI Matching</Button>
      </div>
    </div>
  )
}
