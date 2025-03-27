'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertCircleIcon, 
  UserIcon,
  CalendarIcon,
  ClockIcon,
  MessageSquareIcon,
  StarIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  FileTextIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Mock interview feedback data
const mockFeedbackData = [
  {
    id: 1,
    candidateName: 'Alex Wilson',
    candidatePosition: 'Frontend Developer',
    interviewerName: 'John Smith',
    interviewerPosition: 'Senior Developer',
    interviewType: 'Technical Interview',
    date: '2025-03-25',
    time: '10:00 AM',
    duration: 60,
    status: 'completed',
    overallRating: 4,
    recommendation: 'hire',
    strengths: [
      'Strong JavaScript fundamentals',
      'Excellent problem-solving skills',
      'Good communication and explanation of thought process',
    ],
    weaknesses: [
      'Limited experience with backend technologies',
      'Could improve knowledge of system design patterns',
    ],
    feedback: 'Alex demonstrated strong frontend skills, particularly in React and state management. He solved the coding challenges efficiently and communicated his thought process clearly. While he has limited backend experience, his willingness to learn and strong fundamentals make him a good candidate for our team.',
    criteria: [
      { name: 'Technical Knowledge', rating: 4, comments: 'Strong understanding of JavaScript and React' },
      { name: 'Problem Solving', rating: 5, comments: 'Excellent approach to solving complex problems' },
      { name: 'Communication', rating: 4, comments: 'Clear and concise communication' },
      { name: 'Cultural Fit', rating: 4, comments: 'Aligned with our team values' },
    ],
  },
  {
    id: 2,
    candidateName: 'Jessica Lee',
    candidatePosition: 'UX Designer',
    interviewerName: 'Emily Davis',
    interviewerPosition: 'UX Designer',
    interviewType: 'Portfolio Review',
    date: '2025-03-24',
    time: '2:00 PM',
    duration: 45,
    status: 'completed',
    overallRating: 5,
    recommendation: 'hire',
    strengths: [
      'Exceptional portfolio with diverse projects',
      'Strong user-centered design approach',
      'Excellent presentation skills',
    ],
    weaknesses: [
      'Limited experience with design systems',
    ],
    feedback: 'Jessica impressed with her portfolio and design process. She demonstrated a strong understanding of user-centered design principles and had thoughtful responses to all questions. Her portfolio showcased a variety of projects with clear problem statements and solutions. She would be a great addition to our design team.',
    criteria: [
      { name: 'Design Skills', rating: 5, comments: 'Exceptional portfolio with strong visual design' },
      { name: 'UX Process', rating: 5, comments: 'Thorough understanding of user-centered design' },
      { name: 'Communication', rating: 5, comments: 'Articulate and engaging presentation' },
      { name: 'Cultural Fit', rating: 4, comments: 'Aligned with our collaborative approach' },
    ],
  },
  {
    id: 3,
    candidateName: 'Ryan Taylor',
    candidatePosition: 'Backend Developer',
    interviewerName: 'Michael Brown',
    interviewerPosition: 'Tech Lead',
    interviewType: 'System Design',
    date: '2025-03-23',
    time: '11:30 AM',
    duration: 60,
    status: 'completed',
    overallRating: 3,
    recommendation: 'consider',
    strengths: [
      'Good understanding of database design',
      'Familiar with microservices architecture',
    ],
    weaknesses: [
      'Struggled with scaling considerations',
      'Limited experience with cloud infrastructure',
      'Communication could be more clear',
    ],
    feedback: 'Ryan showed good knowledge of database design and microservices concepts. However, he struggled when discussing scaling considerations and had limited experience with cloud infrastructure. His communication could also be more clear at times. He has potential but may need more experience for a senior role.',
    criteria: [
      { name: 'Technical Knowledge', rating: 3, comments: 'Good database knowledge, limited cloud experience' },
      { name: 'System Design', rating: 3, comments: 'Basic understanding but struggled with scaling' },
      { name: 'Problem Solving', rating: 3, comments: 'Methodical but sometimes missed edge cases' },
      { name: 'Communication', rating: 2, comments: 'Could be more clear and concise' },
    ],
  },
];

