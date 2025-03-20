'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Bell, Shield, Globe, Moon, Sun, 
  Lock, Mail, Smartphone, Save
} from 'lucide-react'

interface SettingsSectionProps {
  isLoading: boolean
}

export default function SettingsSection({ isLoading }: SettingsSectionProps) {
  const { toast } = useToast()
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    messageNotifications: true,
    marketingEmails: false
  })
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'all',
    activityTracking: true,
    dataSharing: false
  })
  
  const [accountSettings, setAccountSettings] = useState({
    email: 'ahmed.khan@techinnovations.com',
    phone: '+92 300 1234567',
    password: '••••••••••',
    twoFactorAuth: false
  })
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'system',
    language: 'en',
    compactView: false
  })
  
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = async () => {
    setIsSaving(true)
    
    try {
      // In a real app, this would be API calls to update settings
      // await fetch('/api/settings/notifications', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notificationSettings)
      // })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been updated successfully.',
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-10 w-full mb-6" />
        <div className="space-y-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-2">
                {Array(3).fill(0).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-6 w-10" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Settings</h2>
            <p className="text-muted-foreground">Manage your account preferences</p>
          </div>
          <Button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-[#d6ff00] text-black hover:bg-[#c2eb00]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        
        <Tabs defaultValue="notifications">
          <TabsList className="mb-6">
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="account">
              <Lock className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Globe className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for important updates
                      </p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, emailNotifications: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="application-updates" className="font-medium">
                        Application Updates
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when candidates apply to your jobs
                      </p>
                    </div>
                    <Switch 
                      id="application-updates" 
                      checked={notificationSettings.applicationUpdates}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, applicationUpdates: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="message-notifications" className="font-medium">
                        Message Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new messages
                      </p>
                    </div>
                    <Switch 
                      id="message-notifications" 
                      checked={notificationSettings.messageNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, messageNotifications: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing-emails" className="font-medium">
                        Marketing Emails
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive marketing emails and newsletters
                      </p>
                    </div>
                    <Switch 
                      id="marketing-emails" 
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, marketingEmails: checked})
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profile-visibility" className="font-medium">
                      Profile Visibility
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Control who can see your profile
                    </p>
                    <Select 
                      value={privacySettings.profileVisibility} 
                      onValueChange={(value) => 
                        setPrivacySettings({...privacySettings, profileVisibility: value})
                      }
                    >
                      <SelectTrigger id="profile-visibility" className="w-full md:w-[250px]">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Everyone</SelectItem>
                        <SelectItem value="connections">Connections Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="activity-tracking" className="font-medium">
                        Activity Tracking
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow us to track your activity for better recommendations
                      </p>
                    </div>
                    <Switch 
                      id="activity-tracking" 
                      checked={privacySettings.activityTracking}
                      onCheckedChange={(checked) => 
                        setPrivacySettings({...privacySettings, activityTracking: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-sharing" className="font-medium">
                        Data Sharing
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Share your data with trusted partners
                      </p>
                    </div>
                    <Switch 
                      id="data-sharing" 
                      checked={privacySettings.dataSharing}
                      onCheckedChange={(checked) => 
                        setPrivacySettings({...privacySettings, dataSharing: checked})
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="account">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="account-email" className="font-medium">
                      Email Address
                    </Label>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input 
                        id="account-email" 
                        value={accountSettings.email}
                        onChange={(e) => 
                          setAccountSettings({...accountSettings, email: e.target.value})
                        }
                        className="max-w-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="account-phone" className="font-medium">
                      Phone Number
                    </Label>
                    <div className="flex items-center mt-1">
                      <Smartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input 
                        id="account-phone" 
                        value={accountSettings.phone}
                        onChange={(e) => 
                          setAccountSettings({...accountSettings, phone: e.target.value})
                        }
                        className="max-w-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="account-password" className="font-medium">
                      Password
                    </Label>
                    <div className="flex items-center mt-1">
                      <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input 
                        id="account-password" 
                        type="password"
                        value={accountSettings.password}
                        onChange={(e) => 
                          setAccountSettings({...accountSettings, password: e.target.value})
                        }
                        className="max-w-md"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between max-w-md">
                    <div>
                      <Label htmlFor="two-factor-auth" className="font-medium">
                        Two-Factor Authentication
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch 
                      id="two-factor-auth" 
                      checked={accountSettings.twoFactorAuth}
                      onCheckedChange={(checked) => 
                        setAccountSettings({...accountSettings, twoFactorAuth: checked})
                      }
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
                <Button variant="destructive">
                  Delete Account
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Appearance Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="theme-select" className="font-medium">
                      Theme
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Choose your preferred theme
                    </p>
                    <div className="flex space-x-4 mt-1">
                      <div 
                        className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer ${
                          appearanceSettings.theme === 'light' ? 'border-[#d6ff00] bg-[#d6ff0020]' : 'border-border'
                        }`}
                        onClick={() => setAppearanceSettings({...appearanceSettings, theme: 'light'})}
                      >
                        <Sun className="h-8 w-8 mb-2" />
                        <span>Light</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer ${
                          appearanceSettings.theme === 'dark' ? 'border-[#d6ff00] bg-[#d6ff0020]' : 'border-border'
                        }`}
                        onClick={() => setAppearanceSettings({...appearanceSettings, theme: 'dark'})}
                      >
                        <Moon className="h-8 w-8 mb-2" />
                        <span>Dark</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer ${
                          appearanceSettings.theme === 'system' ? 'border-[#d6ff00] bg-[#d6ff0020]' : 'border-border'
                        }`}
                        onClick={() => setAppearanceSettings({...appearanceSettings, theme: 'system'})}
                      >
                        <div className="flex h-8 w-8 mb-2">
                          <Sun className="h-8 w-4" />
                          <Moon className="h-8 w-4" />
                        </div>
                        <span>System</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="language-select" className="font-medium">
                      Language
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Select your preferred language
                    </p>
                    <Select 
                      value={appearanceSettings.language} 
                      onValueChange={(value) => 
                        setAppearanceSettings({...appearanceSettings, language: value})
                      }
                    >
                      <SelectTrigger id="language-select" className="w-full md:w-[250px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="ur">اردو</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between max-w-md">
                    <div>
                      <Label htmlFor="compact-view" className="font-medium">
                        Compact View
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Use a more compact layout to fit more content on screen
                      </p>
                    </div>
                    <Switch 
                      id="compact-view" 
                      checked={appearanceSettings.compactView}
                      onCheckedChange={(checked) => 
                        setAppearanceSettings({...appearanceSettings, compactView: checked})
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
