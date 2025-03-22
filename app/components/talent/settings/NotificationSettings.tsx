'use client'

import { Bell, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface NotificationSettingsProps {
  settings: any;
  setSettings: (settings: any) => void;
  saveSettings: () => Promise<void>;
  isLoading: boolean;
}

export default function NotificationSettings({ settings, setSettings, saveSettings, isLoading }: NotificationSettingsProps) {
  // Update notification settings
  const updateNotificationSetting = (key: string, value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to be notified about updates and activities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Delivery Methods</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-email" className="flex flex-col">
                <span>Email Notifications</span>
                <span className="text-sm text-muted-foreground">
                  Receive notifications via email
                </span>
              </Label>
              <Switch
                id="notify-email"
                checked={settings.notifications?.email}
                onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-push" className="flex flex-col">
                <span>Push Notifications</span>
                <span className="text-sm text-muted-foreground">
                  Receive notifications in your browser
                </span>
              </Label>
              <Switch
                id="notify-push"
                checked={settings.notifications?.push}
                onCheckedChange={(checked) => updateNotificationSetting('push', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-sms" className="flex flex-col">
                <span>SMS Notifications</span>
                <span className="text-sm text-muted-foreground">
                  Receive important notifications via SMS
                </span>
              </Label>
              <Switch
                id="notify-sms"
                checked={settings.notifications?.sms}
                onCheckedChange={(checked) => updateNotificationSetting('sms', checked)}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Types</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-jobs" className="flex flex-col">
                <span>Job Alerts</span>
                <span className="text-sm text-muted-foreground">
                  Notifications about new job matches
                </span>
              </Label>
              <Switch
                id="notify-jobs"
                checked={settings.notifications?.jobAlerts}
                onCheckedChange={(checked) => updateNotificationSetting('jobAlerts', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-applications" className="flex flex-col">
                <span>Application Updates</span>
                <span className="text-sm text-muted-foreground">
                  Status changes on your job applications
                </span>
              </Label>
              <Switch
                id="notify-applications"
                checked={settings.notifications?.applicationUpdates}
                onCheckedChange={(checked) => updateNotificationSetting('applicationUpdates', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-marketing" className="flex flex-col">
                <span>Marketing Emails</span>
                <span className="text-sm text-muted-foreground">
                  Receive promotional content and newsletters
                </span>
              </Label>
              <Switch
                id="notify-marketing"
                checked={settings.notifications?.marketingEmails}
                onCheckedChange={(checked) => updateNotificationSetting('marketingEmails', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveSettings} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          Save Notification Preferences
        </Button>
      </CardFooter>
    </Card>
  )
}
