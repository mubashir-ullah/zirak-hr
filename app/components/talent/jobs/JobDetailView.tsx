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
  onSave: () => void;
  onBack: () => void;
}

export default function JobDetailView({ job, onApply, onSave, onBack }: JobDetailViewProps) {
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
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2"
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Jobs
          </Button>
          
          <div className="flex space-x-2">
            <Button 
              variant={job.isSaved ? "outline" : "secondary"} 
              size="sm"
              onClick={onSave}
            >
              {job.isSaved ? (
                <>
                  <BookmarkCheck className="h-4 w-4 mr-1 text-primary" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
            
            <Button 
              variant={job.isApplied ? "outline" : "default"} 
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
        
        <CardTitle className="text-2xl">{job.title}</CardTitle>
        <CardDescription className="flex items-center mt-1 text-base">
          <Building className="h-4 w-4 mr-1" />
          {job.company}
        </CardDescription>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {job.location}
            {job.remote && " (Remote)"}
          </Badge>
          <Badge variant="outline" className="flex items-center">
            <Briefcase className="h-3 w-3 mr-1" />
            {formatJobType(job.jobType)}
          </Badge>
          <Badge variant="outline" className="flex items-center">
            <Award className="h-3 w-3 mr-1" />
            {formatExperienceLevel(job.experienceLevel)}
          </Badge>
          {job.visaSponsorship && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Shield className="h-3 w-3 mr-1" />
              Visa Sponsorship
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-6">
        {job.matchPercentage !== undefined && (
          <div className="mb-4 p-4 bg-primary/10 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">Match Score</span>
              <span className="font-medium">{job.matchPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary rounded-full h-2.5" 
                style={{ width: `${job.matchPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm mt-2">
              <CheckCircle className="h-4 w-4 inline mr-1 text-primary" />
              {job.matchedSkills} of your skills match this job
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">JOB DETAILS</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CreditCard className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-medium">Salary Range</span>
                  <p className="text-sm">
                    {job.salary?.min && job.salary?.max 
                      ? `${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} ${job.salary.currency}`
                      : 'Not specified'
                    }
                  </p>
                </div>
              </li>
              
              <li className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-medium">Application Deadline</span>
                  <p className="text-sm">
                    {formatDate(job.applicationDeadline)}
                  </p>
                </div>
              </li>
              
              <li className="flex items-start">
                <Clock className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-medium">Posted Date</span>
                  <p className="text-sm">
                    {formatDate(job.postedDate)}
                  </p>
                </div>
              </li>
              
              <li className="flex items-start">
                <Globe className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-medium">Industry</span>
                  <p className="text-sm">
                    {job.industry || 'Not specified'}
                  </p>
                </div>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">REQUIREMENTS</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <GraduationCap className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-medium">Education</span>
                  <p className="text-sm">
                    {job.educationLevel || 'Not specified'}
                  </p>
                </div>
              </li>
              
              <li className="flex items-start">
                <Languages className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-medium">German Level</span>
                  <p className="text-sm">
                    {job.germanLevel || 'Not specified'}
                  </p>
                </div>
              </li>
              
              <li className="flex items-start">
                <Building className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-medium">Company Size</span>
                  <p className="text-sm">
                    {job.companySize || 'Not specified'}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Job Description</h3>
          <div className="text-sm whitespace-pre-line">
            {truncateDescription(job.description)}
            {job.description.length > 500 && (
              <Button 
                variant="link" 
                className="p-0 h-auto mt-1"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Requirements</h3>
          {job.requirements && job.requirements.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No specific requirements listed.</p>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills && job.skills.length > 0 ? (
              job.skills.map((skill, index) => (
                <Badge key={index} className="bg-primary/10 text-primary hover:bg-primary/20">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No specific skills listed.</p>
            )}
          </div>
        </div>
        
        {job.benefits && job.benefits.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Benefits</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {job.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Jobs
        </Button>
        
        <Button 
          variant={job.isApplied ? "outline" : "default"} 
          disabled={job.isApplied}
          onClick={onApply}
          size="lg"
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
      </CardFooter>
    </Card>
  )
}
