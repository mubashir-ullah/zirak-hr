'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Bell, Shield, Palette, Save } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import AccountSettings from './settings/AccountSettings'
import NotificationSettings from './settings/NotificationSettings'
import PrivacySettings from './settings/PrivacySettings'
import AppearanceSettings from './settings/AppearanceSettings'

export default function SettingsPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('account')
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    email: '',
    name: '',
    password: '',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
      jobAlerts: true,
      applicationUpdates: true,
      marketingEmails: false,
    },
    privacy: {
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowMessaging: true,
      allowProfileIndexing: true,
    },
    twoFactorEnabled: false
  })

  // Fetch user settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/talent/settings')
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings')
        }
        
        const data = await response.json()
        setSettings({
          ...data.settings,
          password: '' // Clear password field for security
        })
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSettings()
  }, [])

  // Save user settings
  const saveSettings = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/talent/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      })
      
      // Clear password field after saving
      setSettings({
        ...settings,
        password: ''
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <AccountSettings 
            settings={settings}
            setSettings={setSettings}
            saveSettings={saveSettings}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationSettings 
            settings={settings}
            setSettings={setSettings}
            saveSettings={saveSettings}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="privacy">
          <PrivacySettings 
            settings={settings}
            setSettings={setSettings}
            saveSettings={saveSettings}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="appearance">
          <AppearanceSettings 
            settings={settings}
            setSettings={setSettings}
            saveSettings={saveSettings}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={isLoading} size="lg">
          <Save className="mr-2 h-4 w-4" />
          Save All Changes
        </Button>
      </div>
    </div>
  )
}
