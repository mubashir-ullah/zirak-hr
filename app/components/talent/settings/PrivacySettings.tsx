'use client'

import { Shield, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface PrivacySettingsProps {
  settings: any;
  setSettings: (settings: any) => void;
  saveSettings: () => Promise<void>;
  isLoading: boolean;
}

export default function PrivacySettings({ settings, setSettings, saveSettings, isLoading }: PrivacySettingsProps) {
  // Update privacy settings
  const updatePrivacySetting = (key: string, value: any) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control your privacy and how your information is shared.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-visibility">Profile Visibility</Label>
            <Select
              value={settings.privacy?.profileVisibility || 'public'}
              onValueChange={(value) => updatePrivacySetting('profileVisibility', value)}
            >
              <SelectTrigger id="profile-visibility">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can view your profile</SelectItem>
                <SelectItem value="connections">Connections - Only your connections can view your profile</SelectItem>
                <SelectItem value="private">Private - Only you can view your profile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="online-status" className="flex flex-col">
              <span>Show Online Status</span>
              <span className="text-sm text-muted-foreground">
                Allow others to see when you're online
              </span>
            </Label>
            <Switch
              id="online-status"
              checked={settings.privacy?.showOnlineStatus}
              onCheckedChange={(checked) => updatePrivacySetting('showOnlineStatus', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-messaging" className="flex flex-col">
              <span>Allow Messaging</span>
              <span className="text-sm text-muted-foreground">
                Let recruiters and other users message you
              </span>
            </Label>
            <Switch
              id="allow-messaging"
              checked={settings.privacy?.allowMessaging}
              onCheckedChange={(checked) => updatePrivacySetting('allowMessaging', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-indexing" className="flex flex-col">
              <span>Profile Indexing</span>
              <span className="text-sm text-muted-foreground">
                Allow search engines to index your profile
              </span>
            </Label>
            <Switch
              id="profile-indexing"
              checked={settings.privacy?.allowProfileIndexing}
              onCheckedChange={(checked) => updatePrivacySetting('allowProfileIndexing', checked)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveSettings} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          Save Privacy Settings
        </Button>
      </CardFooter>
    </Card>
  )
}
