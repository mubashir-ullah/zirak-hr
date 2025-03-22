'use client'

import { useState } from 'react'
import { Moon, Sun, Monitor, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from 'next-themes'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface AppearanceSettingsProps {
  settings: any;
  setSettings: (settings: any) => void;
  saveSettings: () => Promise<void>;
  isLoading: boolean;
}

export default function AppearanceSettings({ settings, setSettings, saveSettings, isLoading }: AppearanceSettingsProps) {
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState(theme || 'system')

  // Handle theme change
  const handleThemeChange = (value: string) => {
    setSelectedTheme(value)
    setTheme(value)
    // We don't need to update settings here as theme is managed by next-themes
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
        <CardDescription>
          Customize how Zirak HR looks and feels for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Theme</h3>
          <RadioGroup 
            defaultValue={selectedTheme} 
            value={selectedTheme}
            onValueChange={handleThemeChange}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem 
                value="light" 
                id="theme-light" 
                className="sr-only" 
              />
              <Label
                htmlFor="theme-light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-100 hover:border-accent [&:has([data-state=checked])]:border-primary"
              >
                <Sun className="mb-3 h-6 w-6 text-gray-900" />
                <div className="space-y-1 text-center">
                  <h3 className="font-medium text-gray-900">Light</h3>
                  <p className="text-sm text-muted-foreground">
                    Light mode for daytime use
                  </p>
                </div>
                <div className="mt-4 w-full rounded-md bg-gray-100 p-2">
                  <div className="h-2 w-3/4 rounded-lg bg-gray-800" />
                </div>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem 
                value="dark" 
                id="theme-dark" 
                className="sr-only" 
              />
              <Label
                htmlFor="theme-dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gray-950 p-4 hover:bg-gray-900 hover:border-accent [&:has([data-state=checked])]:border-primary"
              >
                <Moon className="mb-3 h-6 w-6 text-white" />
                <div className="space-y-1 text-center">
                  <h3 className="font-medium text-white">Dark</h3>
                  <p className="text-sm text-gray-400">
                    Dark mode for nighttime use
                  </p>
                </div>
                <div className="mt-4 w-full rounded-md bg-gray-800 p-2">
                  <div className="h-2 w-3/4 rounded-lg bg-gray-400" />
                </div>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem 
                value="system" 
                id="theme-system" 
                className="sr-only" 
              />
              <Label
                htmlFor="theme-system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gradient-to-r from-white to-gray-950 p-4 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-900 hover:border-accent [&:has([data-state=checked])]:border-primary"
              >
                <Monitor className="mb-3 h-6 w-6" />
                <div className="space-y-1 text-center">
                  <h3 className="font-medium">System</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow system preferences
                  </p>
                </div>
                <div className="mt-4 w-full rounded-md bg-gradient-to-r from-gray-100 to-gray-800 p-2">
                  <div className="h-2 w-3/4 rounded-lg bg-gradient-to-r from-gray-800 to-gray-400" />
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveSettings} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          Save Appearance Settings
        </Button>
      </CardFooter>
    </Card>
  )
}
