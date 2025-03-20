'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Upload, Linkedin, X, Camera, Trash2, Edit, Save, Check, ExternalLink } from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HRProfileSectionProps {
  profileData: {
    fullName: string
    company: string
    email: string
    role: string
    about: string
    linkedin: string
    profileImage: string
  }
  setProfileData: React.Dispatch<React.SetStateAction<{
    fullName: string
    company: string
    email: string
    role: string
    about: string
    linkedin: string
    profileImage: string
  }>>
  isLoading: boolean
}

export default function HRProfileSection({ 
  profileData, 
  setProfileData, 
  isLoading 
}: HRProfileSectionProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedData, setEditedData] = useState({ ...profileData })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null)
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Image size should be less than 5MB")
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setImageError("Please upload a valid image file")
        return
      }
      
      setImageFile(file)
      
      // Create a preview URL for the image
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setEditedData({
            ...editedData,
            profileImage: event.target.result.toString()
          })
        }
      }
      reader.readAsDataURL(file)
      
      // Reset the input value to allow uploading the same file again if needed
      e.target.value = ''
    }
  }
  
  const handleDeleteImage = () => {
    setEditedData({
      ...editedData,
      profileImage: ''
    })
    setImageFile(null)
    
    if (!isEditMode) {
      // If not in edit mode, apply changes immediately
      setProfileData({
        ...profileData,
        profileImage: ''
      })
      
      toast({
        title: 'Profile Picture Removed',
        description: 'Your profile picture has been removed.',
      })
    }
  }

  const handleEditToggle = () => {
    if (isEditMode) {
      // Switching from edit mode to view mode - discard changes
      setEditedData({ ...profileData })
      setIsEditMode(false)
    } else {
      // Switching from view mode to edit mode
      setEditedData({ ...profileData })
      setIsEditMode(true)
    }
  }

  const handleSaveChanges = async () => {
    setIsSubmitting(true)
    
    try {
      // In a real app, this would be an API call to update profile
      // const response = await fetch('/api/hr/profile/update', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editedData)
      // })
      
      // If there's an image file, upload it separately
      if (imageFile) {
        // In a real app, this would be an API call to upload image
        // const formData = new FormData()
        // formData.append('profileImage', imageFile)
        // await fetch('/api/hr/profile/upload-pic', {
        //   method: 'POST',
        //   body: formData
        // })
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the main profile data with the edited data
      setProfileData(editedData)
      
      // Exit edit mode
      setIsEditMode(false)
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEditedData({
      ...editedData,
      [field]: value
    })
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className={i > 3 ? 'md:col-span-2' : ''}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-[#d6ff00] dark:bg-gray-800">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">HR Profile</h2>
          <p className="text-md text-black dark:text-white mt-1">
            Welcome back, <span className="font-semibold">{isEditMode ? editedData.fullName : profileData.fullName}</span>! 
            <span className="text-sm ml-2 text-gray-600 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </p>
        </div>
        <Button
          onClick={handleEditToggle}
          variant="outline"
          className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-white border-black dark:border-gray-500"
        >
          {isEditMode ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>
      
      <div className="flex justify-center mb-8">
        <div className="flex flex-col items-center">
          <div className="relative group mb-4">
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-black dark:border-gray-400">
              {(isEditMode ? editedData.profileImage : profileData.profileImage) ? (
                <Image 
                  src={isEditMode ? editedData.profileImage : profileData.profileImage} 
                  alt={isEditMode ? editedData.fullName : profileData.fullName}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                  priority
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-2xl">
                  {(isEditMode ? editedData.fullName : profileData.fullName).substring(0, 2).toUpperCase()}
                </div>
              )}
              
              {isEditMode && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white dark:bg-gray-700">
                        <Camera className="h-5 w-5 text-black dark:text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                      <Label htmlFor="image-upload" className="cursor-pointer w-full">
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="dark:hover:bg-gray-700">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </DropdownMenuItem>
                      </Label>
                      {editedData.profileImage && (
                        <DropdownMenuItem onSelect={handleDeleteImage} className="dark:hover:bg-gray-700">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Photo
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={!isEditMode}
            />
          </div>
          
          {isEditMode && (
            <>
              {!editedData.profileImage ? (
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor="image-upload" 
                    className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-sm dark:text-white"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Photo</span>
                  </Label>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDeleteImage}
                    className="text-xs h-8 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                  <Label 
                    htmlFor="image-upload" 
                    className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-xs h-8 dark:text-white"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Change</span>
                  </Label>
                </div>
              )}
              {imageError && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{imageError}</p>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Recommended: Square image, at least 400x400px</p>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="fullName" className="text-black dark:text-white">Full Name</Label>
          {isEditMode ? (
            <Input
              id="fullName"
              value={editedData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="mt-1 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          ) : (
            <div className="mt-1 p-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 dark:text-white">
              {profileData.fullName}
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="company" className="text-black dark:text-white">Company</Label>
          {isEditMode ? (
            <Input
              id="company"
              value={editedData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="mt-1 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          ) : (
            <div className="mt-1 p-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 dark:text-white">
              {profileData.company}
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="email" className="text-black dark:text-white">Email</Label>
          {isEditMode ? (
            <Input
              id="email"
              type="email"
              value={editedData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="mt-1 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          ) : (
            <div className="mt-1 p-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 dark:text-white">
              {profileData.email}
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="role" className="text-black dark:text-white">Role</Label>
          {isEditMode ? (
            <Input
              id="role"
              value={editedData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="mt-1 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          ) : (
            <div className="mt-1 p-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 dark:text-white">
              {profileData.role}
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="about" className="text-black dark:text-white">About</Label>
          {isEditMode ? (
            <Textarea
              id="about"
              value={editedData.about}
              onChange={(e) => handleInputChange('about', e.target.value)}
              rows={4}
              className="mt-1 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          ) : (
            <div className="mt-1 p-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 min-h-[100px] whitespace-pre-wrap dark:text-white">
              {profileData.about}
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="linkedin" className="text-black dark:text-white">
            LinkedIn Profile
          </Label>
          {isEditMode ? (
            <div className="mt-1 relative">
              <Input
                id="linkedin"
                value={editedData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                className="mt-1 bg-white dark:bg-gray-700 pl-8 dark:text-white dark:border-gray-600"
                placeholder="linkedin.com/in/yourprofile"
              />
              <div className="absolute left-2 top-[calc(50%+2px)] transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <Linkedin className="h-4 w-4" />
              </div>
            </div>
          ) : (
            <div className="mt-1 p-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 flex items-center dark:text-white">
              {profileData.linkedin ? (
                <>
                  <Linkedin className="h-4 w-4 text-[#0077B5] dark:text-[#0a66c2] mr-2" />
                  <span className="flex-grow">{profileData.linkedin}</span>
                  <Link 
                    href={profileData.linkedin.startsWith('http') ? profileData.linkedin : `https://${profileData.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center ml-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">Not provided</span>
              )}
            </div>
          )}
          {!isEditMode && profileData.linkedin && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Click the link icon to open your LinkedIn profile
            </p>
          )}
        </div>
      </div>
      
      {isEditMode && (
        <div className="flex justify-end mt-8">
          <Button
            onClick={handleSaveChanges}
            disabled={isSubmitting}
            className="bg-black dark:bg-[#d6ff00] text-white dark:text-black hover:bg-gray-800 dark:hover:bg-[#c2eb00]"
          >
            {isSubmitting ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  )
}
