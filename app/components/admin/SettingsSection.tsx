import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function SettingsSection() {
  const [activeTab, setActiveTab] = useState('appearance');
  const { toast } = useToast();
  
  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'system',
    fontSize: 'medium',
    colorScheme: 'default',
    sidebarCollapsed: false
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    newUserAlerts: true,
    jobPostingAlerts: true,
    systemAlerts: true,
    marketingEmails: false
  });
  
  // Language settings
  const [languageSettings, setLanguageSettings] = useState({
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });
  
  // Danger zone
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  const handleAppearanceChange = (key: string, value: any) => {
    setAppearanceSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleNotificationChange = (key: string, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleLanguageChange = (key: string, value: any) => {
    setLanguageSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSaveSettings = (settingType: string) => {
    // In a real app, this would make an API call to save the settings
    toast({
      title: 'Settings Saved',
      description: `${settingType} settings have been updated successfully.`,
    });
  };
  
  const handleSystemReset = () => {
    // This would be a dangerous operation in a real app
    if (resetConfirmText !== 'RESET') {
      toast({
        title: 'Error',
        description: 'Please type "RESET" to confirm.',
        variant: 'destructive'
      });
      return;
    }
    
    // Simulate API call
    toast({
      title: 'System Reset Initiated',
      description: 'The system is being reset to default settings. This may take a few minutes.',
    });
    
    setIsResetConfirmOpen(false);
    setResetConfirmText('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="language">Language & Region</TabsTrigger>
        </TabsList>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the admin dashboard looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select 
                    value={appearanceSettings.theme}
                    onValueChange={(value) => handleAppearanceChange('theme', value)}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select 
                    value={appearanceSettings.fontSize}
                    onValueChange={(value) => handleAppearanceChange('fontSize', value)}
                  >
                    <SelectTrigger id="fontSize">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="colorScheme">Color Scheme</Label>
                  <Select 
                    value={appearanceSettings.colorScheme}
                    onValueChange={(value) => handleAppearanceChange('colorScheme', value)}
                  >
                    <SelectTrigger id="colorScheme">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sidebarCollapsed" className="cursor-pointer">
                  Collapsed Sidebar by Default
                  <p className="text-sm text-muted-foreground">
                    Start with a collapsed sidebar for more screen space
                  </p>
                </Label>
                <Switch
                  id="sidebarCollapsed"
                  checked={appearanceSettings.sidebarCollapsed}
                  onCheckedChange={(checked) => handleAppearanceChange('sidebarCollapsed', checked)}
                />
              </div>
              
              <Button onClick={() => handleSaveSettings('Appearance')}>
                Save Appearance Settings
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Reset system settings to default values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 flex items-start space-x-4">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-red-800 dark:text-red-400 font-medium">
                    Reset System Settings
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    This will reset all system settings to their default values. This action cannot be undone.
                  </p>
                  <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Reset to Default
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400">Reset System Settings</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. All settings will be reset to their default values.
                          Type <span className="font-bold">RESET</span> to confirm.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Input
                          value={resetConfirmText}
                          onChange={(e) => setResetConfirmText(e.target.value)}
                          placeholder="Type RESET to confirm"
                          className="border-red-300 dark:border-red-700"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResetConfirmOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleSystemReset}>
                          Reset System
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications" className="cursor-pointer">
                      Email Notifications
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </Label>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pushNotifications" className="cursor-pointer">
                      Push Notifications
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in your browser
                      </p>
                    </Label>
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="newUserAlerts" className="cursor-pointer">
                      New User Alerts
                      <p className="text-sm text-muted-foreground">
                        Get notified when new users register
                      </p>
                    </Label>
                    <Switch
                      id="newUserAlerts"
                      checked={notificationSettings.newUserAlerts}
                      onCheckedChange={(checked) => handleNotificationChange('newUserAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="jobPostingAlerts" className="cursor-pointer">
                      Job Posting Alerts
                      <p className="text-sm text-muted-foreground">
                        Get notified when new jobs are posted
                      </p>
                    </Label>
                    <Switch
                      id="jobPostingAlerts"
                      checked={notificationSettings.jobPostingAlerts}
                      onCheckedChange={(checked) => handleNotificationChange('jobPostingAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="systemAlerts" className="cursor-pointer">
                      System Alerts
                      <p className="text-sm text-muted-foreground">
                        Get notified about system events and issues
                      </p>
                    </Label>
                    <Switch
                      id="systemAlerts"
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked) => handleNotificationChange('systemAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketingEmails" className="cursor-pointer">
                      Marketing Emails
                      <p className="text-sm text-muted-foreground">
                        Receive updates about new features and promotions
                      </p>
                    </Label>
                    <Switch
                      id="marketingEmails"
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings('Notification')}>
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Language & Region Settings */}
        <TabsContent value="language" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language & Region Settings</CardTitle>
              <CardDescription>
                Configure language preferences and regional formats.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={languageSettings.language}
                    onValueChange={(value) => handleLanguageChange('language', value)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="ur">اردو</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select 
                    value={languageSettings.dateFormat}
                    onValueChange={(value) => handleLanguageChange('dateFormat', value)}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select 
                    value={languageSettings.timeFormat}
                    onValueChange={(value) => handleLanguageChange('timeFormat', value)}
                  >
                    <SelectTrigger id="timeFormat">
                      <SelectValue placeholder="Select time format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings('Language & Region')}>
                Save Language Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
