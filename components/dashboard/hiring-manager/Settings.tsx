'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'

export default function HiringManagerSettings() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  
  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    email: session?.user?.email || '',
    password: '',
    confirmPassword: '',
  })
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    applicationAlerts: true,
    matchAlerts: true,
    weeklyDigest: true,
    marketingEmails: false,
  })
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    shareProfileData: true,
    allowAIAnalysis: true,
    dataRetention: '3years',
  })
  
  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'system',
    compactView: false,
  })

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAccountSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [name]: checked }))
  }

  const handlePrivacyChange = (name: string, value: boolean | string) => {
    setPrivacySettings(prev => ({ ...prev, [name]: value }))
  }

  const handleAppearanceChange = (name: string, value: string | boolean) => {
    setAppearanceSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveSettings = (section: string) => {
    setLoading(true)
    
    // Simulate API call to save settings
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Settings Saved",
        description: `Your ${section} settings have been updated successfully.`,
      })
    }, 1000)
  }

  const handlePasswordChange = () => {
    if (accountSettings.password !== accountSettings.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }
    
    if (accountSettings.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }
    
    setLoading(true)
    
    // Simulate API call to change password
    setTimeout(() => {
      setLoading(false)
      setAccountSettings(prev => ({ ...prev, password: '', confirmPassword: '' }))
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      })
    }, 1000)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      {/* Account Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <Input
              name="email"
              type="email"
              value={accountSettings.email}
              onChange={handleAccountChange}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">To change your email, please contact support.</p>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Change Password</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <Input
                  name="password"
                  type="password"
                  value={accountSettings.password}
                  onChange={handleAccountChange}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={accountSettings.confirmPassword}
                  onChange={handleAccountChange}
                  placeholder="Confirm new password"
                />
              </div>
              <Button 
                onClick={handlePasswordChange} 
                disabled={loading || !accountSettings.password || !accountSettings.confirmPassword}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Connected Accounts</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  <span>Google</span>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span>LinkedIn</span>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive all notifications via email</p>
            </div>
            <Switch 
              checked={notificationSettings.emailNotifications} 
              onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Application Alerts</h3>
              <p className="text-sm text-gray-500">Get notified when you receive new applications</p>
            </div>
            <Switch 
              checked={notificationSettings.applicationAlerts} 
              onCheckedChange={(checked) => handleNotificationChange('applicationAlerts', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Match Alerts</h3>
              <p className="text-sm text-gray-500">Get notified when AI finds new talent matches</p>
            </div>
            <Switch 
              checked={notificationSettings.matchAlerts} 
              onCheckedChange={(checked) => handleNotificationChange('matchAlerts', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Weekly Digest</h3>
              <p className="text-sm text-gray-500">Receive a weekly summary of your recruitment activity</p>
            </div>
            <Switch 
              checked={notificationSettings.weeklyDigest} 
              onCheckedChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Marketing Emails</h3>
              <p className="text-sm text-gray-500">Receive updates about new features and promotions</p>
            </div>
            <Switch 
              checked={notificationSettings.marketingEmails} 
              onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
            />
          </div>
          
          <Button 
            onClick={() => handleSaveSettings('notification')} 
            disabled={loading}
            className="mt-2"
          >
            {loading ? 'Saving...' : 'Save Notification Settings'}
          </Button>
        </div>
      </div>
      
      {/* Privacy Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Share Profile Data</h3>
              <p className="text-sm text-gray-500">Allow your organization profile to be visible to talent</p>
            </div>
            <Switch 
              checked={privacySettings.shareProfileData} 
              onCheckedChange={(checked) => handlePrivacyChange('shareProfileData', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">AI Analysis</h3>
              <p className="text-sm text-gray-500">Allow AI to analyze your recruitment data for insights</p>
            </div>
            <Switch 
              checked={privacySettings.allowAIAnalysis} 
              onCheckedChange={(checked) => handlePrivacyChange('allowAIAnalysis', checked)}
            />
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Data Retention</h3>
            <p className="text-sm text-gray-500 mb-2">Choose how long we keep your recruitment data</p>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={privacySettings.dataRetention}
              onChange={(e) => handlePrivacyChange('dataRetention', e.target.value)}
            >
              <option value="1year">1 Year</option>
              <option value="3years">3 Years</option>
              <option value="5years">5 Years</option>
              <option value="forever">Forever</option>
            </select>
          </div>
          
          <Button 
            onClick={() => handleSaveSettings('privacy')} 
            disabled={loading}
            className="mt-2"
          >
            {loading ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        </div>
      </div>
      
      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Theme</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                className={`p-3 border rounded-md flex flex-col items-center ${
                  appearanceSettings.theme === 'light' ? 'border-[#d6ff00] bg-[#d6ff00]/10' : ''
                }`}
                onClick={() => handleAppearanceChange('theme', 'light')}
              >
                <svg className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-sm">Light</span>
              </button>
              <button
                className={`p-3 border rounded-md flex flex-col items-center ${
                  appearanceSettings.theme === 'dark' ? 'border-[#d6ff00] bg-[#d6ff00]/10' : ''
                }`}
                onClick={() => handleAppearanceChange('theme', 'dark')}
              >
                <svg className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="text-sm">Dark</span>
              </button>
              <button
                className={`p-3 border rounded-md flex flex-col items-center ${
                  appearanceSettings.theme === 'system' ? 'border-[#d6ff00] bg-[#d6ff00]/10' : ''
                }`}
                onClick={() => handleAppearanceChange('theme', 'system')}
              >
                <svg className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">System</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Compact View</h3>
              <p className="text-sm text-gray-500">Use a more compact layout to show more information</p>
            </div>
            <Switch 
              checked={appearanceSettings.compactView} 
              onCheckedChange={(checked) => handleAppearanceChange('compactView', checked)}
            />
          </div>
          
          <Button 
            onClick={() => handleSaveSettings('appearance')} 
            disabled={loading}
            className="mt-2"
          >
            {loading ? 'Saving...' : 'Save Appearance Settings'}
          </Button>
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Delete Account</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
