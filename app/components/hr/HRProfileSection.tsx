'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Upload, Linkedin } from 'lucide-react'

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      
      // Create a preview URL for the image
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setProfileData({
            ...profileData,
            profileImage: event.target.result.toString()
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveChanges = async () => {
    setIsSubmitting(true)
    
    try {
      // In a real app, this would be an API call to update profile
      // const response = await fetch('/api/hr/profile/update', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profileData)
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
    <Card className="p-6 bg-[#d6ff00]">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-black">HR Profile</h2>
        <Button
          onClick={handleSaveChanges}
          disabled={isSubmitting}
          className="bg-black text-white hover:bg-gray-800"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="fullName" className="text-black">Full Name</Label>
          <Input
            id="fullName"
            value={profileData.fullName}
            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
            className="mt-1 bg-white"
          />
        </div>
        
        <div>
          <Label htmlFor="company" className="text-black">Company</Label>
          <Input
            id="company"
            value={profileData.company}
            onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
            className="mt-1 bg-white"
          />
        </div>
        
        <div>
          <Label htmlFor="email" className="text-black">Email</Label>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            className="mt-1 bg-white"
          />
        </div>
        
        <div>
          <Label htmlFor="role" className="text-black">Role</Label>
          <Input
            id="role"
            value={profileData.role}
            onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
            className="mt-1 bg-white"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="about" className="text-black">About</Label>
          <Textarea
            id="about"
            value={profileData.about}
            onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
            rows={4}
            className="mt-1 bg-white"
          />
        </div>
        
        <div className="flex items-end gap-4">
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileData.profileImage} alt={profileData.fullName} />
              <AvatarFallback>{profileData.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-grow">
            <Label htmlFor="profileImage" className="text-black">Profile Picture</Label>
            <div className="mt-1">
              <Label 
                htmlFor="image-upload" 
                className="flex items-center gap-2 p-2 bg-white rounded-md cursor-pointer hover:bg-gray-100"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Image</span>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="linkedin" className="text-black flex items-center gap-2">
            <Linkedin className="h-4 w-4" />
            LinkedIn Profile
          </Label>
          <Input
            id="linkedin"
            value={profileData.linkedin}
            onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
            className="mt-1 bg-white"
            placeholder="linkedin.com/in/yourprofile"
          />
        </div>
      </div>
    </Card>
  )
}
