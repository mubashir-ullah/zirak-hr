import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SystemConfigSection() {
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Zirak HR',
    siteDescription: 'AI-powered talent acquisition platform',
    maintenanceMode: false,
    userRegistration: true,
    defaultUserRole: 'talent',
    emailNotifications: true
  });
  
  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'notifications@zirak-hr.com',
    smtpPassword: '••••••••••••',
    senderEmail: 'no-reply@zirak-hr.com',
    senderName: 'Zirak HR'
  });
  
  // API settings
  const [apiSettings, setApiSettings] = useState({
    apiKey: 'sk-••••••••••••••••••••••••••••••••••••',
    rateLimit: '100',
    enablePublicAPI: false,
    logAPIRequests: true
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordPolicy: 'strong',
    sessionTimeout: '30',
    ipRestriction: false,
    failedLoginAttempts: '5'
  });

  const handleGeneralSettingsChange = (key: string, value: any) => {
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleEmailSettingsChange = (key: string, value: any) => {
    setEmailSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleApiSettingsChange = (key: string, value: any) => {
    setApiSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSecuritySettingsChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSaveSettings = (settingType: string) => {
    // In a real app, this would make an API call to save the settings
    toast({
      title: 'Settings Saved',
      description: `${settingType} settings have been updated successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Configuration</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic system settings and defaults.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => handleGeneralSettingsChange('siteName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultUserRole">Default User Role</Label>
                  <Select 
                    value={generalSettings.defaultUserRole}
                    onValueChange={(value) => handleGeneralSettingsChange('defaultUserRole', value)}
                  >
                    <SelectTrigger id="defaultUserRole">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="talent">Talent</SelectItem>
                      <SelectItem value="hiring-manager">Hiring Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={(e) => handleGeneralSettingsChange('siteDescription', e.target.value)}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceMode" className="cursor-pointer">
                    Maintenance Mode
                    <p className="text-sm text-muted-foreground">
                      When enabled, only admins can access the site
                    </p>
                  </Label>
                  <Switch
                    id="maintenanceMode"
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => handleGeneralSettingsChange('maintenanceMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="userRegistration" className="cursor-pointer">
                    User Registration
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register
                    </p>
                  </Label>
                  <Switch
                    id="userRegistration"
                    checked={generalSettings.userRegistration}
                    onCheckedChange={(checked) => handleGeneralSettingsChange('userRegistration', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications" className="cursor-pointer">
                    Email Notifications
                    <p className="text-sm text-muted-foreground">
                      Send email notifications for system events
                    </p>
                  </Label>
                  <Switch
                    id="emailNotifications"
                    checked={generalSettings.emailNotifications}
                    onCheckedChange={(checked) => handleGeneralSettingsChange('emailNotifications', checked)}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings('General')}>
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Email Settings */}
        <TabsContent value="email" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure email server settings for notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input
                    id="smtpServer"
                    value={emailSettings.smtpServer}
                    onChange={(e) => handleEmailSettingsChange('smtpServer', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={(e) => handleEmailSettingsChange('smtpPort', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={emailSettings.smtpUsername}
                    onChange={(e) => handleEmailSettingsChange('smtpUsername', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => handleEmailSettingsChange('smtpPassword', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Sender Email</Label>
                  <Input
                    id="senderEmail"
                    value={emailSettings.senderEmail}
                    onChange={(e) => handleEmailSettingsChange('senderEmail', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input
                    id="senderName"
                    value={emailSettings.senderName}
                    onChange={(e) => handleEmailSettingsChange('senderName', e.target.value)}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings('Email')}>
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* API Settings */}
        <TabsContent value="api" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure API settings and access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={apiSettings.apiKey}
                    onChange={(e) => handleApiSettingsChange('apiKey', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rateLimit">Rate Limit (requests per minute)</Label>
                  <Input
                    id="rateLimit"
                    value={apiSettings.rateLimit}
                    onChange={(e) => handleApiSettingsChange('rateLimit', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enablePublicAPI" className="cursor-pointer">
                    Enable Public API
                    <p className="text-sm text-muted-foreground">
                      Allow access to the API from external applications
                    </p>
                  </Label>
                  <Switch
                    id="enablePublicAPI"
                    checked={apiSettings.enablePublicAPI}
                    onCheckedChange={(checked) => handleApiSettingsChange('enablePublicAPI', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="logAPIRequests" className="cursor-pointer">
                    Log API Requests
                    <p className="text-sm text-muted-foreground">
                      Keep a record of all API requests
                    </p>
                  </Label>
                  <Switch
                    id="logAPIRequests"
                    checked={apiSettings.logAPIRequests}
                    onCheckedChange={(checked) => handleApiSettingsChange('logAPIRequests', checked)}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings('API')}>
                Save API Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>
                Configure security settings and policies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordPolicy">Password Policy</Label>
                  <Select 
                    value={securitySettings.passwordPolicy}
                    onValueChange={(value) => handleSecuritySettingsChange('passwordPolicy', value)}
                  >
                    <SelectTrigger id="passwordPolicy">
                      <SelectValue placeholder="Select a policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                      <SelectItem value="medium">Medium (8+ chars, 1+ number)</SelectItem>
                      <SelectItem value="strong">Strong (8+ chars, mixed case, numbers, symbols)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecuritySettingsChange('sessionTimeout', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="failedLoginAttempts">Max Failed Login Attempts</Label>
                  <Input
                    id="failedLoginAttempts"
                    value={securitySettings.failedLoginAttempts}
                    onChange={(e) => handleSecuritySettingsChange('failedLoginAttempts', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="twoFactorAuth" className="cursor-pointer">
                    Two-Factor Authentication
                    <p className="text-sm text-muted-foreground">
                      Require two-factor authentication for all users
                    </p>
                  </Label>
                  <Switch
                    id="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSecuritySettingsChange('twoFactorAuth', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="ipRestriction" className="cursor-pointer">
                    IP Restriction
                    <p className="text-sm text-muted-foreground">
                      Restrict access to specific IP addresses
                    </p>
                  </Label>
                  <Switch
                    id="ipRestriction"
                    checked={securitySettings.ipRestriction}
                    onCheckedChange={(checked) => handleSecuritySettingsChange('ipRestriction', checked)}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings('Security')}>
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
