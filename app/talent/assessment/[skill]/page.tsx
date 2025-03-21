'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FaSpinner, FaCheck, FaTimes, FaClock, FaChartBar, FaExclamationTriangle, FaArrowLeft, FaArrowRight } from 'react-icons/fa'

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  type: 'multiple_choice' | 'coding' | 'open_ended';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  points: number;
  correctOptionId?: string;
}

interface Assessment {
  _id: string;
  skillId: string;
  skillName: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  passingScore: number;
  questions: Question[];
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  score?: number;
  passed?: boolean;
  feedback?: string;
  assessmentType: 'quiz' | 'coding_challenge' | 'project' | 'interview';
}

export default function SkillAssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const skillName = params?.skill ? decodeURIComponent(params.skill as string) : ''
  
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [assessmentStarted, setAssessmentStarted] = useState(false)
  const [assessmentCompleted, setAssessmentCompleted] = useState(false)
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    feedback: string;
  } | null>(null)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  
  // Fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`/api/talent/skills/assessment?skill=${encodeURIComponent(skillName)}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch assessment')
        }
        
        const data = await response.json()
        
        if (data.assessment) {
          setAssessment(data.assessment)
          setTimeRemaining(data.assessment.timeLimit * 60) // Convert minutes to seconds
          
          // If assessment is already in progress, start it automatically
          if (data.assessment.status === 'in_progress') {
            setAssessmentStarted(true)
          }
        } else {
          throw new Error('No assessment available for this skill')
        }
      } catch (err) {
        console.error('Error fetching assessment:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    if (skillName) {
      fetchAssessment()
    }
  }, [skillName])
  
  // Timer countdown
  useEffect(() => {
    if (!assessmentStarted || assessmentCompleted || timeRemaining <= 0) return
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitAssessment()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [assessmentStarted, assessmentCompleted, timeRemaining])
  
  // Update progress percentage
  useEffect(() => {
    if (!assessment || !assessmentStarted) return
    
    const answeredQuestions = Object.keys(selectedOptions).length
    const totalQuestions = assessment.questions.length
    const percentage = Math.round((answeredQuestions / totalQuestions) * 100)
    
    setProgressPercentage(percentage)
  }, [selectedOptions, assessment, assessmentStarted])
  
  // Format time remaining
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  // Start assessment
  const handleStartAssessment = async () => {
    if (!assessment) return
    
    try {
      // Call API to start assessment
      const response = await fetch(`/api/talent/skills/assessment/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assessmentId: assessment._id
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to start assessment')
      }
      
      setAssessmentStarted(true)
    } catch (err) {
      console.error('Error starting assessment:', err)
      // Start assessment anyway to provide a fallback
      setAssessmentStarted(true)
    }
  }
  
  // Handle option selection
  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [questionId]: optionId
    }))
  }
  
  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < (assessment?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }
  
  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }
  
  // Submit assessment
  const handleSubmitAssessment = async () => {
    if (!assessment) return
    
    try {
      setSubmitting(true)
      const timeSpent = (assessment.timeLimit * 60) - timeRemaining
      
      const response = await fetch('/api/talent/skills/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assessmentId: assessment._id,
          answers: Object.entries(selectedOptions).map(([questionId, optionId]) => ({
            questionId,
            optionId
          })),
          timeSpent
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit assessment')
      }
      
      const data = await response.json()
      
      setAssessmentCompleted(true)
      setResult({
        score: data.result.score,
        passed: data.result.passed,
        feedback: data.result.feedback
      })
      
    } catch (err) {
      console.error('Error submitting assessment:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit assessment')
    } finally {
      setSubmitting(false)
    }
  }
  
  // Return to profile
  const handleReturnToProfile = () => {
    router.push('/talent/profile')
  }
  
  // Get difficulty label with color
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Beginner</span>
      case 'intermediate':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Intermediate</span>
      case 'advanced':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Advanced</span>
      case 'expert':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Expert</span>
      default:
        return null
    }
  }
  
  // Get points display
  const getPointsDisplay = (points: number) => {
    return <span className="text-gray-500 text-xs">{points} {points === 1 ? 'point' : 'points'}</span>
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded max-w-md w-full mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button
          onClick={handleReturnToProfile}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Return to Profile
        </button>
      </div>
    )
  }
  
  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded max-w-md w-full mb-4">
          <p className="font-bold">No Assessment Available</p>
          <p>There is no assessment available for this skill at the moment.</p>
        </div>
        <button
          onClick={handleReturnToProfile}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Return to Profile
        </button>
      </div>
    )
  }
  
  if (assessmentCompleted && result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6">
          <h1 className="text-2xl font-bold mb-4">{assessment.title}</h1>
          
          <div className={`p-4 rounded-lg mb-6 ${
            result.passed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Your Score</h2>
              <span className={`text-lg font-bold ${
                result.passed ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {result.score}%
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="font-medium mr-2">Result:</span>
              {result.passed ? (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center">
                  <FaCheck className="mr-1" size={12} />
                  Passed
                </span>
              ) : (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm flex items-center">
                  <FaTimes className="mr-1" size={12} />
                  Not Passed
                </span>
              )}
            </div>
            
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  result.passed ? 'bg-green-600' : result.score > 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.score}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>0%</span>
              <span>{assessment.passingScore}% (Passing)</span>
              <span>100%</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Feedback</h3>
            <p className="text-gray-700">{result.feedback}</p>
          </div>
          
          {result.passed ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-green-800 flex items-center mb-2">
                <FaCheck className="mr-2" />
                Skill Verified
              </h3>
              <p className="text-green-800">
                Congratulations! Your skill in <strong>{assessment.skillName}</strong> has been verified.
                This verification will be displayed on your profile, increasing your visibility to potential employers.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-yellow-800 flex items-center mb-2">
                <FaExclamationTriangle className="mr-2" />
                Try Again Later
              </h3>
              <p className="text-yellow-800">
                You can retake this assessment in 7 days. In the meantime, you might want to
                improve your knowledge in <strong>{assessment.skillName}</strong>.
              </p>
            </div>
          )}
          
          <button
            onClick={handleReturnToProfile}
            className="bg-black text-white px-4 py-2 rounded-lg w-full hover:bg-gray-800 transition-colors"
          >
            Return to Profile
          </button>
        </div>
      </div>
    )
  }
  
  if (!assessmentStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6">
          <h1 className="text-2xl font-bold mb-4">{assessment.title}</h1>
          
          <div className="mb-6">
            <h2 className="font-semibold mb-2">Assessment Details</h2>
            <p className="text-gray-700 mb-4">{assessment.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Time Limit</p>
                <p className="font-medium">{assessment.timeLimit} minutes</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Questions</p>
                <p className="font-medium">{assessment.questions.length}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Passing Score</p>
                <p className="font-medium">{assessment.passingScore}%</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Skill</p>
                <p className="font-medium">{assessment.skillName}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-500">Difficulty Distribution</p>
              <div className="flex mt-2">
                {['beginner', 'intermediate', 'advanced', 'expert'].map(level => {
                  const count = assessment.questions.filter(q => q.difficulty === level).length;
                  if (count === 0) return null;
                  
                  const percentage = Math.round((count / assessment.questions.length) * 100);
                  
                  const colors = {
                    beginner: 'bg-green-500',
                    intermediate: 'bg-blue-500',
                    advanced: 'bg-purple-500',
                    expert: 'bg-red-500'
                  };
                  
                  return (
                    <div 
                      key={level}
                      className={`h-2 ${colors[level as keyof typeof colors]}`}
                      style={{ width: `${percentage}%` }}
                      title={`${level}: ${count} questions (${percentage}%)`}
                    ></div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
                <span>Expert</span>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-blue-800 mb-2">Instructions</h3>
            <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
              <li>You have {assessment.timeLimit} minutes to complete the assessment</li>
              <li>You can navigate between questions</li>
              <li>Your answers are saved as you progress</li>
              <li>Submit before the time runs out</li>
              <li>You need {assessment.passingScore}% to pass and verify your skill</li>
              <li>Questions have different point values based on difficulty</li>
            </ul>
          </div>
          
          <button
            onClick={handleStartAssessment}
            className="bg-black text-white px-4 py-2 rounded-lg w-full hover:bg-gray-800 transition-colors"
          >
            Start Assessment
          </button>
        </div>
      </div>
    )
  }
  
  const currentQuestion = assessment.questions[currentQuestionIndex]
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">{assessment.skillName} Assessment</h1>
          
          <div className="flex items-center">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
              timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <FaClock className="mr-2" />
              {formatTimeRemaining()}
            </div>
            
            <div className="ml-4 text-sm">
              Question {currentQuestionIndex + 1} of {assessment.questions.length}
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              {getDifficultyLabel(currentQuestion.difficulty)}
              <span className="ml-2">{getPointsDisplay(currentQuestion.points)}</span>
            </div>
            <div className="text-sm text-gray-500">
              {selectedOptions[currentQuestion.id] ? 'Answered' : 'Not answered'}
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">{currentQuestion.text}</h2>
            
            <div className="space-y-3">
              {currentQuestion.options.map(option => (
                <div 
                  key={option.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedOptions[currentQuestion.id] === option.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                      selectedOptions[currentQuestion.id] === option.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedOptions[currentQuestion.id] === option.id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span>{option.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded-lg flex items-center ${
                currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FaArrowLeft className="mr-2" />
              Previous
            </button>
            
            {currentQuestionIndex === assessment.questions.length - 1 ? (
              <button
                onClick={handleSubmitAssessment}
                disabled={submitting}
                className={`px-4 py-2 rounded-lg bg-black text-white flex items-center ${
                  submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'
                }`}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Assessment'
                )}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center hover:bg-blue-700"
              >
                Next
                <FaArrowRight className="ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Question navigation */}
      <div className="bg-white border-t p-4 sticky bottom-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {assessment.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : selectedOptions[q.id]
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
