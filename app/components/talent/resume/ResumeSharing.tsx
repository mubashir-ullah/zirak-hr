'use client'

import { useState, useEffect } from 'react'
import { FaLink, FaSpinner, FaCopy, FaCheck, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa'

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

interface ResumeSharingProps {
  resumeData: ResumeData;
  onResumeUpdated: (updatedResume: ResumeData) => void;
}

export default function ResumeSharing({ resumeData, onResumeUpdated }: ResumeSharingProps) {
  const [isPublic, setIsPublic] = useState(resumeData.isPublic)
  const [expiryDays, setExpiryDays] = useState(30)
  const [shareableUrl, setShareableUrl] = useState('')
  const [shareExpiry, setShareExpiry] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')
  
  // Fetch current sharing settings on component mount
  useEffect(() => {
    fetchSharingSettings()
  }, [])
  
  const fetchSharingSettings = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/talent/resume/share')
      
      if (!response.ok) {
        throw new Error('Failed to fetch sharing settings')
      }
      
      const data = await response.json()
      
      setIsPublic(data.isPublic)
      setShareableUrl(data.shareableUrl)
      setShareExpiry(data.shareExpiry ? new Date(data.shareExpiry) : null)
    } catch (error) {
      console.error('Error fetching sharing settings:', error)
      setError('Failed to load sharing settings. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleToggleSharing = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch('/api/talent/resume/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPublic: !isPublic,
          expiryDays
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update sharing settings')
      }
      
      const data = await response.json()
      
      setIsPublic(data.isPublic)
      setShareableUrl(data.shareableUrl)
      setShareExpiry(data.shareExpiry ? new Date(data.shareExpiry) : null)
      
      // Update parent component
      onResumeUpdated({
        ...resumeData,
        isPublic: data.isPublic,
        shareableLink: data.shareableLink,
        shareExpiry: data.shareExpiry
      })
    } catch (error) {
      console.error('Error updating sharing settings:', error)
      setError('Failed to update sharing settings. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl)
    setIsCopied(true)
    
    // Reset copied state after 3 seconds
    setTimeout(() => {
      setIsCopied(false)
    }, 3000)
  }
  
  const handleShareViaLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`
    window.open(url, '_blank')
  }
  
  const handleShareViaTwitter = () => {
    const text = `Check out my professional resume`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareableUrl)}`
    window.open(url, '_blank')
  }
  
  const handleShareViaEmail = () => {
    const subject = 'My Professional Resume'
    const body = `Hello,\n\nI wanted to share my professional resume with you. You can view it here: ${shareableUrl}\n\nBest regards,\n${resumeData.fullName}`
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoUrl
  }
  
  const formatExpiryDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Share Your Resume</h3>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium">Public Sharing</h4>
            <p className="text-sm text-gray-500">
              Make your resume accessible via a unique link
            </p>
          </div>
          
          <div className="relative inline-block w-12 align-middle select-none">
            <input
              type="checkbox"
              name="toggle"
              id="toggle"
              checked={isPublic}
              onChange={handleToggleSharing}
              disabled={isLoading}
              className="sr-only"
            />
            <label
              htmlFor="toggle"
              className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                isPublic ? 'bg-black' : 'bg-gray-300'
              }`}
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                  isPublic ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </label>
          </div>
        </div>
        
        {isLoading && (
          <div className="flex justify-center my-4">
            <FaSpinner className="animate-spin text-black" size={24} />
          </div>
        )}
        
        {isPublic && shareableUrl && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Shareable Link</label>
              <div className="flex">
                <input
                  type="text"
                  value={shareableUrl}
                  readOnly
                  className="flex-grow p-2 border border-gray-300 rounded-l-md bg-gray-50"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-black text-white px-4 py-2 rounded-r-md"
                >
                  {isCopied ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
              
              {shareExpiry && (
                <p className="text-xs text-gray-500 mt-1">
                  This link will expire on {formatExpiryDate(shareExpiry)}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Share via</label>
              <div className="flex space-x-2">
                <button
                  onClick={handleShareViaLinkedIn}
                  className="bg-[#0077B5] text-white p-2 rounded-md"
                  title="Share on LinkedIn"
                >
                  <FaLinkedin size={20} />
                </button>
                
                <button
                  onClick={handleShareViaTwitter}
                  className="bg-[#1DA1F2] text-white p-2 rounded-md"
                  title="Share on Twitter"
                >
                  <FaTwitter size={20} />
                </button>
                
                <button
                  onClick={handleShareViaEmail}
                  className="bg-gray-800 text-white p-2 rounded-md"
                  title="Share via Email"
                >
                  <FaEnvelope size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
        <h4 className="font-medium mb-4">Link Expiration</h4>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Expire link after
          </label>
          <select
            value={expiryDays}
            onChange={(e) => setExpiryDays(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={isLoading || !isPublic}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>When you update the expiration:</p>
          <ul className="list-disc list-inside mt-2">
            <li>A new shareable link will be generated</li>
            <li>The previous link will no longer work</li>
            <li>You'll need to share the new link with your contacts</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
