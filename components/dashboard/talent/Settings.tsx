'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'

export default function TalentSettings() {
  const [loading, setLoading] = useState(false)
  
  // Account settings
  const [account, setAccount] = useState({
    email: 'alex.johnson@example.com',
    password: '••••••••••••',
    twoFactorEnabled: false
  })
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: {
      newMatches: true,
      applicationUpdates: true,
      messages: true,
      profileViews: true,
      newsletters: false
    },
    pushNotifications: {
      newMatches: true,
      applicationUpdates: true,
      messages: true,
      profileViews: false,
      newsletters: false
    }
  })
  
  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showCurrentEmployer: true,
    showContactInfo: false,
    allowRecruitersToContact: true,
    allowCompanyToSeeApplication: true
  })
  
  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'system',
    fontSize: 'medium',
    reduceAnimations: false
  })
  
  // Handle account form submission
  const handleUpdateEmail = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Email Updated",
        description: "Your email has been updated successfully.",
      })
    }, 1000)
  }
  
  const handleUpdatePassword = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      })
      
      // Reset password fields
      document.getElementById('currentPassword').value = ''
      document.getElementById('newPassword').value = ''
      document.getElementById('confirmPassword').value = ''
    }, 1000)
  }
  
  // Handle notification toggle
  const handleNotificationToggle = (category, type) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type]
      }
    }))
    
    toast({
      title: "Notification Settings Updated",
      description: `${type} notifications have been ${notifications[category][type] ? 'disabled' : 'enabled'}.`,
    })
  }
  
  // Handle privacy settings change
  const handlePrivacyChange = (setting, value) => {
    setPrivacy(prev => ({
      ...prev,
      [setting]: value
    }))
    
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy settings have been updated successfully.",
    })
  }
  
  // Handle appearance settings change
  const handleAppearanceChange = (setting, value) => {
    setAppearance(prev => ({
      ...prev,
      [setting]: value
    }))
    
    toast({
      title: "Appearance Settings Updated",
      description: "Your appearance settings have been updated successfully.",
    })
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Email Address</h2>
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Email</label>
                  <Input
                    value={account.email}
                    onChange={(e) => setAccount(prev => ({ ...prev, email: e.target.value }))}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Email</label>
                  <Input
                    type="email"
                    placeholder="Enter new email address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter your password to confirm"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Email'}
                </Button>
              </form>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Password</h2>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Password</label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={account.twoFactorEnabled}
                  onCheckedChange={(checked) => {
                    setAccount(prev => ({ ...prev, twoFactorEnabled: checked }))
                    toast({
                      title: `Two-Factor Authentication ${checked ? 'Enabled' : 'Disabled'}`,
                      description: `Two-factor authentication has been ${checked ? 'enabled' : 'disabled'} for your account.`,
                    })
                  }}
                />
              </div>
              {!account.twoFactorEnabled && (
                <Button variant="outline" className="mt-4">
                  Set Up Two-Factor Authentication
                </Button>
              )}
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">Danger Zone</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Deactivate Account</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Temporarily disable your account
                  </p>
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                    Deactivate Account
                  </Button>
                </div>
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Permanently delete your account and all data
                  </p>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Email Notifications</h2>
              <div className="space-y-4">
                {Object.entries(notifications.emailAlerts).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getNotificationDescription(key)}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={() => handleNotificationToggle('emailAlerts', key)}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Push Notifications</h2>
              <div className="space-y-4">
                {Object.entries(notifications.pushNotifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getNotificationDescription(key)}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={() => handleNotificationToggle('pushNotifications', key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Privacy Settings */}
        <TabsContent value="privacy">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Profile Visibility</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Who can see your profile</label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="public">Public - Anyone can see your profile</option>
                    <option value="recruiters">Recruiters Only - Only recruiters can see your profile</option>
                    <option value="private">Private - Your profile is hidden from search</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Current Employer</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Display your current employer on your profile
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showCurrentEmployer}
                    onCheckedChange={(checked) => handlePrivacyChange('showCurrentEmployer', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Contact Information</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Display your contact information on your profile
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showContactInfo}
                    onCheckedChange={(checked) => handlePrivacyChange('showContactInfo', checked)}
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Recruiter Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Recruiters to Contact You</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recruiters can send you messages about job opportunities
                    </p>
                  </div>
                  <Switch
                    checked={privacy.allowRecruitersToContact}
                    onCheckedChange={(checked) => handlePrivacyChange('allowRecruitersToContact', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Companies to See Your Application History</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Companies can see if you've applied to their jobs before
                    </p>
                  </div>
                  <Switch
                    checked={privacy.allowCompanyToSeeApplication}
                    onCheckedChange={(checked) => handlePrivacyChange('allowCompanyToSeeApplication', checked)}
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Data & Privacy</h2>
              <div className="space-y-4">
                <Button variant="outline">Download Your Data</Button>
                <Button variant="outline">Manage Cookies</Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Theme</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['light', 'dark', 'system'].map((theme) => (
                  <div
                    key={theme}
                    className={`border rounded-lg p-4 cursor-pointer ${
                      appearance.theme === theme ? 'border-[#d6ff00] bg-gray-50 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => handleAppearanceChange('theme', theme)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium capitalize">{theme}</p>
                      {appearance.theme === theme && (
                        <div className="w-4 h-4 rounded-full bg-[#d6ff00]"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {theme === 'light'
                        ? 'Use light theme'
                        : theme === 'dark'
                        ? 'Use dark theme'
                        : 'Follow system theme'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Font Size</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['small', 'medium', 'large'].map((size) => (
                  <div
                    key={size}
                    className={`border rounded-lg p-4 cursor-pointer ${
                      appearance.fontSize === size ? 'border-[#d6ff00] bg-gray-50 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => handleAppearanceChange('fontSize', size)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium capitalize">{size}</p>
                      {appearance.fontSize === size && (
                        <div className="w-4 h-4 rounded-full bg-[#d6ff00]"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {size === 'small'
                        ? 'Smaller text size'
                        : size === 'medium'
                        ? 'Default text size'
                        : 'Larger text size'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Accessibility</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reduce Animations</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Minimize motion effects throughout the interface
                  </p>
                </div>
                <Switch
                  checked={appearance.reduceAnimations}
                  onCheckedChange={(checked) => handleAppearanceChange('reduceAnimations', checked)}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to get notification descriptions
function getNotificationDescription(type) {
  switch (type) {
    case 'newMatches':
      return 'Receive notifications when new job matches are found'
    case 'applicationUpdates':
      return 'Receive updates about your job applications'
    case 'messages':
      return 'Receive notifications for new messages'
    case 'profileViews':
      return 'Receive notifications when recruiters view your profile'
    case 'newsletters':
      return 'Receive newsletters and promotional emails'
    default:
      return ''
  }
}
