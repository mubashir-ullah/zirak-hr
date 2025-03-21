'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, XCircle, Clock, Trophy, 
  BarChart2, RefreshCw, CheckCircle 
} from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import confetti from 'canvas-confetti'
import { useEffect, useState } from 'react'
import VerifiedSkillBadge from './VerifiedSkillBadge';

interface TestResultsViewProps {
  results: {
    score: number
    passed: boolean
    correctAnswers: number
    totalQuestions: number
    completionTime: number
    results: {
      questionId: string
      selectedOption: number
      isCorrect: boolean
      explanation: string
      correctAnswer: number
    }[]
  }
  test: {
    _id: string
    title: string
    questions: {
      _id: string
      text: string
      options: string[]
    }[]
    skillCategory: string
  }
  onClose: () => void
  onRetake: () => void
}

export default function TestResultsView({ results, test, onClose, onRetake }: TestResultsViewProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [isAddingToResume, setIsAddingToResume] = useState(false);
  const [addedToResume, setAddedToResume] = useState(false);
  
  const isPassed = results.score >= 80;
  
  // Trigger confetti animation when passed
  useEffect(() => {
    if (isPassed) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };
      
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        // Launch confetti from both sides
        confetti({
          particleCount,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.5, 0.7) }
        });
        
        confetti({
          particleCount,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.5, 0.7) }
        });
      }, 250);
      
      // Check if the skill is already verified
      checkVerifiedStatus();
      
      return () => clearInterval(interval);
    }
  }, [isPassed]);
  
  // Check if the skill is already verified
  const checkVerifiedStatus = async () => {
    try {
      const response = await fetch('/api/talent/skills/verified');
      if (response.ok) {
        const data = await response.json();
        const isSkillVerified = data.userVerifiedSkills.includes(test.skillCategory);
        setIsVerified(isSkillVerified);
      }
    } catch (error) {
      console.error('Error checking verified status:', error);
    }
  };
  
  // Add verified skill to resume
  const addToResume = async () => {
    if (!isPassed || isAddingToResume || addedToResume) return;
    
    setIsAddingToResume(true);
    
    try {
      const response = await fetch('/api/talent/skills/verified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillId: test._id
        }),
      });
      
      if (response.ok) {
        setAddedToResume(true);
        setIsVerified(true);
      }
    } catch (error) {
      console.error('Error adding skill to resume:', error);
    } finally {
      setIsAddingToResume(false);
    }
  };
  
  // Format completion time
  const formatCompletionTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes === 0) {
      return `${remainingSeconds} seconds`
    } else if (minutes === 1) {
      return `${minutes} minute ${remainingSeconds} seconds`
    } else {
      return `${minutes} minutes ${remainingSeconds} seconds`
    }
  }
  
  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }
  
  // Get progress bar color
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">{test.title} - Results</h2>
        <div className="flex justify-center items-center">
          <Badge className={results.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {results.passed ? (
              <CheckCircle className="h-4 w-4 mr-1" />
            ) : (
              <XCircle className="h-4 w-4 mr-1" />
            )}
            {results.passed ? 'Passed' : 'Failed'}
          </Badge>
          
          {results.passed && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge className="ml-2 bg-blue-100 text-blue-800">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Skill Verified
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your {test.skillCategory} skill is now verified on your profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Score card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <BarChart2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">Score</h3>
              <div className={`text-3xl font-bold ${getScoreColor(results.score)}`}>
                {results.score}%
              </div>
              <Progress 
                value={results.score} 
                className="h-2 mt-2" 
                indicatorClassName={getProgressColor(results.score)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Correct answers card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">Correct Answers</h3>
              <div className="text-3xl font-bold">
                {results.correctAnswers}/{results.totalQuestions}
              </div>
              <Progress 
                value={(results.correctAnswers / results.totalQuestions) * 100} 
                className="h-2 mt-2"
                indicatorClassName="bg-blue-500"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Time card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">Completion Time</h3>
              <div className="text-3xl font-bold">
                {formatCompletionTime(results.completionTime)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h3 className="text-xl font-bold mb-4">Question Review</h3>
      
      <div className="flex-grow overflow-y-auto mb-6">
        <Accordion type="single" collapsible className="w-full">
          {results.results.map((result, index) => {
            const question = test.questions.find(q => q._id === result.questionId)
            if (!question) return null
            
            return (
              <AccordionItem key={result.questionId} value={`question-${index}`}>
                <AccordionTrigger className="hover:bg-muted px-4 rounded-md">
                  <div className="flex items-center">
                    {result.isCorrect ? (
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 mr-2 text-red-500" />
                    )}
                    <span>Question {index + 1}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-4">
                    <p className="font-medium">{question.text}</p>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div 
                          key={optIndex}
                          className={`p-3 rounded-md ${
                            optIndex === result.correctAnswer
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : optIndex === result.selectedOption && !result.isCorrect
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : 'bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center">
                            {optIndex === result.correctAnswer ? (
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            ) : optIndex === result.selectedOption && !result.isCorrect ? (
                              <XCircle className="h-4 w-4 mr-2 text-red-500" />
                            ) : (
                              <div className="w-4 mr-2" />
                            )}
                            <span>{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {result.explanation && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="font-medium mb-1">Explanation:</p>
                        <p>{result.explanation}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        
        {isPassed && !isVerified && !addedToResume && (
          <Button 
            onClick={addToResume}
            disabled={isAddingToResume}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <Award className="mr-2 h-4 w-4" />
            {isAddingToResume ? 'Adding...' : 'Add to Resume as Verified Skill'}
          </Button>
        )}
        
        {isPassed && (isVerified || addedToResume) && (
          <Button 
            disabled
            className="w-full sm:w-auto bg-green-600"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Skill Verified
          </Button>
        )}
        
        <Button variant="default" onClick={onRetake}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retake Test
        </Button>
      </div>
    </div>
  )
}
