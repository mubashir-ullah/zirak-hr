'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp, 
  Save, Loader2, PlusCircle, X, Edit, Star, StarHalf
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

interface Skill {
  id: string;
  name: string;
  proficiency?: number;
  yearsOfExperience?: number;
  isNew?: boolean;
}

interface SkillSelfAssessmentProps {
  onSkillsUpdated?: () => void;
}

export default function SkillSelfAssessment({ onSkillsUpdated }: SkillSelfAssessmentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillCategory, setNewSkillCategory] = useState('')
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [addSkillDialogOpen, setAddSkillDialogOpen] = useState(false)
  
  // Fetch user skills
  useEffect(() => {
    fetchUserSkills()
  }, [])
  
  const fetchUserSkills = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // In a real app, this would be an API call to get the user's skills
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockSkillCategories: SkillCategory[] = [
        {
          id: 'programming',
          name: 'Programming Languages',
          skills: [
            { id: 'js', name: 'JavaScript', proficiency: 4, yearsOfExperience: 3 },
            { id: 'ts', name: 'TypeScript', proficiency: 3, yearsOfExperience: 2 },
            { id: 'py', name: 'Python', proficiency: 4, yearsOfExperience: 4 },
            { id: 'java', name: 'Java', proficiency: 2, yearsOfExperience: 1 },
          ]
        },
        {
          id: 'frameworks',
          name: 'Frameworks & Libraries',
          skills: [
            { id: 'react', name: 'React', proficiency: 4, yearsOfExperience: 3 },
            { id: 'nextjs', name: 'Next.js', proficiency: 3, yearsOfExperience: 2 },
            { id: 'node', name: 'Node.js', proficiency: 4, yearsOfExperience: 3 },
            { id: 'express', name: 'Express.js', proficiency: 3, yearsOfExperience: 2 },
          ]
        },
        {
          id: 'databases',
          name: 'Databases',
          skills: [
            { id: 'mongo', name: 'MongoDB', proficiency: 3, yearsOfExperience: 2 },
            { id: 'postgres', name: 'PostgreSQL', proficiency: 3, yearsOfExperience: 2 },
            { id: 'mysql', name: 'MySQL', proficiency: 2, yearsOfExperience: 1 },
          ]
        },
        {
          id: 'tools',
          name: 'Tools & Platforms',
          skills: [
            { id: 'git', name: 'Git', proficiency: 4, yearsOfExperience: 4 },
            { id: 'docker', name: 'Docker', proficiency: 3, yearsOfExperience: 2 },
            { id: 'aws', name: 'AWS', proficiency: 2, yearsOfExperience: 1 },
          ]
        },
        {
          id: 'soft',
          name: 'Soft Skills',
          skills: [
            { id: 'communication', name: 'Communication', proficiency: 4, yearsOfExperience: 5 },
            { id: 'teamwork', name: 'Teamwork', proficiency: 4, yearsOfExperience: 5 },
            { id: 'problem-solving', name: 'Problem Solving', proficiency: 4, yearsOfExperience: 5 },
          ]
        }
      ]
      
      setSkillCategories(mockSkillCategories)
      
      // Expand the first category by default
      const initialExpandedState: Record<string, boolean> = {}
      mockSkillCategories.forEach((category, index) => {
        initialExpandedState[category.id] = index === 0
      })
      setExpandedCategories(initialExpandedState)
      
    } catch (error) {
      console.error('Error fetching user skills:', error)
      setError('Failed to load your skills. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSaveSkills = async () => {
    try {
      setIsLoading(true)
      setError('')
      setSuccess(false)
      
      // In a real app, this would be an API call to save the user's skills
      // For now, we'll simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove the isNew flag from all skills
      const updatedCategories = skillCategories.map(category => ({
        ...category,
        skills: category.skills.map(skill => ({
          ...skill,
          isNew: false
        }))
      }))
      
      setSkillCategories(updatedCategories)
      setSuccess(true)
      
      toast({
        title: 'Skills Saved',
        description: 'Your skills have been successfully updated.',
        variant: 'default',
      })
      
      if (onSkillsUpdated) {
        onSkillsUpdated()
      }
    } catch (error) {
      console.error('Error saving skills:', error)
      setError('Failed to save your skills. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }
  
  const handleProficiencyChange = (categoryId: string, skillId: string, value: number[]) => {
    const updatedCategories = skillCategories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          skills: category.skills.map(skill => {
            if (skill.id === skillId) {
              return {
                ...skill,
                proficiency: value[0]
              }
            }
            return skill
          })
        }
      }
      return category
    })
    
    setSkillCategories(updatedCategories)
  }
  
  const handleExperienceChange = (categoryId: string, skillId: string, value: number[]) => {
    const updatedCategories = skillCategories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          skills: category.skills.map(skill => {
            if (skill.id === skillId) {
              return {
                ...skill,
                yearsOfExperience: value[0]
              }
            }
            return skill
          })
        }
      }
      return category
    })
    
    setSkillCategories(updatedCategories)
  }
  
  const handleRemoveSkill = (categoryId: string, skillId: string) => {
    const updatedCategories = skillCategories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          skills: category.skills.filter(skill => skill.id !== skillId)
        }
      }
      return category
    })
    
    setSkillCategories(updatedCategories)
  }
  
  const handleAddSkill = () => {
    if (!newSkillName.trim() || !newSkillCategory) {
      toast({
        title: 'Error',
        description: 'Please provide a skill name and category.',
        variant: 'destructive',
      })
      return
    }
    
    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      name: newSkillName.trim(),
      proficiency: 1,
      yearsOfExperience: 1,
      isNew: true
    }
    
    const updatedCategories = skillCategories.map(category => {
      if (category.id === newSkillCategory) {
        return {
          ...category,
          skills: [...category.skills, newSkill]
        }
      }
      return category
    })
    
    setSkillCategories(updatedCategories)
    setNewSkillName('')
    setAddSkillDialogOpen(false)
    
    // Ensure the category is expanded
    if (!expandedCategories[newSkillCategory]) {
      toggleCategoryExpansion(newSkillCategory)
    }
  }
  
  const getProficiencyLabel = (proficiency: number) => {
    switch (proficiency) {
      case 1: return 'Beginner'
      case 2: return 'Basic'
      case 3: return 'Intermediate'
      case 4: return 'Advanced'
      case 5: return 'Expert'
      default: return 'Not Specified'
    }
  }
  
  const renderProficiencyStars = (proficiency: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= proficiency) {
        stars.push(<Star key={i} className="h-4 w-4 fill-primary text-primary" />)
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />)
      }
    }
    return stars
  }
  
  if (isLoading && skillCategories.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Skill Self-Assessment</h2>
        <Button onClick={() => setAddSkillDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>
      
      <p className="text-gray-500 dark:text-gray-400">
        Rate your proficiency in each skill and specify your years of experience. This helps us match you with relevant job opportunities.
      </p>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert variant="default" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your skills have been successfully updated.</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        {skillCategories.map(category => (
          <Card key={category.id} className={cn(
            "overflow-hidden transition-all duration-200",
            category.skills.some(skill => skill.isNew) && "border-primary"
          )}>
            <CardHeader 
              className="pb-2 cursor-pointer"
              onClick={() => toggleCategoryExpansion(category.id)}
            >
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  {category.name}
                  {category.skills.some(skill => skill.isNew) && (
                    <Badge variant="default" className="ml-2 text-xs">New</Badge>
                  )}
                </CardTitle>
                {expandedCategories[category.id] ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <CardDescription>
                {category.skills.length} skills
              </CardDescription>
            </CardHeader>
            
            {expandedCategories[category.id] && (
              <CardContent>
                <div className="space-y-6">
                  {category.skills.map(skill => (
                    <div 
                      key={skill.id} 
                      className={cn(
                        "pb-4 last:pb-0",
                        skill.isNew && "bg-primary/5 p-3 rounded-md -mx-3"
                      )}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <h4 className="font-medium">{skill.name}</h4>
                          {skill.isNew && (
                            <Badge variant="outline" className="ml-2 text-xs border-primary text-primary">New</Badge>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-gray-500"
                          onClick={() => handleRemoveSkill(category.id, skill.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Proficiency</Label>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {getProficiencyLabel(skill.proficiency || 1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Slider
                              value={[skill.proficiency || 1]}
                              min={1}
                              max={5}
                              step={1}
                              onValueChange={(value) => handleProficiencyChange(category.id, skill.id, value)}
                              className="flex-1"
                            />
                            <div className="flex">
                              {renderProficiencyStars(skill.proficiency || 1)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Years of Experience</Label>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {skill.yearsOfExperience || 0} {(skill.yearsOfExperience || 0) === 1 ? 'year' : 'years'}
                            </span>
                          </div>
                          <Slider
                            value={[skill.yearsOfExperience || 0]}
                            min={0}
                            max={10}
                            step={1}
                            onValueChange={(value) => handleExperienceChange(category.id, skill.id, value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSkills} 
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Skills
        </Button>
      </div>
      
      <Dialog open={addSkillDialogOpen} onOpenChange={setAddSkillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
            <DialogDescription>
              Add a new skill to your profile and rate your proficiency.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Skill Name</Label>
              <Input
                id="skill-name"
                placeholder="e.g. React, Python, Project Management"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skill-category">Category</Label>
              <select
                id="skill-category"
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950"
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                {skillCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSkillDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSkill} disabled={!newSkillName.trim() || !newSkillCategory}>
              Add Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
