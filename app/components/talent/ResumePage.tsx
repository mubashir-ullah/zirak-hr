'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ResumeUploader from './resume/ResumeUploader'
import ResumeEditor from './resume/ResumeEditor'
import ResumeSharing from './resume/ResumeSharing'
import LinkedInImport from './resume/LinkedInImport'
import { FaSpinner, FaDownload, FaShare, FaLinkedin, FaUpload, FaEdit, FaMagic } from 'react-icons/fa'

interface ResumeData {
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
}

export default function ResumePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'share'>('view')
  const [isLoading, setIsLoading] = useState(true)
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
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
          template: 'professional'
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl lg:text-2xl font-bold">My Resume</h2>
        
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === 'view' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setActiveTab('view')}
          >
            View
          </button>
          
          <button
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === 'edit' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setActiveTab('edit')}
          >
            Edit
          </button>
          
          <button
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === 'share' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setActiveTab('share')}
          >
            Share
          </button>
        </div>
      </div>
      
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
        </div>
      ) : (
        <>
          {activeTab === 'view' && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex justify-end mb-4">
                <button
                  className="bg-black text-white px-4 py-2 rounded-lg flex items-center text-sm mr-2"
                  onClick={handleDownloadResume}
                >
                  <FaDownload className="mr-2" />
                  Download PDF
                </button>
                
                <button
                  className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center text-sm"
                  onClick={() => setActiveTab('share')}
                >
                  <FaShare className="mr-2" />
                  Share
                </button>
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
                
                {resumeData.projects && resumeData.projects.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold border-b pb-1 mb-2">Projects</h2>
                    {resumeData.projects.map((project, index) => (
                      <div key={index} className="mb-4">
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="text-sm mb-1">{project.description}</p>
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            {project.technologies.map((tech, techIndex) => (
                              <span key={techIndex} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        {project.url && (
                          <a 
                            href={project.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {project.url}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {resumeData.certifications && resumeData.certifications.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold border-b pb-1 mb-2">Certifications</h2>
                    <ul className="list-disc list-inside">
                      {resumeData.certifications.map((cert, index) => (
                        <li key={index} className="text-sm mb-1">
                          {cert.name} - {cert.issuer} ({cert.date})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {resumeData.languages && resumeData.languages.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold border-b pb-1 mb-2">Languages</h2>
                    <ul className="list-disc list-inside">
                      {resumeData.languages.map((lang, index) => (
                        <li key={index} className="text-sm mb-1">
                          {lang.name} - {lang.proficiency}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'edit' && (
            <ResumeEditor 
              resumeData={resumeData} 
              onResumeUpdated={handleResumeUpdate} 
            />
          )}
          
          {activeTab === 'share' && (
            <ResumeSharing 
              resumeData={resumeData} 
              onResumeUpdated={handleResumeUpdate} 
            />
          )}
        </>
      )}
    </div>
  )
}
