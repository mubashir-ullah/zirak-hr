'use client'

import { useState, useRef } from 'react'
import { FaUpload, FaSpinner } from 'react-icons/fa'

interface ResumeUploaderProps {
  onResumeUploaded: (resumeData: any) => void
}

export default function ResumeUploader({ onResumeUploaded }: ResumeUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    const fileType = file.name.split('.').pop()?.toLowerCase()
    if (fileType !== 'pdf' && fileType !== 'docx') {
      setError('Invalid file type. Only PDF and DOCX files are supported.')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }
    
    setIsUploading(true)
    setError('')
    setSuggestedSkills([])
    
    try {
      const formData = new FormData()
      formData.append('resume', file)
      
      const response = await fetch('/api/talent/resume/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload resume')
      }
      
      const data = await response.json()
      
      // If there are suggested skills, show them
      if (data.suggestedSkills && data.suggestedSkills.length > 0) {
        setSuggestedSkills(data.suggestedSkills)
      }
      
      onResumeUploaded(data.resume)
    } catch (error) {
      console.error('Error uploading resume:', error)
      setError('Failed to upload resume. Please try again later.')
    } finally {
      setIsUploading(false)
    }
  }
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Upload Your Resume</h3>
      
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors"
        onClick={handleUploadClick}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-black mb-2" size={24} />
            <p className="text-sm text-gray-500">Uploading and parsing resume...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FaUpload className="text-gray-400 mb-2" size={24} />
            <p className="text-sm text-gray-500 mb-1">Upload your resume</p>
            <p className="text-xs text-gray-400 mb-2">PDF or DOCX (Max 5MB)</p>
            <p className="text-xs text-center text-gray-500">
              Our AI will parse your resume and extract all relevant information
            </p>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleFileChange}
        />
      </div>
      
      {error && (
        <div className="mt-4 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {suggestedSkills.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">AI-Suggested Skills</h4>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills.map((skill, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                {skill}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            These skills were identified from your resume. They have been added to your profile.
          </p>
        </div>
      )}
    </div>
  )
}
