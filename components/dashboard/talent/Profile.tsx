'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'

export default function TalentProfile() {
  const [loading, setLoading] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState(45)
  
  // Profile information state
  const [profile, setProfile] = useState({
    fullName: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    title: 'Senior Frontend Developer',
    bio: 'Passionate frontend developer with 5+ years of experience building responsive and accessible web applications. Specialized in React, TypeScript, and modern CSS frameworks.',
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'Next.js', 'Redux'],
    experience: [
      {
        id: 1,
        title: 'Senior Frontend Developer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        startDate: '2022-01',
        endDate: '',
        current: true,
        description: 'Leading frontend development for a SaaS platform with 100k+ users. Implemented performance optimizations that improved load times by 40%.'
      },
      {
        id: 2,
        title: 'Frontend Developer',
        company: 'WebSolutions',
        location: 'Remote',
        startDate: '2019-03',
        endDate: '2021-12',
        current: false,
        description: 'Developed and maintained multiple client websites and web applications using React and Next.js.'
      }
    ],
    education: [
      {
        id: 1,
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of California, Berkeley',
        location: 'Berkeley, CA',
        startDate: '2015-09',
        endDate: '2019-05',
        current: false
      }
    ]
  })
  
  // New skill input state
  const [newSkill, setNewSkill] = useState('')
  
  // Edit states
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [editingExperience, setEditingExperience] = useState<number | null>(null)
  const [editingEducation, setEditingEducation] = useState<number | null>(null)
  
  // New experience and education states
  const [addingExperience, setAddingExperience] = useState(false)
  const [addingEducation, setAddingEducation] = useState(false)
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  })
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false
  })
  
  // Handle profile updates
  const handlePersonalUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setEditingPersonal(false)
      setLoading(false)
      toast({
        title: "Profile Updated",
        description: "Your personal information has been updated successfully.",
      })
      
      // Update profile completion if it's not already at 100%
      if (profileCompletion < 100) {
        setProfileCompletion(Math.min(profileCompletion + 5, 100))
      }
    }, 1000)
  }
  
  const handleBioUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setEditingBio(false)
      setLoading(false)
      toast({
        title: "Bio Updated",
        description: "Your professional bio has been updated successfully.",
      })
      
      // Update profile completion if it's not already at 100%
      if (profileCompletion < 100) {
        setProfileCompletion(Math.min(profileCompletion + 5, 100))
      }
    }, 1000)
  }
  
  const handleAddSkill = () => {
    if (!newSkill.trim()) return
    
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }))
    
    setNewSkill('')
    
    // Update profile completion if it's not already at 100%
    if (profileCompletion < 100) {
      setProfileCompletion(Math.min(profileCompletion + 2, 100))
    }
  }
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }
  
  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const newId = Math.max(0, ...profile.experience.map(exp => exp.id)) + 1
      
      setProfile(prev => ({
        ...prev,
        experience: [
          {
            ...newExperience,
            id: newId
          },
          ...prev.experience
        ]
      }))
      
      setNewExperience({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      })
      
      setAddingExperience(false)
      setLoading(false)
      toast({
        title: "Experience Added",
        description: "Your work experience has been added successfully.",
      })
      
      // Update profile completion if it's not already at 100%
      if (profileCompletion < 100) {
        setProfileCompletion(Math.min(profileCompletion + 10, 100))
      }
    }, 1000)
  }
  
  const handleAddEducation = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const newId = Math.max(0, ...profile.education.map(edu => edu.id)) + 1
      
      setProfile(prev => ({
        ...prev,
        education: [
          {
            ...newEducation,
            id: newId
          },
          ...prev.education
        ]
      }))
      
      setNewEducation({
        degree: '',
        institution: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false
      })
      
      setAddingEducation(false)
      setLoading(false)
      toast({
        title: "Education Added",
        description: "Your education has been added successfully.",
      })
      
      // Update profile completion if it's not already at 100%
      if (profileCompletion < 100) {
        setProfileCompletion(Math.min(profileCompletion + 10, 100))
      }
    }, 1000)
  }
  
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <div className="flex items-center">
          <div className="mr-4">
            <p className="text-sm text-gray-500 mb-1">Profile Completion</p>
            <div className="flex items-center">
              <Progress value={profileCompletion} className="h-2 w-32 mr-2" indicatorColor="bg-[#d6ff00]" />
              <span className="text-sm font-medium">{profileCompletion}%</span>
            </div>
          </div>
          <Button>Download Resume</Button>
        </div>
      </div>
      
      {/* Personal Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          {!editingPersonal && (
            <Button variant="outline" onClick={() => setEditingPersonal(true)}>
              Edit
            </Button>
          )}
        </div>
        
        {editingPersonal ? (
          <form onSubmit={handlePersonalUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input
                  value={profile.fullName}
                  onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Professional Title</label>
                <Input
                  value={profile.title}
                  onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingPersonal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{profile.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{profile.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{profile.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Professional Title</p>
              <p className="font-medium">{profile.title}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Professional Bio */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Professional Bio</h2>
          {!editingBio && (
            <Button variant="outline" onClick={() => setEditingBio(true)}>
              Edit
            </Button>
          )}
        </div>
        
        {editingBio ? (
          <form onSubmit={handleBioUpdate} className="space-y-4">
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              rows={6}
              placeholder="Write a brief professional summary..."
            />
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingBio(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
        )}
      </div>
      
      {/* Skills */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Skills</h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.skills.map((skill, index) => (
            <div 
              key={index} 
              className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center"
            >
              <span className="mr-1">{skill}</span>
              <button 
                onClick={() => handleRemoveSkill(skill)}
                className="text-gray-500 hover:text-red-500 focus:outline-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill..."
            className="mr-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddSkill()
              }
            }}
          />
          <Button onClick={handleAddSkill}>Add</Button>
        </div>
      </div>
      
      {/* Work Experience */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Work Experience</h2>
          <Button onClick={() => setAddingExperience(true)}>Add Experience</Button>
        </div>
        
        {addingExperience && (
          <div className="border p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-3">Add New Experience</h3>
            <form onSubmit={handleAddExperience} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title</label>
                  <Input
                    value={newExperience.title}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <Input
                    value={newExperience.company}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input
                    value={newExperience.location}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <Input
                      type="month"
                      value={newExperience.startDate}
                      onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <Input
                      type="month"
                      value={newExperience.endDate}
                      onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                      disabled={newExperience.current}
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="currentJob"
                    checked={newExperience.current}
                    onChange={(e) => setNewExperience(prev => ({ 
                      ...prev, 
                      current: e.target.checked,
                      endDate: e.target.checked ? '' : prev.endDate
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="currentJob">I currently work here</label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={newExperience.description}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Describe your responsibilities and achievements..."
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setAddingExperience(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Experience'}
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {profile.experience.length > 0 ? (
          <div className="space-y-6">
            {profile.experience.map(exp => (
              <div key={exp.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{exp.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{exp.company} • {exp.location}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <p className="mt-2 text-gray-700 dark:text-gray-300">{exp.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No work experience added yet.</p>
        )}
      </div>
      
      {/* Education */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Education</h2>
          <Button onClick={() => setAddingEducation(true)}>Add Education</Button>
        </div>
        
        {addingEducation && (
          <div className="border p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-3">Add New Education</h3>
            <form onSubmit={handleAddEducation} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Degree</label>
                  <Input
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Institution</label>
                  <Input
                    value={newEducation.institution}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input
                    value={newEducation.location}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <Input
                      type="month"
                      value={newEducation.startDate}
                      onChange={(e) => setNewEducation(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <Input
                      type="month"
                      value={newEducation.endDate}
                      onChange={(e) => setNewEducation(prev => ({ ...prev, endDate: e.target.value }))}
                      disabled={newEducation.current}
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="currentEducation"
                    checked={newEducation.current}
                    onChange={(e) => setNewEducation(prev => ({ 
                      ...prev, 
                      current: e.target.checked,
                      endDate: e.target.checked ? '' : prev.endDate
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="currentEducation">I'm currently studying here</label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setAddingEducation(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Education'}
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {profile.education.length > 0 ? (
          <div className="space-y-6">
            {profile.education.map(edu => (
              <div key={edu.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{edu.institution} • {edu.location}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No education added yet.</p>
        )}
      </div>
    </div>
  )
}
