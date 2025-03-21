'use client'

import { useState, useEffect } from 'react'
import { FaDownload, FaSpinner } from 'react-icons/fa'
import { useParams } from 'next/navigation'

interface ResumeData {
  fullName: string;
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
  pdfUrl: string;
}

export default function SharedResumePage() {
  const params = useParams<{ shareableLink: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [error, setError] = useState('')
  
  useEffect(() => {
    if (params.shareableLink) {
      fetchResumeData(params.shareableLink as string)
    }
  }, [params.shareableLink])
  
  const fetchResumeData = async (shareableLink: string) => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch(`/api/resume/${shareableLink}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Resume not found or link has expired')
        }
        throw new Error('Failed to fetch resume data')
      }
      
      const data = await response.json()
      
      if (data.resume) {
        setResumeData(data.resume)
      } else {
        throw new Error('Resume not found')
      }
    } catch (error) {
      console.error('Error fetching resume data:', error)
      setError(error.message || 'Failed to load resume. Please check the link and try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleDownloadResume = () => {
    if (resumeData?.pdfUrl) {
      window.open(resumeData.pdfUrl, '_blank')
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-black mb-4" size={32} />
          <p className="text-gray-600">Loading resume...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <p className="text-gray-500 text-sm">
            The resume you're looking for might have been removed or the link has expired.
          </p>
        </div>
      </div>
    )
  }
  
  if (!resumeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Resume Not Found</h2>
          <p className="text-gray-700 mb-6">
            The resume you're looking for might have been removed or the link has expired.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 bg-black text-white flex justify-between items-center">
            <h1 className="text-xl font-bold">Zirak HR - Resume</h1>
            
            <button
              onClick={handleDownloadResume}
              className="bg-white text-black px-4 py-2 rounded-lg text-sm flex items-center"
            >
              <FaDownload className="mr-2" />
              Download PDF
            </button>
          </div>
          
          <div className="p-6">
            <h2 className="text-3xl font-bold mb-1">{resumeData.fullName}</h2>
            
            {resumeData.summary && (
              <div className="mb-8 mt-4">
                <h3 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-3">Professional Summary</h3>
                <p className="text-gray-700">{resumeData.summary}</p>
              </div>
            )}
            
            {resumeData.skills && resumeData.skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {resumeData.experience && resumeData.experience.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-3">Experience</h3>
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className="mb-6">
                    <h4 className="text-lg font-semibold">{exp.title}</h4>
                    <div className="text-gray-700">
                      {exp.company} {exp.location && `• ${exp.location}`}
                    </div>
                    <div className="text-gray-500 text-sm mb-2">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </div>
                    <p className="text-gray-700">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
            
            {resumeData.education && resumeData.education.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-3">Education</h3>
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="mb-6">
                    <h4 className="text-lg font-semibold">{edu.degree}</h4>
                    <div className="text-gray-700">
                      {edu.institution} {edu.location && `• ${edu.location}`}
                    </div>
                    <div className="text-gray-500 text-sm mb-2">
                      {edu.startDate} - {edu.endDate || 'Present'}
                    </div>
                    {edu.description && <p className="text-gray-700">{edu.description}</p>}
                  </div>
                ))}
              </div>
            )}
            
            {resumeData.projects && resumeData.projects.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-3">Projects</h3>
                {resumeData.projects.map((project, index) => (
                  <div key={index} className="mb-6">
                    <h4 className="text-lg font-semibold">{project.name}</h4>
                    <p className="text-gray-700 mb-2">{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {project.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-sm">
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
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {project.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {resumeData.certifications && resumeData.certifications.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-3">Certifications</h3>
                <ul className="list-disc list-inside">
                  {resumeData.certifications.map((cert, index) => (
                    <li key={index} className="text-gray-700 mb-2">
                      <span className="font-medium">{cert.name}</span> - {cert.issuer} ({cert.date})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {resumeData.languages && resumeData.languages.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-3">Languages</h3>
                <ul className="list-disc list-inside">
                  {resumeData.languages.map((lang, index) => (
                    <li key={index} className="text-gray-700 mb-2">
                      <span className="font-medium">{lang.name}</span> - {lang.proficiency}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-gray-50 text-center">
            <p className="text-gray-500 text-sm">
              This resume was shared via Zirak HR - The AI-powered talent matching platform
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
