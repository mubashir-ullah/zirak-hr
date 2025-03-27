'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FaDownload, FaSpinner, FaFilePdf, FaFileWord, FaFileAlt } from 'react-icons/fa'
import { ResumeData } from '../ResumePage'

interface ResumePDFExportProps {
  resumeData: ResumeData
  template: string
}

export default function ResumePDFExport({ resumeData, template }: ResumePDFExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'txt'>('pdf')
  const [exportError, setExportError] = useState('')
  
  const handleExport = async () => {
    try {
      setIsExporting(true)
      setExportError('')
      
      const response = await fetch('/api/talent/resume/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeId: resumeData.id,
          template,
          format: exportFormat
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to export resume: ${response.statusText}`)
      }
      
      // Get the file URL from the response
      const data = await response.json()
      
      // Create a temporary link to download the file
      const link = document.createElement('a')
      link.href = data.fileUrl
      link.download = `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.${exportFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error exporting resume:', error)
      setExportError(error instanceof Error ? error.message : 'Failed to export resume')
    } finally {
      setIsExporting(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Export Resume</h3>
      
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-2">Select export format:</p>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExportFormat('pdf')}
                  className="flex items-center"
                >
                  <FaFilePdf className="mr-2" />
                  PDF
                </Button>
                
                <Button
                  type="button"
                  variant={exportFormat === 'docx' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExportFormat('docx')}
                  className="flex items-center"
                >
                  <FaFileWord className="mr-2" />
                  Word
                </Button>
                
                <Button
                  type="button"
                  variant={exportFormat === 'txt' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExportFormat('txt')}
                  className="flex items-center"
                >
                  <FaFileAlt className="mr-2" />
                  Plain Text
                </Button>
              </div>
            </div>
            
            {exportError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {exportError}
              </div>
            )}
            
            <Button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FaDownload className="mr-2" />
                  Export Resume
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500">
              Your resume will be exported in {exportFormat.toUpperCase()} format using the {template} template.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
