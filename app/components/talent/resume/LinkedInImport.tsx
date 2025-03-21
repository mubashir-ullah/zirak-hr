'use client'

import { useState } from 'react'
import { FaLinkedin, FaSpinner } from 'react-icons/fa'

interface LinkedInImportProps {
  onResumeImported: (resumeData: any) => void
}

export default function LinkedInImport({ onResumeImported }: LinkedInImportProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState('')
  
  const handleImportFromLinkedIn = async () => {
    setIsImporting(true)
    setError('')
    
    try {
      // This would typically open a LinkedIn OAuth flow in a popup window
      const linkedInWindow = window.open(
        '/api/auth/linkedin',
        'LinkedIn Login',
        'width=600,height=700'
      )
      
      // Listen for messages from the popup window
      window.addEventListener('message', async (event) => {
        // Verify origin for security
        if (event.origin !== window.location.origin) return
        
        // Check if the message contains a LinkedIn access token
        if (event.data?.type === 'linkedin-auth' && event.data?.accessToken) {
          try {
            // Close the popup window
            if (linkedInWindow) linkedInWindow.close()
            
            // Use the access token to import LinkedIn data
            const response = await fetch('/api/talent/resume/import-linkedin', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                accessToken: event.data.accessToken
              })
            })
            
            if (!response.ok) {
              throw new Error('Failed to import from LinkedIn')
            }
            
            const data = await response.json()
            onResumeImported(data.resume)
          } catch (error) {
            console.error('Error importing from LinkedIn:', error)
            setError('Failed to import from LinkedIn. Please try again later.')
            setIsImporting(false)
          }
        }
      }, { once: true })
      
      // If the window is closed without sending a message
      const checkWindowClosed = setInterval(() => {
        if (linkedInWindow?.closed) {
          clearInterval(checkWindowClosed)
          setIsImporting(false)
        }
      }, 1000)
      
    } catch (error) {
      console.error('Error opening LinkedIn auth window:', error)
      setError('Failed to open LinkedIn authentication. Please try again later.')
      setIsImporting(false)
    }
  }
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Import from LinkedIn</h3>
      
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#0077B5] transition-colors"
        onClick={handleImportFromLinkedIn}
      >
        {isImporting ? (
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-[#0077B5] mb-2" size={24} />
            <p className="text-sm text-gray-500">Connecting to LinkedIn...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FaLinkedin className="text-[#0077B5] mb-2" size={24} />
            <p className="text-sm text-gray-500 mb-1">Import from LinkedIn</p>
            <p className="text-xs text-center text-gray-500">
              Connect your LinkedIn account to automatically import your profile data
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 text-sm text-red-600">
          {error}
        </div>
      )}
      
      <div className="mt-4">
        <p className="text-xs text-gray-500">
          We'll import your work experience, education, skills, and other professional information from LinkedIn to create a resume automatically.
        </p>
      </div>
    </div>
  )
}
