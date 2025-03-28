'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

export default function HiringManagerProfile() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    organization: '',
    position: '',
    phone: '',
    bio: '',
    website: '',
    linkedin: '',
    twitter: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call to update profile
    setTimeout(() => {
      setLoading(false)
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your HR profile has been successfully updated.",
      })
    }, 1000)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">HR Profile</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Edit Profile
          </Button>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Organization</label>
                <Input
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <Input
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <Input
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn</label>
                <Input
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Twitter</label>
                <Input
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-24 h-24 rounded-full bg-[#d6ff00] flex items-center justify-center text-black text-3xl font-bold">
                {(session?.user?.name?.charAt(0) || 'H').toUpperCase()}
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
                <p className="text-gray-600 dark:text-gray-300">{formData.position || 'HR Manager'}</p>
                <p className="text-gray-600 dark:text-gray-300">{formData.organization || 'Your Organization'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                <p>{session?.user?.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h3>
                <p>{formData.phone || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</h3>
                <p>{formData.website || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">LinkedIn</h3>
                <p>{formData.linkedin || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</h3>
              <p className="mt-1">{formData.bio || 'No bio provided. Click Edit Profile to add your bio.'}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Company Information</h2>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Organization</h3>
              <p className="mt-1 font-medium">{formData.organization || 'Your Organization'}</p>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                Complete your organization profile to attract better talent matches.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recruitment Status</h3>
              <div className="mt-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <p>5 Active Job Postings</p>
                </div>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  <p>18 Applications in Progress</p>
                </div>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                  <p>3 Interviews Scheduled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
