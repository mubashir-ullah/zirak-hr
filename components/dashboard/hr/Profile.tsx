'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Camera, Upload, Building, User, Briefcase, Phone, Mail, Globe, Linkedin, Twitter, Edit, Trash2, X, Save, Building2, Users, Calendar, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function HRProfile() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('personal')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const companyLogoInputRef = useRef<HTMLInputElement>(null)
  
  // Personal profile state
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    position: '',
    phone: '',
    bio: '',
    website: '',
    linkedin: '',
    twitter: '',
    profilePicture: ''
  })
  
  // Company information state
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    industry: '',
    size: '',
    founded: '',
    description: '',
    website: '',
    location: '',
    logoUrl: ''
  })
  
  // Industry options
  const industries = [
    'Technology', 
    'Healthcare', 
    'Finance', 
    'Education', 
    'Manufacturing', 
    'Retail', 
    'Media',
    'Hospitality',
    'Construction',
    'Transportation',
    'Energy',
    'Agriculture',
    'Other'
  ]
  
  // Company size options
  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1001-5000 employees',
    '5001+ employees'
  ]
  
  // Fetch user profile and company data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.email) return
      
      setIsLoading(true)
      try {
        // Fetch user profile
        const userResponse = await fetch('/api/user/profile')
        const userData = await userResponse.json()
        
        if (userData.success) {
          // Populate personal info
          setPersonalInfo({
            name: userData.userProfile?.name || session?.user?.name || '',
            email: userData.userProfile?.email || session?.user?.email || '',
            position: userData.userProfile?.position || '',
            phone: userData.userProfile?.phone || '',
            bio: userData.userProfile?.bio || '',
            website: userData.userProfile?.website || '',
            linkedin: userData.userProfile?.linkedin || '',
            twitter: userData.userProfile?.twitter || '',
            profilePicture: userData.userProfile?.profilePicture || ''
          })
        }
        
        // Fetch company profile
        const companyResponse = await fetch('/api/company/profile')
        const companyData = await companyResponse.json()
        
        if (companyData.success) {
          // Populate company info
          setCompanyInfo({
            companyName: companyData.company?.companyName || '',
            industry: companyData.company?.industry || '',
            size: companyData.company?.size || '',
            founded: companyData.company?.founded || '',
            description: companyData.company?.description || '',
            website: companyData.company?.website || '',
            location: companyData.company?.location || '',
            logoUrl: companyData.company?.logoUrl || ''
          })
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load profile data. Please try again.',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProfileData()
  }, [session])
  
  // Handle personal info form changes
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPersonalInfo(prev => ({ ...prev, [name]: value }))
  }
  
  // Handle company info form changes
  const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCompanyInfo(prev => ({ ...prev, [name]: value }))
  }
  
  // Handle select changes for company info
  const handleSelectChange = (name: string, value: string) => {
    setCompanyInfo(prev => ({ ...prev, [name]: value }))
  }
  
  // Save personal profile
  const savePersonalProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personalInfo),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Personal profile updated successfully',
        })
      } else {
        throw new Error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  // Save company information
  const saveCompanyInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/company/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyInfo),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Company information updated successfully',
        })
      } else {
        throw new Error(data.error || 'Failed to update company information')
      }
    } catch (error) {
      console.error('Error saving company info:', error)
      toast({
        title: 'Error',
        description: 'Failed to update company information. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  // Image upload section with improved responsive design and explicit upload button
  const ProfileImageUpload = () => {
    const [showEditOptions, setShowEditOptions] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setShowEditOptions(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
    
    return (
      <div className="flex flex-col items-center w-full">
        <div className="relative group w-full max-w-[160px]">
          <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-4 border-[#d6ff00] shadow-lg mb-4">
            {personalInfo.profilePicture ? (
              <Image 
                src={personalInfo.profilePicture} 
                alt="Profile" 
                width={160} 
                height={160} 
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User size={48} className="text-gray-400" />
              </div>
            )}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
              onClick={() => setShowEditOptions(!showEditOptions)}
            >
              <Edit size={28} className="text-white mb-1" />
              <span className="text-white text-xs font-medium">Edit</span>
            </div>
          </div>
          
          {/* Edit Options Dropdown */}
          {showEditOptions && (
            <div 
              ref={dropdownRef}
              className="absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 left-1/2 transform -translate-x-1/2"
            >
              <button
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  document.getElementById('profileImageInput')?.click();
                  setShowEditOptions(false);
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                {personalInfo.profilePicture ? 'Change Photo' : 'Upload Photo'}
              </button>
              {personalInfo.profilePicture && (
                <button
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    handleDeleteProfilePicture();
                    setShowEditOptions(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Photo
                </button>
              )}
              <button
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowEditOptions(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
          
          <input
            type="file"
            id="profileImageInput"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePictureUpload}
          />
          
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
            Click the image to edit your profile picture
          </p>
          
          {/* Explicit Upload Button */}
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2 w-full dark:text-[#d6ff00] dark:border-[#d6ff00] dark:hover:bg-[#d6ff00]/10"
            onClick={() => document.getElementById('profileImageInput')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload from PC
          </Button>
          
          {isUploading && (
            <div className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center">
              <Loader2 className="animate-spin h-4 w-4 mr-1" /> 
              Processing...
            </div>
          )}
        </div>
      </div>
    );
  };

  // Company logo upload section with improved responsive design and explicit upload button
  const CompanyLogoUpload = () => {
    const [showEditOptions, setShowEditOptions] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setShowEditOptions(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
    
    return (
      <div className="flex flex-col items-center w-full">
        <div className="relative group w-full max-w-[160px]">
          <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 mx-auto rounded-lg overflow-hidden border-4 border-[#d6ff00] shadow-lg mb-4">
            {companyInfo.logoUrl ? (
              <Image 
                src={companyInfo.logoUrl} 
                alt="Company Logo" 
                width={160} 
                height={160} 
                className="w-full h-full object-contain bg-white"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Building2 size={48} className="text-gray-400" />
              </div>
            )}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
              onClick={() => setShowEditOptions(!showEditOptions)}
            >
              <Edit size={28} className="text-white mb-1" />
              <span className="text-white text-xs font-medium">Edit</span>
            </div>
          </div>
          
          {/* Edit Options Dropdown */}
          {showEditOptions && (
            <div 
              ref={dropdownRef}
              className="absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 left-1/2 transform -translate-x-1/2"
            >
              <button
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  document.getElementById('companyLogoInput')?.click();
                  setShowEditOptions(false);
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                {companyInfo.logoUrl ? 'Change Logo' : 'Upload Logo'}
              </button>
              {companyInfo.logoUrl && (
                <button
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    handleDeleteCompanyLogo();
                    setShowEditOptions(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Logo
                </button>
              )}
              <button
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowEditOptions(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
          
          <input
            type="file"
            id="companyLogoInput"
            accept="image/*"
            className="hidden"
            onChange={handleCompanyLogoUpload}
          />
          
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
            Click the image to edit your company logo
          </p>
          
          {/* Explicit Upload Button */}
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2 w-full dark:text-[#d6ff00] dark:border-[#d6ff00] dark:hover:bg-[#d6ff00]/10"
            onClick={() => document.getElementById('companyLogoInput')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload from PC
          </Button>
          
          {isUploading && (
            <div className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center">
              <Loader2 className="animate-spin h-4 w-4 mr-1" /> 
              Processing...
            </div>
          )}
        </div>
      </div>
    );
  };

  // Improve the profile picture upload handler to show better feedback
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setIsUploading(true);
      
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile');
      
      // Show toast for starting upload
      toast({
        title: 'Uploading...',
        description: 'Your profile picture is being uploaded',
      });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPersonalInfo({
          ...personalInfo,
          profilePicture: data.fileUrl,
        });
        
        toast({
          title: 'Success',
          description: 'Profile picture uploaded successfully',
        });
      } else {
        throw new Error(data.error || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload profile picture. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Improve the company logo upload handler to show better feedback
  const handleCompanyLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setIsUploading(true);
      
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'company');
      
      // Show toast for starting upload
      toast({
        title: 'Uploading...',
        description: 'Your company logo is being uploaded',
      });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCompanyInfo({
          ...companyInfo,
          logoUrl: data.fileUrl,
        });
        
        toast({
          title: 'Success',
          description: 'Company logo uploaded successfully',
        });
      } else {
        throw new Error(data.error || 'Failed to upload company logo');
      }
    } catch (error) {
      console.error('Error uploading company logo:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload company logo. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle profile picture deletion
  const handleDeleteProfilePicture = async () => {
    try {
      setIsUploading(true);
      
      const response = await fetch('/api/user/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'profile' }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPersonalInfo({
          ...personalInfo,
          profilePicture: '',
        });
        
        toast({
          title: 'Success',
          description: 'Profile picture deleted successfully',
        });
      } else {
        throw new Error(data.error || 'Failed to delete profile picture');
      }
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete profile picture. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle company logo deletion
  const handleDeleteCompanyLogo = async () => {
    try {
      setIsUploading(true);
      
      const response = await fetch('/api/user/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'company' }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCompanyInfo({
          ...companyInfo,
          logoUrl: '',
        });
        
        toast({
          title: 'Success',
          description: 'Company logo deleted successfully',
        });
      } else {
        throw new Error(data.error || 'Failed to delete company logo');
      }
    } catch (error) {
      console.error('Error deleting company logo:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete company logo. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your personal and company information
        </p>
      </div>
      
      <Tabs defaultValue="personal" className="mb-8">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="company">Company Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Image Upload */}
                <div className="flex justify-center md:justify-start md:col-span-1">
                  <ProfileImageUpload />
                </div>
                
                {/* Form Fields */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="name"
                          placeholder="John Doe"
                          className="pl-10"
                          value={personalInfo.name}
                          onChange={(e) => handlePersonalInfoChange(e)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="position"
                          placeholder="HR Manager"
                          className="pl-10"
                          value={personalInfo.position}
                          onChange={(e) => handlePersonalInfoChange(e)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="phone"
                          placeholder="+1 (555) 123-4567"
                          className="pl-10"
                          value={personalInfo.phone}
                          onChange={(e) => handlePersonalInfoChange(e)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Personal Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="website"
                          placeholder="https://yourwebsite.com"
                          className="pl-10"
                          value={personalInfo.website}
                          onChange={(e) => handlePersonalInfoChange(e)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="linkedin"
                          placeholder="https://linkedin.com/in/username"
                          className="pl-10"
                          value={personalInfo.linkedin}
                          onChange={(e) => handlePersonalInfoChange(e)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="twitter"
                          placeholder="https://twitter.com/username"
                          className="pl-10"
                          value={personalInfo.twitter}
                          onChange={(e) => handlePersonalInfoChange(e)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself"
                      className="min-h-[120px]"
                      value={personalInfo.bio}
                      onChange={(e) => handlePersonalInfoChange(e)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                variant="default" 
                onClick={savePersonalProfile}
                disabled={isSaving || isUploading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>
                Update your company information and logo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Company Logo Upload */}
                <div className="flex justify-center md:justify-start md:col-span-1">
                  <CompanyLogoUpload />
                </div>
                
                {/* Form Fields */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="companyName"
                          placeholder="Acme Inc."
                          className="pl-10"
                          value={companyInfo.companyName}
                          onChange={(e) => handleCompanyInfoChange(e)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="industry"
                          placeholder="Technology"
                          className="pl-10"
                          value={companyInfo.industry}
                          onChange={(e) => handleCompanyInfoChange(e)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="size">Company Size</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="size"
                          placeholder="50-100 employees"
                          className="pl-10"
                          value={companyInfo.size}
                          onChange={(e) => handleCompanyInfoChange(e)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="founded">Founded Year</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="founded"
                          placeholder="2010"
                          className="pl-10"
                          value={companyInfo.founded}
                          onChange={(e) => handleCompanyInfoChange(e)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite">Company Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="companyWebsite"
                          placeholder="https://company.com"
                          className="pl-10"
                          value={companyInfo.website}
                          onChange={(e) => handleCompanyInfoChange(e)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="location"
                          placeholder="New York, NY"
                          className="pl-10"
                          value={companyInfo.location}
                          onChange={(e) => handleCompanyInfoChange(e)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your company"
                      className="min-h-[120px]"
                      value={companyInfo.description}
                      onChange={(e) => handleCompanyInfoChange(e)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                variant="default" 
                onClick={saveCompanyInfo}
                disabled={isSaving || isUploading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Success Toast */}
      {toast.visible && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
          toast.type === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        } transition-opacity duration-300 flex items-center`}>
          {toast.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          <span>{toast.message}</span>
          <button 
            className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setToast({ ...toast, visible: false })}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
