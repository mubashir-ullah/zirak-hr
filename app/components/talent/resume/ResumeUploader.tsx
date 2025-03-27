'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Upload, FileText, Check, X, AlertCircle, 
  FileType, Loader2, ChevronDown, ChevronUp, 
  CheckCircle2, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  education: {
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    url: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
  }[];
  languages?: {
    name: string;
    proficiency: string;
  }[];
}

interface ResumeUploaderProps {
  onResumeUploaded: (resumeData: ResumeData) => void;
}

export default function ResumeUploader({ onResumeUploaded }: ResumeUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [parsedResume, setParsedResume] = useState<ResumeData | null>(null)
  const [activeTab, setActiveTab] = useState('upload')
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({
    personal: true,
    skills: true,
    experience: false,
    education: false,
    projects: false,
    certifications: false,
    languages: false
  })
  const [autoAccept, setAutoAccept] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Simulate upload progress
  useEffect(() => {
    if (isUploading && uploadProgress < 90) {
      const timer = setTimeout(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isUploading, uploadProgress])
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Reset states
    setIsUploading(true)
    setUploadProgress(0)
    setError('')
    setSuggestedSkills([])
    setParsedResume(null)
    
    // Validate file type
    const fileType = file.name.split('.').pop()?.toLowerCase()
    if (fileType !== 'pdf' && fileType !== 'docx') {
      setError('Invalid file type. Only PDF and DOCX files are supported.')
      setIsUploading(false)
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      setIsUploading(false)
      return
    }
    
    try {
      const formData = new FormData()
      formData.append('resume', file)
      
      const response = await fetch('/api/talent/resume/parse', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to parse resume')
      }
      
      setUploadProgress(100)
      
      const data = await response.json()
      
      // If there are suggested skills, show them
      if (data.suggestedSkills && data.suggestedSkills.length > 0) {
        setSuggestedSkills(data.suggestedSkills)
        setSelectedSkills(data.suggestedSkills)
      }
      
      setParsedResume(data.resume)
      setActiveTab('review')
      
      // If auto-accept is enabled, automatically upload the parsed resume
      if (autoAccept) {
        onResumeUploaded(data.resume)
      }
    } catch (error) {
      console.error('Error parsing resume:', error)
      setError('Failed to parse resume. Please try again later.')
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleAcceptParsed = () => {
    if (parsedResume) {
      // Update skills with selected ones
      const updatedResume = {
        ...parsedResume,
        skills: selectedSkills
      }
      onResumeUploaded(updatedResume)
    }
  }
  
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill))
    } else {
      setSelectedSkills([...selectedSkills, skill])
    }
  }
  
  const toggleSection = (section: string) => {
    setShowDetails(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  
  const renderUploadTab = () => (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed dark:border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors"
        onClick={handleUploadClick}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Processing your resume...</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Our AI is extracting information from your document
            </p>
            <Progress value={uploadProgress} className="w-full max-w-xs h-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {uploadProgress < 100 ? 'Parsing...' : 'Finalizing...'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-4 p-3 bg-primary/10 rounded-full">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Upload your resume</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 text-center">
              Drag and drop your resume or click to browse
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Supported formats: PDF, DOCX (Max 5MB)
            </p>
            <div className="flex items-center space-x-2 mb-4">
              <FileType className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                AI-powered resume parsing
              </span>
            </div>
            <Button size="sm" variant="outline">
              Select File
            </Button>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Auto-accept parsed resume</h4>
          <Switch 
            checked={autoAccept} 
            onCheckedChange={setAutoAccept} 
            id="auto-accept"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          When enabled, your resume will be automatically processed and added to your profile without manual review.
        </p>
      </div>
    </div>
  )
  
  const renderReviewTab = () => {
    if (!parsedResume) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-4 flex items-start">
          <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-800 dark:text-green-400">Resume Successfully Parsed</h4>
            <p className="text-sm text-green-700 dark:text-green-500 mt-1">
              We've extracted the information from your resume. Please review and confirm the details below.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Personal Information */}
          <Card>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('personal')}>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Personal Information</CardTitle>
                {showDetails.personal ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
            {showDetails.personal && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{parsedResume.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{parsedResume.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{parsedResume.phone}</p>
                  </div>
                </div>
                
                {parsedResume.summary && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Summary</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{parsedResume.summary}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
          
          {/* Skills */}
          <Card>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('skills')}>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Skills</CardTitle>
                {showDetails.skills ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
            {showDetails.skills && (
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.map((skill) => (
                      <Badge 
                        key={skill} 
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleSkill(skill)}
                      >
                        {selectedSkills.includes(skill) && (
                          <Check className="h-3 w-3 mr-1" />
                        )}
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Click on skills to toggle selection. Selected skills will be added to your profile.
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Experience */}
          {parsedResume.experience && parsedResume.experience.length > 0 && (
            <Card>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('experience')}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Experience ({parsedResume.experience.length})</CardTitle>
                  {showDetails.experience ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
              {showDetails.experience && (
                <CardContent>
                  <div className="space-y-4">
                    {parsedResume.experience.map((exp, index) => (
                      <div key={index} className={index > 0 ? "pt-4 border-t" : ""}>
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{exp.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{exp.company}, {exp.location}</p>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </p>
                        </div>
                        {exp.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
          
          {/* Education */}
          {parsedResume.education && parsedResume.education.length > 0 && (
            <Card>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('education')}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Education ({parsedResume.education.length})</CardTitle>
                  {showDetails.education ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
              {showDetails.education && (
                <CardContent>
                  <div className="space-y-4">
                    {parsedResume.education.map((edu, index) => (
                      <div key={index} className={index > 0 ? "pt-4 border-t" : ""}>
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{edu.degree}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{edu.institution}, {edu.location}</p>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {edu.startDate} - {edu.endDate || 'Present'}
                          </p>
                        </div>
                        {edu.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
          
          {/* Projects */}
          {parsedResume.projects && parsedResume.projects.length > 0 && (
            <Card>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('projects')}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Projects ({parsedResume.projects.length})</CardTitle>
                  {showDetails.projects ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
              {showDetails.projects && (
                <CardContent>
                  <div className="space-y-4">
                    {parsedResume.projects.map((project, index) => (
                      <div key={index} className={index > 0 ? "pt-4 border-t" : ""}>
                        <p className="font-medium">{project.name}</p>
                        {project.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{project.description}</p>
                        )}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.technologies.map((tech, i) => (
                              <Badge key={i} variant="secondary">{tech}</Badge>
                            ))}
                          </div>
                        )}
                        {project.url && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            <a href={project.url} target="_blank" rel="noopener noreferrer">{project.url}</a>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
          
          {/* Certifications */}
          {parsedResume.certifications && parsedResume.certifications.length > 0 && (
            <Card>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('certifications')}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Certifications ({parsedResume.certifications.length})</CardTitle>
                  {showDetails.certifications ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
              {showDetails.certifications && (
                <CardContent>
                  <div className="space-y-4">
                    {parsedResume.certifications.map((cert, index) => (
                      <div key={index} className={index > 0 ? "pt-4 border-t" : ""}>
                        <p className="font-medium">{cert.name}</p>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">{cert.issuer}</p>
                          {cert.date && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{cert.date}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
          
          {/* Languages */}
          {parsedResume.languages && parsedResume.languages.length > 0 && (
            <Card>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('languages')}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Languages ({parsedResume.languages.length})</CardTitle>
                  {showDetails.languages ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
              {showDetails.languages && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {parsedResume.languages.map((lang, index) => (
                      <div key={index} className="flex justify-between">
                        <p className="text-sm font-medium">{lang.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{lang.proficiency}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setActiveTab('upload')}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Upload Different Resume
          </Button>
          <Button onClick={handleAcceptParsed}>
            <Check className="h-4 w-4 mr-2" />
            Accept and Continue
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-800">
      <h3 className="text-xl font-semibold mb-6">Resume Parser</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upload" disabled={isUploading}>Upload</TabsTrigger>
          <TabsTrigger value="review" disabled={!parsedResume}>Review</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-0">
          {renderUploadTab()}
        </TabsContent>
        
        <TabsContent value="review" className="mt-0">
          {renderReviewTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
