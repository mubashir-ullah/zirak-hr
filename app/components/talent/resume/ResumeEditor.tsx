'use client'

import { useState } from 'react'
import { FaSave, FaSpinner, FaPlus, FaTrash } from 'react-icons/fa'

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

interface ResumeEditorProps {
  resumeData: ResumeData;
  onResumeUpdated: (updatedResume: ResumeData) => void;
}

export default function ResumeEditor({ resumeData, onResumeUpdated }: ResumeEditorProps) {
  const [formData, setFormData] = useState<ResumeData>(resumeData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newSkill, setNewSkill] = useState('')
  
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Handle adding a new skill
  const handleAddSkill = () => {
    if (!newSkill.trim()) return
    
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }))
    
    setNewSkill('')
  }
  
  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }
  
  // Handle adding a new education entry
  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    }))
  }
  
  // Handle removing an education entry
  const handleRemoveEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }
  
  // Handle education input changes
  const handleEducationChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newEducation = [...prev.education]
      newEducation[index] = {
        ...newEducation[index],
        [field]: value
      }
      return {
        ...prev,
        education: newEducation
      }
    })
  }
  
  // Handle adding a new experience entry
  const handleAddExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    }))
  }
  
  // Handle removing an experience entry
  const handleRemoveExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }
  
  // Handle experience input changes
  const handleExperienceChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newExperience = [...prev.experience]
      newExperience[index] = {
        ...newExperience[index],
        [field]: value
      }
      return {
        ...prev,
        experience: newExperience
      }
    })
  }
  
  // Handle adding a new project entry
  const handleAddProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          name: '',
          description: '',
          technologies: [],
          url: ''
        }
      ]
    }))
  }
  
  // Handle removing a project entry
  const handleRemoveProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }))
  }
  
  // Handle project input changes
  const handleProjectChange = (index: number, field: string, value: string | string[]) => {
    setFormData(prev => {
      const newProjects = [...prev.projects]
      newProjects[index] = {
        ...newProjects[index],
        [field]: value
      }
      return {
        ...prev,
        projects: newProjects
      }
    })
  }
  
  // Handle project technologies changes
  const handleProjectTechChange = (index: number, techString: string) => {
    const technologies = techString.split(',').map(tech => tech.trim()).filter(Boolean)
    handleProjectChange(index, 'technologies', technologies)
  }
  
  // Handle adding a new certification entry
  const handleAddCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          name: '',
          issuer: '',
          date: ''
        }
      ]
    }))
  }
  
  // Handle removing a certification entry
  const handleRemoveCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }
  
  // Handle certification input changes
  const handleCertificationChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newCertifications = [...prev.certifications]
      newCertifications[index] = {
        ...newCertifications[index],
        [field]: value
      }
      return {
        ...prev,
        certifications: newCertifications
      }
    })
  }
  
  // Handle adding a new language entry
  const handleAddLanguage = () => {
    setFormData(prev => ({
      ...prev,
      languages: [
        ...prev.languages,
        {
          name: '',
          proficiency: 'Conversational'
        }
      ]
    }))
  }
  
  // Handle removing a language entry
  const handleRemoveLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }))
  }
  
  // Handle language input changes
  const handleLanguageChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newLanguages = [...prev.languages]
      newLanguages[index] = {
        ...newLanguages[index],
        [field]: value
      }
      return {
        ...prev,
        languages: newLanguages
      }
    })
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch('/api/talent/resume', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update resume')
      }
      
      const data = await response.json()
      onResumeUpdated(data.resume)
      setSuccess('Resume updated successfully')
    } catch (error) {
      console.error('Error updating resume:', error)
      setError('Failed to update resume. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4">
            {success}
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Professional Summary</label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Skills</h3>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.skills.map((skill, index) => (
              <div key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full flex items-center">
                <span className="mr-2">{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded-l-md"
              placeholder="Add a skill"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-black text-white px-4 py-2 rounded-r-md"
            >
              <FaPlus />
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Experience</h3>
            <button
              type="button"
              onClick={handleAddExperience}
              className="bg-black text-white px-3 py-1 rounded-md text-sm flex items-center"
            >
              <FaPlus className="mr-1" /> Add Experience
            </button>
          </div>
          
          {formData.experience.map((exp, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">Experience #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(index)}
                  className="text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title</label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="MM/YYYY"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="MM/YYYY or leave blank for current"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Education</h3>
            <button
              type="button"
              onClick={handleAddEducation}
              className="bg-black text-white px-3 py-1 rounded-md text-sm flex items-center"
            >
              <FaPlus className="mr-1" /> Add Education
            </button>
          </div>
          
          {formData.education.map((edu, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">Education #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(index)}
                  className="text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="text"
                      value={edu.startDate}
                      onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="YYYY"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="YYYY or leave blank for current"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={edu.description}
                  onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Projects</h3>
            <button
              type="button"
              onClick={handleAddProject}
              className="bg-black text-white px-3 py-1 rounded-md text-sm flex items-center"
            >
              <FaPlus className="mr-1" /> Add Project
            </button>
          </div>
          
          {formData.projects.map((project, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">Project #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(index)}
                  className="text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Name</label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={project.technologies.join(', ')}
                    onChange={(e) => handleProjectTechChange(index, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="React, Node.js, MongoDB, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <input
                    type="text"
                    value={project.url}
                    onChange={(e) => handleProjectChange(index, 'url', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Certifications</h3>
            <button
              type="button"
              onClick={handleAddCertification}
              className="bg-black text-white px-3 py-1 rounded-md text-sm flex items-center"
            >
              <FaPlus className="mr-1" /> Add Certification
            </button>
          </div>
          
          {formData.certifications.map((cert, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">Certification #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveCertification(index)}
                  className="text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Issuer</label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) => handleCertificationChange(index, 'date', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="MM/YYYY"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Languages</h3>
            <button
              type="button"
              onClick={handleAddLanguage}
              className="bg-black text-white px-3 py-1 rounded-md text-sm flex items-center"
            >
              <FaPlus className="mr-1" /> Add Language
            </button>
          </div>
          
          {formData.languages.map((lang, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">Language #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveLanguage(index)}
                  className="text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <input
                    type="text"
                    value={lang.name}
                    onChange={(e) => handleLanguageChange(index, 'name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Proficiency</label>
                  <select
                    value={lang.proficiency}
                    onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Elementary">Elementary</option>
                    <option value="Limited Working">Limited Working</option>
                    <option value="Professional Working">Professional Working</option>
                    <option value="Full Professional">Full Professional</option>
                    <option value="Native/Bilingual">Native/Bilingual</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white px-6 py-2 rounded-lg flex items-center"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
