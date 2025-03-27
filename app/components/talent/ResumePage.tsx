'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ResumeUploader from './resume/ResumeUploader'
import ResumeEditor from './resume/ResumeEditor'
import ResumeSharing from './resume/ResumeSharing'
import LinkedInImport from './resume/LinkedInImport'
import ResumeTemplates from './resume/ResumeTemplates'
import ResumePDFExport from './resume/ResumePDFExport'
import { FaSpinner, FaDownload, FaShare, FaLinkedin, FaUpload, FaEdit, FaMagic, FaFileAlt, FaEye } from 'react-icons/fa'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export interface ResumeData {
  id: string;
  userId: string;
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
  projects: {
    name: string;
    description: string;
    technologies: string[];
    url: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
  languages: {
    name: string;
    proficiency: string;
  }[];
  createdAt: string;
  updatedAt: string;
  pdfUrl: string;
  isPublic: boolean;
  shareableLink: string;
  shareExpiry: string;
  template: string;
}

export default function ResumePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'share' | 'templates' | 'export'>('view')
  const [isLoading, setIsLoading] = useState(true)
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('professional')
  
  // Fetch resume data on component mount
  useEffect(() => {
    fetchResumeData()
  }, [])
  
  // Fetch resume data from the API
  const fetchResumeData = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch('/api/talent/resume')
      
      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized, redirect to login
          router.push('/login')
          return
        }
        setError('Unable to fetch resume data. Please try again later.')
        return
      }
      
      const data = await response.json()
      
      if (data.resume) {
        setResumeData(data.resume)
        // If template is stored with resume, use it
        if (data.resume.template) {
          setSelectedTemplate(data.resume.template)
        }
      } else {
        setResumeData(null)
      }
    } catch (error) {
      console.error('Error fetching resume data:', error)
      setError('Failed to load resume data. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle resume update
  const handleResumeUpdate = (updatedResume: ResumeData) => {
    setResumeData(updatedResume)
  }
  
  // Handle resume download
  const handleDownloadResume = async () => {
    if (!resumeData?.pdfUrl) return
    
    try {
      window.open(resumeData.pdfUrl, '_blank')
    } catch (error) {
      console.error('Error downloading resume:', error)
      setError('Failed to download resume. Please try again later.')
    }
  }
  
  // Handle template selection
  const handleSelectTemplate = async (template: string) => {
    setSelectedTemplate(template)
    
    // If we have a resume, update its template
    if (resumeData) {
      try {
        const response = await fetch('/api/talent/resume/template', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            resumeId: resumeData.id,
            template
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to update resume template')
        }
        
        const data = await response.json()
        setResumeData(data.resume)
        
      } catch (error) {
        console.error('Error updating resume template:', error)
        setError('Failed to update resume template. Please try again later.')
      }
    }
  }
  
  // Handle AI resume generation
  const handleGenerateResume = async () => {
    try {
      setIsGenerating(true)
      setError('')
      
      const response = await fetch('/api/talent/resume/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template: selectedTemplate
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate resume')
      }
      
      const data = await response.json()
      setResumeData(data.resume)
      
      // Switch to view tab to show the generated resume
      setActiveTab('view')
    } catch (error) {
      console.error('Error generating resume:', error)
      setError('Failed to generate resume. Please try again later.')
    } finally {
      setIsGenerating(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your resume...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 lg:p-6">
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold mb-4">My Resume</h2>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="view" className="flex items-center">
              <FaEye className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">View</span>
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center">
              <FaEdit className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center">
              <FaFileAlt className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center">
              <FaDownload className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </TabsTrigger>
            <TabsTrigger value="share" className="flex items-center">
              <FaShare className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </TabsTrigger>
          </TabsList>
          
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {!resumeData ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">No Resume Found</h3>
                <p className="text-gray-500 mb-4">
                  You haven't created a resume yet. Choose one of the options below to get started.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ResumeUploader onResumeUploaded={handleResumeUpdate} />
                
                <LinkedInImport onResumeImported={handleResumeUpdate} />
                
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">AI-Generated Resume</h3>
                  
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors"
                    onClick={handleGenerateResume}
                  >
                    {isGenerating ? (
                      <div className="flex flex-col items-center">
                        <FaSpinner className="animate-spin text-black mb-2" size={24} />
                        <p className="text-sm text-gray-500">Generating your resume...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FaMagic className="text-purple-500 mb-2" size={24} />
                        <p className="text-sm text-gray-500 mb-1">Generate with AI</p>
                        <p className="text-xs text-center text-gray-500">
                          Create a professional resume using your profile data
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Choose a Template</h3>
                <ResumeTemplates 
                  onSelectTemplate={handleSelectTemplate}
                  selectedTemplate={selectedTemplate}
                />
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="view" className="mt-0">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={() => setActiveTab('export')}
                    >
                      <FaDownload className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('share')}
                    >
                      <FaShare className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                  
                  {/* Resume Preview */}
                  <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold mb-1">{resumeData.fullName}</h1>
                    
                    <div className="text-gray-600 text-sm mb-4">
                      {resumeData.email} {resumeData.phone && `• ${resumeData.phone}`}
                    </div>
                    
                    {resumeData.summary && (
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold border-b pb-1 mb-2">Summary</h2>
                        <p className="text-sm">{resumeData.summary}</p>
                      </div>
                    )}
                    
                    {resumeData.skills && resumeData.skills.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold border-b pb-1 mb-2">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {resumeData.skills.map((skill, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {resumeData.experience && resumeData.experience.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold border-b pb-1 mb-2">Experience</h2>
                        {resumeData.experience.map((exp, index) => (
                          <div key={index} className="mb-4">
                            <h3 className="font-semibold">{exp.title}</h3>
                            <div className="text-sm text-gray-600">
                              {exp.company} {exp.location && `• ${exp.location}`}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              {exp.startDate} - {exp.endDate || 'Present'}
                            </div>
                            <p className="text-sm">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {resumeData.education && resumeData.education.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold border-b pb-1 mb-2">Education</h2>
                        {resumeData.education.map((edu, index) => (
                          <div key={index} className="mb-4">
                            <h3 className="font-semibold">{edu.degree}</h3>
                            <div className="text-sm text-gray-600">
                              {edu.institution} {edu.location && `• ${edu.location}`}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              {edu.startDate} - {edu.endDate || 'Present'}
                            </div>
                            {edu.description && <p className="text-sm">{edu.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Other resume sections... */}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="edit" className="mt-0">
                <ResumeEditor 
                  resumeData={resumeData} 
                  onResumeUpdate={handleResumeUpdate} 
                />
              </TabsContent>
              
              <TabsContent value="templates" className="mt-0">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <ResumeTemplates 
                    onSelectTemplate={handleSelectTemplate}
                    selectedTemplate={selectedTemplate}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="export" className="mt-0">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <ResumePDFExport 
                    resumeData={resumeData}
                    template={selectedTemplate}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="share" className="mt-0">
                <ResumeSharing 
                  resumeData={resumeData} 
                  onResumeUpdate={handleResumeUpdate} 
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}
