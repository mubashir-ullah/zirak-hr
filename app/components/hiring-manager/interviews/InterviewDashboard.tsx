'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ClipboardCheckIcon, MessageSquareIcon, UsersIcon } from 'lucide-react';

import InterviewCalendar from './InterviewCalendar';
import InterviewQuestions from './InterviewQuestions';
import InterviewFeedback from './InterviewFeedback';

export default function InterviewDashboard() {
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Interview Management</h2>
        <p className="text-muted-foreground">
          Schedule interviews, manage interview questions, and review feedback.
        </p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calendar">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="questions">
            <ClipboardCheckIcon className="mr-2 h-4 w-4" />
            Questions & Templates
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquareIcon className="mr-2 h-4 w-4" />
            Feedback
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <InterviewCalendar />
        </TabsContent>
        
        <TabsContent value="questions" className="space-y-4">
          <InterviewQuestions />
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-4">
          <InterviewFeedback />
        </TabsContent>
      </Tabs>
    </div>
  );
}
