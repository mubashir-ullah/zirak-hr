'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Question {
  _id: string
  text: string
  options: string[]
}

interface TestTakingViewProps {
  test: {
    _id: string
    title: string
    description: string
    questions: Question[]
    timeLimit: number
  }
  onSubmit: (answers: any[], startTime: Date, endTime: Date) => Promise<any>
}

export default function TestTakingView({ test, onSubmit }: TestTakingViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ questionId: string; selectedOption: number }[]>([])
  const [timeRemaining, setTimeRemaining] = useState(test.timeLimit * 60) // in seconds
  const [startTime] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeWarning, setTimeWarning] = useState(false)
  
  const currentQuestion = test.questions[currentQuestionIndex]
  const totalQuestions = test.questions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100
  
  // Initialize answers array
  useEffect(() => {
    const initialAnswers = test.questions.map(question => ({
      questionId: question._id,
      selectedOption: -1 // -1 means unanswered
    }))
    setAnswers(initialAnswers)
  }, [test.questions])
  
  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        
        // Show warning when less than 5 minutes remaining
        if (prev === 300) {
          setTimeWarning(true)
        }
        
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  // Format time remaining
  const formatTimeRemaining = () => {
    const hours = Math.floor(timeRemaining / 3600)
    const minutes = Math.floor((timeRemaining % 3600) / 60)
    const seconds = timeRemaining % 60
    
    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  // Handle answer selection
  const handleAnswerSelect = (optionIndex: number) => {
    const updatedAnswers = [...answers]
    updatedAnswers[currentQuestionIndex].selectedOption = optionIndex
    setAnswers(updatedAnswers)
  }
  
  // Navigate to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }
  
  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }
  
  // Navigate to specific question
  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }
  
  // Check if all questions are answered
  const allQuestionsAnswered = () => {
    return answers.every(answer => answer.selectedOption !== -1)
  }
  
  // Get count of answered questions
  const getAnsweredCount = () => {
    return answers.filter(answer => answer.selectedOption !== -1).length
  }
  
  // Handle test submission
  const handleSubmit = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    const endTime = new Date()
    
    // Filter out unanswered questions (replace with random answers if time expired)
    const finalAnswers = answers.map(answer => {
      if (answer.selectedOption === -1) {
        // If time expired, select a random answer
        if (timeRemaining <= 0) {
          return {
            ...answer,
            selectedOption: Math.floor(Math.random() * 4) // Assuming 4 options
          }
        }
        return answer
      }
      return answer
    })
    
    await onSubmit(finalAnswers, startTime, endTime)
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with progress and timer */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <Progress value={progress} className="w-32 h-2" />
        </div>
        
        <div className={`flex items-center space-x-1 ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
          <Clock className="h-4 w-4" />
          <span className="font-mono">{formatTimeRemaining()}</span>
        </div>
      </div>
      
      {/* Time warning */}
      {timeWarning && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Time is running out!</AlertTitle>
          <AlertDescription>
            You have less than 5 minutes remaining. Please finish your test soon.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Question card */}
      <Card className="flex-grow mb-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
          
          <RadioGroup
            value={answers[currentQuestionIndex]?.selectedOption.toString()}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
      
      {/* Question navigation */}
      <div className="grid grid-cols-10 gap-2 mb-4">
        {test.questions.map((_, index) => (
          <Button
            key={index}
            variant={index === currentQuestionIndex ? "default" : answers[index]?.selectedOption !== -1 ? "outline" : "ghost"}
            className={`h-8 w-8 p-0 ${answers[index]?.selectedOption !== -1 ? "border-green-500" : ""}`}
            onClick={() => goToQuestion(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
      
      <Separator className="my-4" />
      
      {/* Footer with navigation and submit */}
      <div className="flex justify-between items-center">
        <div>
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            onClick={goToNextQuestion}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className="ml-2"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm mr-4">
            {getAnsweredCount()} of {totalQuestions} answered
          </span>
          
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </Button>
        </div>
      </div>
    </div>
  )
}
