'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FaCamera, FaLinkedin, FaGithub, FaPlus, FaTimes, FaSpinner, FaCheck, FaUpload, FaShield, FaExclamationTriangle, FaAward, FaChartLine } from 'react-icons/fa'

interface Skill {
  name: string;
  level?: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified?: boolean;
  assessmentId?: string;
  verificationDate?: string;
}

interface ProfileData {
  fullName: string;
  email: string;
  skills: Skill[];
  experience: string;
  country: string;
  city: string;
  germanLevel: string;
  availability: string;
  visaRequired: boolean;
  visaType: string;
  linkedinUrl: string;
  githubUrl: string;
  bio: string;
  profilePicture: string;
  resumeUrl: string;
  title: string;
  phone: string;
  education: {
    degree: string;
    institution: string;
    graduationYear: string;
  }[];
  preferredJobTypes: string[];
  preferredLocations: string[];
  languages: {
    name: string;
    level: string;
  }[];
  userId: string;
}

interface SuggestedSkill {
  name: string;
  confidence: number;
}

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  
  // State for profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    skills: [],
    experience: '',
    country: '',
    city: '',
    germanLevel: '',
    availability: '',
    visaRequired: false,
    visaType: '',
    linkedinUrl: '',
    githubUrl: '',
    bio: '',
    profilePicture: '',
    resumeUrl: '',
    title: '',
    phone: '',
    education: [],
    preferredJobTypes: [],
    preferredLocations: [],
    languages: [],
    userId: ''
  })
  
  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [newSkill, setNewSkill] = useState('')
  const [suggestedSkills, setSuggestedSkills] = useState<SuggestedSkill[]>([])
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)
  const [profilePicturePreview, setProfilePicturePreview] = useState('')
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [resumeFileName, setResumeFileName] = useState('')
  const [isParsingResume, setIsParsingResume] = useState(false)
  const [newLocation, setNewLocation] = useState('')
  const [isSkillValid, setIsSkillValid] = useState(true)
  const [skillValidationMessage, setSkillValidationMessage] = useState('')
  const [availableTechnicalSkills, setAvailableTechnicalSkills] = useState<string[]>([])
  const [showSkillAssessment, setShowSkillAssessment] = useState(false)
  const [selectedSkillForAssessment, setSelectedSkillForAssessment] = useState<string>('')
  const [trendingSkills, setTrendingSkills] = useState<{name: string, demandScore: number}[]>([])
  const [showTrendingSkills, setShowTrendingSkills] = useState(false)

  // Experience options
  const experienceOptions = [
    'Less than 1 year',
    '1-2 years',
    '3-5 years',
    '6-10 years',
    'More than 10 years'
  ]
  
  // German proficiency options
  const germanLevelOptions = [
    'None',
    'A1 - Beginner',
    'A2 - Elementary',
    'B1 - Intermediate',
    'B2 - Upper Intermediate',
    'C1 - Advanced',
    'C2 - Proficient',
    'Native'
  ]
  
  // Availability options
  const availabilityOptions = [
    'Immediately',
    'In 2 weeks',
    'In 1 month',
    'In 2-3 months',
    'More than 3 months'
  ]

  // Load profile data on component mount
  useEffect(() => {
    fetchProfileData()
    fetchTechnicalSkills()
    fetchTrendingSkills()
  }, [])
  
  // Calculate profile completion percentage
  useEffect(() => {
    calculateCompletionPercentage()
  }, [profileData])

  // Fetch profile data from the API
  const fetchProfileData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/talent/profile')
      
      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized, redirect to login
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch profile data')
      }
      
      const data = await response.json()
      
      if (data.profile) {
        // Transform skills array to array of objects if needed
        const formattedSkills = Array.isArray(data.profile.skills) 
          ? data.profile.skills.map((skill: string | Skill) => 
              typeof skill === 'string' ? { name: skill, proficiency: 'beginner', verified: false } : skill
            )
          : []
        
        // Transform education array if it exists
        const formattedEducation = Array.isArray(data.profile.education)
          ? data.profile.education
          : []
        
        // Transform languages array if it exists
        const formattedLanguages = Array.isArray(data.profile.languages)
          ? data.profile.languages.map((lang: string | { name: string; level: string }) =>
              typeof lang === 'string' ? { name: lang, level: 'Intermediate' } : lang
            )
          : []
        
        // Transform preferred job types if it exists
        const formattedJobTypes = Array.isArray(data.profile.preferredJobTypes)
          ? data.profile.preferredJobTypes
          : []
        
        // Transform preferred locations if it exists
        const formattedLocations = Array.isArray(data.profile.preferredLocations)
          ? data.profile.preferredLocations
          : []
        
        setProfileData({
          ...data.profile,
          skills: formattedSkills,
          education: formattedEducation,
          languages: formattedLanguages,
          preferredJobTypes: formattedJobTypes,
          preferredLocations: formattedLocations
        })
        
        if (data.profile.profilePicture) {
          setProfilePicturePreview(data.profile.profilePicture)
        }
        
        if (data.profile.resumeUrl) {
          const fileName = data.profile.resumeUrl.split('/').pop() || 'Resume'
          setResumeFileName(fileName)
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
      setMessage({
        type: 'error',
        text: 'Failed to load profile data. Please try again later.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch technical skills from API
  const fetchTechnicalSkills = async () => {
    try {
      const response = await fetch('/api/talent/skills/technical')
      
      if (!response.ok) {
        throw new Error('Failed to fetch technical skills')
      }
      
      const data = await response.json()
      setAvailableTechnicalSkills(data.skills)
    } catch (error) {
      console.error('Error fetching technical skills:', error)
    }
  }

  // Fetch trending skills
  const fetchTrendingSkills = async () => {
    try {
      const response = await fetch('/api/analytics/skills?trending=true&limit=5')
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending skills')
      }
      
      const data = await response.json()
      setTrendingSkills(data.skills || [])
    } catch (error) {
      console.error('Error fetching trending skills:', error)
    }
  }

  // Save profile changes
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      setMessage({ type: '', text: '' })
      
      // Validate required fields
      const requiredFields = ['fullName', 'email', 'country', 'city', 'experience', 'germanLevel', 'availability']
      const missingFields = requiredFields.filter(field => !profileData[field as keyof ProfileData])
      
      if (missingFields.length > 0) {
        setMessage({
          type: 'error',
          text: `Please fill in all required fields: ${missingFields.join(', ')}`
        })
        setIsSaving(false)
        return
      }
      
      // Format data for API
      const formattedData = {
        ...profileData,
        skills: profileData.skills.map(skill => skill.name),
        languages: profileData.languages.map(lang => ({
          name: lang.name,
          level: lang.level
        }))
      }
      
      // Send data to API
      const response = await fetch('/api/talent/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save profile data')
      }
      
      // Handle successful save
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      })
      
      // Recalculate completion percentage
      calculateCompletionPercentage()
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage({
        type: 'error',
        text: 'Failed to save profile data. Please try again later.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  // Add a new skill
  const handleAddSkill = async () => {
    const trimmedSkill = newSkill.trim()
    
    if (!trimmedSkill) {
      return
    }
    
    // Check if skill already exists in profile
    if (profileData.skills.some(skill => skill.name.toLowerCase() === trimmedSkill.toLowerCase())) {
      setIsSkillValid(false)
      setSkillValidationMessage('This skill is already in your profile')
      return
    }
    
    // Check if skill is a valid technical skill
    const isValidTechnicalSkill = availableTechnicalSkills.some(
      skill => skill.toLowerCase() === trimmedSkill.toLowerCase()
    )
    
    if (!isValidTechnicalSkill) {
      // If not in our predefined list, validate against API
      try {
        const response = await fetch(`/api/talent/skills/technical?query=${encodeURIComponent(trimmedSkill)}`)
        
        if (!response.ok) {
          throw new Error('Failed to validate skill')
        }
        
        const data = await response.json()
        const matchingSkills = data.skills.filter((skill: string) => 
          skill.toLowerCase().includes(trimmedSkill.toLowerCase())
        )
        
        if (matchingSkills.length === 0) {
          setIsSkillValid(false)
          setSkillValidationMessage('Please enter a valid technical or IT skill')
          return
        }
        
        // Add the closest matching skill instead of user input
        const closestMatch = matchingSkills[0]
        
        setProfileData(prev => ({
          ...prev,
          skills: [...prev.skills, { 
            name: closestMatch, 
            proficiency: 'beginner',
            verified: false
          }]
        }))
      } catch (error) {
        console.error('Error validating skill:', error)
        // If API fails, add the skill anyway but warn the user
        setProfileData(prev => ({
          ...prev,
          skills: [...prev.skills, { 
            name: trimmedSkill, 
            proficiency: 'beginner',
            verified: false
          }]
        }))
      }
    } else {
      // Add the valid technical skill
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, { 
          name: trimmedSkill, 
          proficiency: 'beginner',
          verified: false
        }]
      }))
    }
    
    // Reset states
    setNewSkill('')
    setIsSkillValid(true)
    setSkillValidationMessage('')
  }

  // Remove a skill
  const handleRemoveSkill = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((skill, i) => i !== index)
    }))
  }

  // Add a suggested skill
  const handleAddSuggestedSkill = (skill: SuggestedSkill) => {
    if (!profileData.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, { 
          name: skill.name,
          proficiency: 'beginner',
          verified: false
        }]
      }))
      
      // Remove from suggestions
      setSuggestedSkills(prev => prev.filter(s => s.name !== skill.name))
    }
  }

  // Update skill proficiency
  const handleUpdateSkillProficiency = (index: number, proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert') => {
    setProfileData(prev => {
      const updatedSkills = [...prev.skills]
      updatedSkills[index] = {
        ...updatedSkills[index],
        proficiency
      }
      return {
        ...prev,
        skills: updatedSkills
      }
    })
  }

  // Take skill assessment
  const handleTakeAssessment = (skillName: string) => {
    setSelectedSkillForAssessment(skillName)
    setShowSkillAssessment(true)
  }

  // Handle profile picture upload
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: 'error',
        text: 'Invalid file type. Please upload a JPEG or PNG image.'
      });
      return;
    }
    
    if (file.size > maxSize) {
      setMessage({
        type: 'error',
        text: 'File too large. Maximum size is 5MB.'
      });
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfilePicturePreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    try {
      setMessage({
        type: 'info',
        text: 'Uploading profile picture...'
      });
      
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'profile-pictures');
      formData.append('path', `user-${profileData.userId || 'new'}`);
      
      // Upload the file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload profile picture');
      }
      
      const data = await response.json();
      
      // Update profile data with the new profile picture URL
      setProfileData({
        ...profileData,
        profilePicture: data.url
      });
      
      setMessage({
        type: 'success',
        text: 'Profile picture uploaded successfully!'
      });
      
      // Auto-save the profile with the new picture
      handleSaveProfile({
        ...profileData,
        profilePicture: data.url
      });
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to upload profile picture'
      });
    }
  };

  // Calculate profile completion percentage
  const calculateCompletionPercentage = () => {
    const requiredFields = [
      'fullName',
      'title',
      'phone',
      'country',
      'city',
      'bio',
      'germanLevel',
      'availability',
      'linkedinUrl'
    ];
    
    const arrayFields = [
      { name: 'skills', minLength: 3 },
      { name: 'education', minLength: 1 },
      { name: 'languages', minLength: 1 },
      { name: 'preferredJobTypes', minLength: 1 },
      { name: 'preferredLocations', minLength: 1 }
    ];
    
    let completedFields = 0;
    let totalFields = requiredFields.length + arrayFields.length;
    
    // Check required string/boolean fields
    requiredFields.forEach(field => {
      if (
        profileData[field as keyof ProfileData] && 
        (typeof profileData[field as keyof ProfileData] === 'string' ? 
          (profileData[field as keyof ProfileData] as string).trim() !== '' : 
          true)
      ) {
        completedFields++;
      }
    });
    
    // Check array fields
    arrayFields.forEach(field => {
      const array = profileData[field.name as keyof ProfileData] as any[];
      if (array && array.length >= field.minLength) {
        completedFields++;
      }
    });
    
    // Check profile picture
    if (profileData.profilePicture) {
      completedFields++;
      totalFields++;
    }
    
    // Check resume
    if (profileData.resumeUrl) {
      completedFields++;
      totalFields++;
    }
    
    const percentage = Math.round((completedFields / totalFields) * 100);
    setCompletionPercentage(percentage);
  };

  // Handle resume upload
  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setResumeFileName(file.name)
    setIsParsingResume(true)
    
    // Upload to server
    try {
      const formData = new FormData()
      formData.append('resume', file)
      
      const response = await fetch('/api/talent/profile/resume', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload resume')
      }
      
      const data = await response.json()
      
      // Update profile data with parsed resume data
      if (data.parsedData) {
        const { skills, ...otherData } = data.parsedData
        
        // Format skills as array of objects
        const formattedSkills = Array.isArray(skills) 
          ? skills.map((skill: string) => ({ name: skill, proficiency: 'beginner', verified: false }))
          : []
        
        setProfileData(prev => ({
          ...prev,
          ...otherData,
          skills: [...prev.skills, ...formattedSkills.filter(newSkill => 
            !prev.skills.some(existingSkill => 
              existingSkill.name.toLowerCase() === newSkill.name.toLowerCase()
            )
          )],
          resumeUrl: data.resumeUrl
        }))
        
        // Get skill suggestions
        if (data.suggestedSkills && data.suggestedSkills.length > 0) {
          setSuggestedSkills(data.suggestedSkills.map((skill: string, index: number) => ({
            name: skill,
            confidence: 0.9 - (index * 0.05)
          })))
          setShowSkillSuggestions(true)
        }
      }
      
      setMessage({
        type: 'success',
        text: 'Resume uploaded and parsed successfully!'
      })
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    } catch (error) {
      console.error('Error uploading resume:', error)
      setMessage({
        type: 'error',
        text: 'Failed to upload resume. Please try again later.'
      })
    } finally {
      setIsParsingResume(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl lg:text-2xl font-bold">My Profile</h2>
        
        <div className="flex items-center">
          <div className="mr-4">
            <div className="text-sm text-gray-500 mb-1">Profile Completion</div>
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-right mt-1">{completionPercentage}%</div>
          </div>
          
          <button
            className="bg-black text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FaCheck className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
      
      {message.text && (
        <div className={`p-3 rounded-lg mb-4 ${
          message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Picture and Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-gray-200 dark:bg-gray-700">
                  {profilePicturePreview ? (
                    <Image 
                      src={profilePicturePreview} 
                      alt={profileData.fullName || 'Profile Picture'} 
                      width={128} 
                      height={128} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                      <FaCamera size={32} />
                    </div>
                  )}
                </div>
                
                <div className="absolute bottom-0 right-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary hover:bg-primary/90 text-black rounded-full p-2 shadow-md"
                    aria-label="Upload profile picture"
                  >
                    <FaCamera size={16} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-1">
                {profileData.fullName || 'Your Name'}
              </h3>
              
              <p className="text-gray-500 text-sm mb-4">
                {profileData.email || 'your.email@example.com'}
              </p>
              
              <div className="w-full">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    <FaLinkedin className="text-gray-500" />
                  </div>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={profileData.linkedinUrl}
                    onChange={handleInputChange}
                    placeholder="LinkedIn URL"
                    className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    <FaGithub className="text-gray-500" />
                  </div>
                  <input
                    type="url"
                    name="githubUrl"
                    value={profileData.githubUrl}
                    onChange={handleInputChange}
                    placeholder="GitHub URL"
                    className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Resume</h3>
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors"
              onClick={() => resumeInputRef.current?.click()}
            >
              {isParsingResume ? (
                <div className="flex flex-col items-center">
                  <FaSpinner className="animate-spin text-black mb-2" size={24} />
                  <p className="text-sm text-gray-500">Parsing resume...</p>
                </div>
              ) : resumeFileName ? (
                <div className="flex flex-col items-center">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium mr-2">{resumeFileName}</span>
                    <FaCheck className="text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500">Click to upload a new resume</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FaUpload className="text-gray-400 mb-2" size={24} />
                  <p className="text-sm text-gray-500 mb-1">Upload your resume</p>
                  <p className="text-xs text-gray-400">PDF or DOCX (Max 5MB)</p>
                </div>
              )}
              
              <input
                ref={resumeInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleResumeChange}
              />
            </div>
            
            {showSkillSuggestions && suggestedSkills.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Suggested Skills from Resume</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedSkills.map((skill, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center cursor-pointer hover:bg-gray-200"
                      onClick={() => handleAddSuggestedSkill(skill)}
                    >
                      <span>{skill.name}</span>
                      <FaPlus className="ml-2 text-gray-500" size={12} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column - Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                  required
                  disabled // Email is verified upon registration
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Experience *</label>
                <select
                  name="experience"
                  value={profileData.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="">Select Experience</option>
                  {experienceOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">German Proficiency *</label>
                <select
                  name="germanLevel"
                  value={profileData.germanLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="">Select German Level</option>
                  {germanLevelOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Country *</label>
                <input
                  type="text"
                  name="country"
                  value={profileData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Availability *</label>
                <select
                  name="availability"
                  value={profileData.availability}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="">Select Availability</option>
                  {availabilityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="visaRequired"
                    name="visaRequired"
                    checked={profileData.visaRequired}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="visaRequired" className="text-sm font-medium">
                    Visa Sponsorship Required
                  </label>
                </div>
                
                {profileData.visaRequired && (
                  <input
                    type="text"
                    name="visaType"
                    value={profileData.visaType}
                    onChange={handleInputChange}
                    placeholder="Visa Type (e.g., Work Permit, Blue Card)"
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={profileData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Bio / About Me *</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black text-sm"
              />
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Technical Skills</h3>
              <button 
                onClick={() => setShowTrendingSkills(!showTrendingSkills)}
                className="text-xs text-blue-600 flex items-center"
              >
                <FaChartLine className="mr-1" />
                {showTrendingSkills ? 'Hide trending skills' : 'Show trending skills'}
              </button>
            </div>
            
            {showTrendingSkills && trendingSkills.length > 0 && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="text-sm font-semibold mb-2 flex items-center">
                  <FaChartLine className="mr-2 text-yellow-600" />
                  Trending Skills in Demand
                </h4>
                <div className="flex flex-wrap gap-2">
                  {trendingSkills.map((skill, index) => (
                    <div 
                      key={index}
                      className="flex items-center bg-white px-3 py-1 rounded-full border border-yellow-300 cursor-pointer hover:bg-yellow-100"
                      onClick={() => {
                        // Add this skill if not already in the list
                        if (!profileData.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())) {
                          setProfileData({
                            ...profileData,
                            skills: [...profileData.skills, { 
                              name: skill.name,
                              proficiency: 'beginner',
                              verified: false
                            }]
                          })
                        }
                      }}
                    >
                      <span>{skill.name}</span>
                      <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-full">
                        {skill.demandScore > 80 ? 'High' : skill.demandScore > 50 ? 'Medium' : 'Growing'}
                      </span>
                      <FaPlus className="ml-2 text-yellow-600" size={12} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {showSkillSuggestions && suggestedSkills.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold mb-2 flex items-center">
                  <Image 
                    src="/images/robot.svg" 
                    alt="AI" 
                    width={20} 
                    height={20} 
                    className="mr-2" 
                  />
                  AI Suggested Technical Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedSkills.map((skill, index) => (
                    <div 
                      key={index}
                      className="flex items-center bg-white px-3 py-1 rounded-full border border-blue-300 cursor-pointer hover:bg-blue-100"
                      onClick={() => {
                        // Add this skill if not already in the list
                        if (!profileData.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())) {
                          setProfileData({
                            ...profileData,
                            skills: [...profileData.skills, { 
                              name: skill.name,
                              proficiency: 'beginner',
                              verified: false
                            }]
                          })
                        }
                        
                        // Remove from suggestions
                        const updatedSuggestions = [...suggestedSkills]
                        updatedSuggestions.splice(index, 1)
                        setSuggestedSkills(updatedSuggestions)
                        
                        if (updatedSuggestions.length === 0) {
                          setShowSkillSuggestions(false)
                        }
                      }}
                    >
                      <span>{skill.name}</span>
                      <FaPlus className="ml-2 text-blue-500" size={12} />
                    </div>
                  ))}
                </div>
                <button 
                  className="text-xs text-blue-600 mt-2 hover:underline"
                  onClick={() => setShowSkillSuggestions(false)}
                >
                  Dismiss suggestions
                </button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              {profileData.skills.map((skill, index) => (
                <div key={index} className="flex flex-col bg-white p-3 rounded-lg border mb-2 w-full">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="font-medium">{skill.name}</span>
                      {skill.verified && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                          <FaShield className="mr-1" size={10} />
                          Verified
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="flex items-center mb-2">
                      <span className="text-xs text-gray-500 mr-2">Proficiency:</span>
                      <div className="flex space-x-1">
                        {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map((level) => (
                          <button
                            key={level}
                            className={`px-2 py-1 text-xs rounded ${
                              skill.proficiency === level
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => handleUpdateSkillProficiency(index, level)}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {!skill.verified ? (
                      <button
                        onClick={() => handleTakeAssessment(skill.name)}
                        className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 hover:bg-green-100 flex items-center"
                      >
                        <FaAward className="mr-1" size={10} />
                        Verify Skill
                      </button>
                    ) : skill.assessmentId ? (
                      <div className="text-xs text-gray-600 flex items-center">
                        <FaCheck className="mr-1 text-green-500" size={10} />
                        Verified via Assessment
                        {skill.verificationDate && (
                          <span className="ml-1">on {new Date(skill.verificationDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600 flex items-center">
                        <FaCheck className="mr-1 text-green-500" size={10} />
                        Verified
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSkill();
                  }
                }}
                placeholder="Add a technical skill (e.g., React, Python, AWS)"
                className="flex-1 px-3 py-2 rounded-l-lg border focus:ring-2 focus:ring-black"
              />
              <button
                onClick={handleAddSkill}
                className="bg-black text-white px-4 py-2 rounded-r-lg"
              >
                Add
              </button>
            </div>
            {isSkillValid ? (
              <p className="text-xs text-gray-500 mt-2">
                Only add technical or IT-related skills. This platform is designed specifically for IT professionals.
              </p>
            ) : (
              <p className="text-xs text-red-500 mt-2">{skillValidationMessage}</p>
            )}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-4">Education</h3>
            
            {profileData.education.length > 0 && (
              <div className="mb-4">
                {profileData.education.map((education, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">{education.degree}</h4>
                      <button
                        onClick={() => handleRemoveEducation(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Institution</label>
                        <input
                          type="text"
                          value={education.institution}
                          onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Graduation Year</label>
                        <input
                          type="number"
                          value={education.graduationYear}
                          onChange={(e) => handleEducationChange(index, 'graduationYear', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={handleAddEducation}
              className="bg-black text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Education
            </button>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-4">Languages</h3>
            
            {profileData.languages.length > 0 && (
              <div className="mb-4">
                {profileData.languages.map((language, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">{language.name}</h4>
                      <button
                        onClick={() => handleRemoveLanguage(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Language</label>
                        <input
                          type="text"
                          value={language.name}
                          onChange={(e) => handleLanguageChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Level</label>
                        <select
                          value={language.level}
                          onChange={(e) => handleLanguageChange(index, 'level', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-black"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Native">Native</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={handleAddLanguage}
              className="bg-black text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Language
            </button>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-4">Job Preferences</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Preferred Job Types</label>
              <div className="flex flex-wrap gap-2">
                {['Remote', 'Hybrid', 'On-site'].map((type) => (
                  <div 
                    key={type}
                    onClick={() => handleToggleJobType(type)}
                    className={`px-3 py-1 rounded-full cursor-pointer ${
                      profileData.preferredJobTypes.includes(type)
                        ? 'bg-black text-white'
                        : 'bg-white text-black border'
                    }`}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Preferred Locations</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profileData.preferredLocations.map((location, index) => (
                  <div key={index} className="flex items-center bg-white px-3 py-1 rounded-full border">
                    <span>{location}</span>
                    <button
                      onClick={() => {
                        const updatedLocations = [...profileData.preferredLocations]
                        updatedLocations.splice(index, 1)
                        setProfileData({
                          ...profileData,
                          preferredLocations: updatedLocations
                        })
                      }}
                      className="ml-2 text-gray-500 hover:text-red-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex">
                <input
                  type="text"
                  value={newLocation || ''}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newLocation) {
                      setProfileData({
                        ...profileData,
                        preferredLocations: [...profileData.preferredLocations, newLocation]
                      })
                      setNewLocation('')
                    }
                  }}
                  placeholder="Add a location"
                  className="flex-1 px-3 py-2 rounded-l-lg border focus:ring-2 focus:ring-black"
                />
                <button
                  onClick={() => {
                    if (newLocation) {
                      setProfileData({
                        ...profileData,
                        preferredLocations: [...profileData.preferredLocations, newLocation]
                      })
                      setNewLocation('')
                    }
                  }}
                  className="px-4 py-2 bg-black text-white rounded-r-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Completion Indicator */}
      <div className="mt-4 mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Profile Completion</span>
          <span className="text-sm font-medium">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              completionPercentage < 30 ? 'bg-red-500' : 
              completionPercentage < 70 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`} 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        {completionPercentage < 80 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Complete your profile to increase your chances of being discovered by employers.
          </p>
        )}
      </div>
      
      {/* Skill Assessment Modal */}
      {showSkillAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <FaAward className="mr-2 text-green-600" />
              Skill Assessment: {selectedSkillForAssessment}
            </h3>
            
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium text-sm mb-2">What to expect:</h4>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                <li>A series of questions to test your knowledge in {selectedSkillForAssessment}</li>
                <li>The assessment typically takes 10-15 minutes</li>
                <li>You'll need to score at least 70% to verify your skill</li>
                <li>Questions will be tailored to your proficiency level</li>
                <li>You can retake the assessment if you don't pass</li>
              </ul>
            </div>
            
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <FaExclamationTriangle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Verifying your skills increases your visibility to employers by up to 40% and improves your chances of being matched with relevant job opportunities.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                onClick={() => setShowSkillAssessment(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-black text-white rounded-lg flex items-center"
                onClick={() => {
                  // Navigate to assessment page
                  router.push(`/talent/assessment/${encodeURIComponent(selectedSkillForAssessment)}`)
                }}
              >
                <FaAward className="mr-2" />
                Start Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
