'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Briefcase, MapPin, Clock, Building, CreditCard, Calendar,
  ChevronLeft, Globe, Bookmark, BookmarkCheck, Send, Check,
  GraduationCap, Languages, Award, CheckCircle, Shield
} from 'lucide-react'

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  jobType: string;
  experienceLevel: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  remote: boolean;
  applicationDeadline: string;
  postedDate: string;
  status: string;
  applicationCount: number;
  viewCount: number;
  industry: string;
  companySize: string;
  benefits: string[];
  educationLevel: string;
  germanLevel: string;
  visaSponsorship: boolean;
  matchPercentage?: number;
  matchedSkills?: number;
  isSaved?: boolean;
  isApplied?: boolean;
}

interface JobDetailViewProps {
  job: Job;
  onApply: () => void;
  onBookmark: () => void;
  onClose: () => void;
}

export default function JobDetailView({ job, onApply, onBookmark, onClose }: JobDetailViewProps) {
  const [showFullDescription, setShowFullDescription] = useState(false)
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  // Format experience level for display
  const formatExperienceLevel = (level: string) => {
    switch(level) {
      case 'entry': return 'Entry Level'
      case 'junior': return 'Junior'
      case 'mid-level': return 'Mid-Level'
      case 'senior': return 'Senior'
      case 'lead': return 'Lead'
      default: return level
    }
  }
  
  // Format job type for display
  const formatJobType = (type: string) => {
    switch(type) {
      case 'full-time': return 'Full-time'
      case 'part-time': return 'Part-time'
      case 'contract': return 'Contract'
      case 'freelance': return 'Freelance'
      case 'internship': return 'Internship'
      default: return type
    }
  }
  
  // Truncate description if needed
  const truncateDescription = (text: string, maxLength = 500) => {
    if (text.length <= maxLength) return text
    return showFullDescription ? text : `${text.substring(0, maxLength)}...`
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <Button variant="ghost" size="sm" onClick={onClose} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Jobs
        </Button>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBookmark}
          >
            {job.isSaved ? (
              <>
                <BookmarkCheck className="h-4 w-4 mr-1" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4 mr-1" />
                Save Job
              </>
            )}
          </Button>
          
          <Button 
            size="sm"
            disabled={job.isApplied}
            onClick={onApply}
          >
            {job.isApplied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Applied
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Apply Now
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
        <div className="flex items-center text-gray-600 mb-2">
          <Building className="h-4 w-4 mr-1" />
          <span className="font-medium">{job.company}</span>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            {job.location}
            {job.remote && " (Remote)"}
          </div>
          
          <div className="flex items-center text-gray-600">
            <Briefcase className="h-4 w-4 mr-1" />
            {formatJobType(job.jobType)}
          </div>
          
          <div className="flex items-center text-gray-600">
            <CreditCard className="h-4 w-4 mr-1" />
            {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
          </div>
          
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            Posted {formatDate(job.postedDate)}
          </div>
        </div>
        
        {job.matchPercentage && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Match Score</span>
              <Badge className={
                job.matchPercentage > 80 
                  ? 'bg-green-100 text-green-800' 
                  : job.matchPercentage > 60
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
              }>
                {job.matchPercentage}% Match
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`rounded-full h-2 ${
                  job.matchPercentage > 80 
                    ? 'bg-green-500' 
                    : job.matchPercentage > 60
                      ? 'bg-yellow-500'
                      : 'bg-gray-500'
                }`}
                style={{ width: `${job.matchPercentage}%` }}
              ></div>
            </div>
            {job.matchedSkills !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                {job.matchedSkills} of your skills match this job
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{formatExperienceLevel(job.experienceLevel)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Education</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{job.educationLevel || 'Not specified'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">German Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{job.germanLevel || 'Not required'}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Job Description</h2>
        <div className={`prose max-w-none ${!showFullDescription && 'line-clamp-6'}`}>
          <p>{truncateDescription(job.description)}</p>
        </div>
        {job.description && job.description.length > 300 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="mt-2"
          >
            {showFullDescription ? 'Show Less' : 'Show More'}
          </Button>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Requirements</h2>
        <ul className="list-disc pl-5 space-y-1">
          {job.requirements && job.requirements.length > 0 ? (
            job.requirements.map((requirement, index) => (
              <li key={index} className="text-gray-700">{requirement}</li>
            ))
          ) : (
            <li className="text-gray-500">No specific requirements listed</li>
          )}
        </ul>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {job.skills && job.skills.length > 0 ? (
            job.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className={
                job.matchedSkills && job.matchedSkills > 0 && (job as any).matchedSkillsList?.includes(skill)
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : ''
              }>
                {skill}
              </Badge>
            ))
          ) : (
            <span className="text-gray-500">No specific skills listed</span>
          )}
        </div>
      </div>
      
      {job.benefits && job.benefits.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Benefits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {job.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Company Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Industry</p>
            <p className="font-medium">{job.industry || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Company Size</p>
            <p className="font-medium">{job.companySize || 'Not specified'}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Additional Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Application Deadline</p>
              <p className="font-medium">
                {job.applicationDeadline 
                  ? formatDate(job.applicationDeadline) 
                  : 'Not specified'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Globe className="h-4 w-4 mr-2 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Remote Work</p>
              <p className="font-medium">{job.remote ? 'Available' : 'Not available'}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-2 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Visa Sponsorship</p>
              <p className="font-medium">{job.visaSponsorship ? 'Available' : 'Not available'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Job ID: {job._id}
        </p>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={onBookmark}
          >
            {job.isSaved ? (
              <>
                <BookmarkCheck className="h-4 w-4 mr-1" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4 mr-1" />
                Save Job
              </>
            )}
          </Button>
          
          <Button 
            disabled={job.isApplied}
            onClick={onApply}
          >
            {job.isApplied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Applied
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Apply Now
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
