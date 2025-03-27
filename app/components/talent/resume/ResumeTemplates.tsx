'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FaCheck } from 'react-icons/fa'

interface ResumeTemplateProps {
  onSelectTemplate: (template: string) => void
  selectedTemplate: string
}

const templates = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'A clean, professional template suitable for corporate roles',
    image: '/images/resume-templates/professional.png',
    color: 'bg-blue-600'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'A contemporary design with a creative touch',
    image: '/images/resume-templates/modern.png',
    color: 'bg-purple-600'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'A simple, elegant design focusing on content',
    image: '/images/resume-templates/minimal.png',
    color: 'bg-gray-800'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'A bold, distinctive design for creative industries',
    image: '/images/resume-templates/creative.png',
    color: 'bg-green-600'
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'A sophisticated template for senior positions',
    image: '/images/resume-templates/executive.png',
    color: 'bg-red-700'
  }
]

export default function ResumeTemplates({ onSelectTemplate, selectedTemplate }: ResumeTemplateProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Choose a Template</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectTemplate(template.id)}
          >
            <div className="relative">
              <div className={`h-2 w-full ${template.color} rounded-t-lg`}></div>
              <div className="p-3">
                <div className="relative h-40 w-full mb-2 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                  {/* Placeholder for template preview image */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <span className="text-xs">Template Preview</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{template.description}</p>
                  </div>
                  
                  {selectedTemplate === template.id && (
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <FaCheck size={12} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