export default function InterviewFeedback() {
  const router = useRouter();
  const [feedbackData, setFeedbackData] = useState(mockFeedbackData);
  const [selectedFeedback, setSelectedFeedback] = useState(feedbackData[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [recommendationFilter, setRecommendationFilter] = useState('all');

  // Filter feedback based on search query and filters
  const filteredFeedback = feedbackData.filter(feedback => {
    // Filter by search query
    const matchesSearch = 
      feedback.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.candidatePosition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.interviewerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
    
    // Filter by recommendation
    const matchesRecommendation = recommendationFilter === 'all' || feedback.recommendation === recommendationFilter;
    
    return matchesSearch && matchesStatus && matchesRecommendation;
  });

  // Handle selecting feedback
  const handleSelectFeedback = (feedback) => {
    setSelectedFeedback(feedback);
  };

  // Get recommendation badge color
  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'hire':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'consider':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reject':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get recommendation icon
  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'hire':
        return <ThumbsUpIcon className="h-4 w-4 text-green-600" />;
      case 'consider':
        return <AlertCircleIcon className="h-4 w-4 text-yellow-600" />;
      case 'reject':
        return <ThumbsDownIcon className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Interview Feedback</h2>
          <p className="text-muted-foreground">
            Review and manage feedback from interviews.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader className="px-5 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Feedback List</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="h-8 w-[100px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={recommendationFilter}
                    onValueChange={setRecommendationFilter}
                  >
                    <SelectTrigger className="h-8 w-[120px]">
                      <SelectValue placeholder="Recommendation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="hire">Hire</SelectItem>
                      <SelectItem value="consider">Consider</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-2">
                <Input
                  placeholder="Search candidates or interviewers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredFeedback.length > 0 ? (
                  filteredFeedback.map((feedback) => (
                    <div
                      key={feedback.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedFeedback?.id === feedback.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleSelectFeedback(feedback)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{feedback.candidateName}</div>
                          <div className="text-sm text-muted-foreground">
                            {feedback.candidatePosition}
                          </div>
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            <span>{formatDate(feedback.date)}</span>
                            <span className="mx-1">•</span>
                            <UserIcon className="mr-1 h-3 w-3" />
                            <span>{feedback.interviewerName}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge
                            variant="outline"
                            className={getRecommendationColor(feedback.recommendation)}
                          >
                            <span className="flex items-center">
                              {getRecommendationIcon(feedback.recommendation)}
                              <span className="ml-1">
                                {feedback.recommendation.charAt(0).toUpperCase() + feedback.recommendation.slice(1)}
                              </span>
                            </span>
                          </Badge>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-3 w-3 ${
                                  i < feedback.overallRating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No feedback found matching your filters.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          {selectedFeedback ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{selectedFeedback.candidateName}</CardTitle>
                    <CardDescription>
                      {selectedFeedback.candidatePosition} • {selectedFeedback.interviewType}
                    </CardDescription>
                  </div>
                  <div className="mt-2 sm:mt-0 flex flex-col items-start sm:items-end">
                    <Badge
                      variant="outline"
                      className={getRecommendationColor(selectedFeedback.recommendation)}
                    >
                      <span className="flex items-center">
                        {getRecommendationIcon(selectedFeedback.recommendation)}
                        <span className="ml-1">
                          {selectedFeedback.recommendation.charAt(0).toUpperCase() + selectedFeedback.recommendation.slice(1)}
                        </span>
                      </span>
                    </Badge>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-muted-foreground mr-1">Overall:</span>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < selectedFeedback.overallRating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium">Interviewer</span>
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>{selectedFeedback.interviewerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span>{selectedFeedback.interviewerName}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{selectedFeedback.interviewerPosition}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium">Interview Details</span>
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(selectedFeedback.date)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <ClockIcon className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{selectedFeedback.time} ({selectedFeedback.duration} min)</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-2">Feedback Summary</h3>
                    <p className="text-sm">{selectedFeedback.feedback}</p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="font-medium mb-2">Strengths</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {selectedFeedback.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Areas for Improvement</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {selectedFeedback.weaknesses.map((weakness, index) => (
                          <li key={index}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-3">Evaluation Criteria</h3>
                    <div className="space-y-4">
                      {selectedFeedback.criteria.map((criterion, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{criterion.name}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < criterion.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <Progress value={criterion.rating * 20} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{criterion.comments}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t px-6 py-4">
                <Button variant="outline" className="mr-2">
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button>
                  <MessageSquareIcon className="mr-2 h-4 w-4" />
                  Discuss Candidate
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Feedback Selected</CardTitle>
                <CardDescription>
                  Select feedback from the list to view details.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
