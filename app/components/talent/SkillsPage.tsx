'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Award, CheckCircle, Clock, AlertTriangle, 
  ChevronRight, RefreshCw, BookOpen, Trophy,
  BarChart, CheckCircle2, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import TestTakingView from './skills/TestTakingView'
import TestResultsView from './skills/TestResultsView'
import VerifiedSkillBadge from './skills/VerifiedSkillBadge';

interface SkillTest {
  _id: string
  title: string
  description: string
  skillCategory: string
  timeLimit: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  questions: {
    _id: string
    text: string
    options: string[]
  }[]
}

interface CompletedTest {
  _id: string
  testId: {
    _id: string
    title: string
    skillCategory: string
    difficulty: string
  }
  score: number
  passed: boolean
  createdAt: string
}

interface VerifiedSkill {
  skill: string
  isVerified: boolean
  score?: number
  date?: string
}

export default function SkillsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('completed')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [completedTests, setCompletedTests] = useState<CompletedTest[]>([])
  const [recommendedTests, setRecommendedTests] = useState<SkillTest[]>([])
  const [availableTests, setAvailableTests] = useState<SkillTest[]>([])
  
  const [selectedTest, setSelectedTest] = useState<SkillTest | null>(null)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [isTestInProgress, setIsTestInProgress] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  
  const [verifiedSkills, setVerifiedSkills] = useState<VerifiedSkill[]>([])
  
  // Fetch tests data
  const fetchTests = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch('/api/talent/skills/tests')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch skill tests')
      }
      
      const data = await response.json()
      setCompletedTests(data.completedTests || [])
      setRecommendedTests(data.recommendedTests || [])
      setAvailableTests(data.availableTests || [])
    } catch (error) {
      console.error('Error fetching skill tests:', error)
      setError('Failed to load skill tests. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch test details
  const fetchTestDetails = async (testId: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/talent/skills/tests/${testId}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch test details')
      }
      
      const data = await response.json()
      setSelectedTest(data.test)
      
      // If user has already taken this test, show a warning
      if (data.hasPreviousAttempt) {
        toast({
          title: 'Test Already Taken',
          description: `You've already taken this test with a score of ${data.previousScore}%. Taking it again will override your previous score.`,
          variant: 'default',
        })
      }
      
      setIsTestDialogOpen(true)
    } catch (error) {
      console.error('Error fetching test details:', error)
      toast({
        title: 'Error',
        description: 'Failed to load test details. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Submit test answers
  const submitTest = async (testId: string, answers: any[], startTime: Date, endTime: Date) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/talent/skills/tests/${testId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          startTime,
          endTime
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit test')
      }
      
      const results = await response.json()
      setTestResults(results)
      setIsTestInProgress(false)
      
      // Refresh tests data to update completed tests
      fetchTests()
      
      // Fetch verified skills
      fetch('/api/talent/skills/verified')
        .then(response => response.json())
        .then(data => {
          const verifiedSkillsTemp: VerifiedSkill[] = [];
          data.userVerifiedSkills.forEach((skill: string) => {
            verifiedSkillsTemp.push({
              skill,
              isVerified: true
            });
          });
          setVerifiedSkills(verifiedSkillsTemp);
        })
        .catch(error => {
          console.error('Error fetching verified skills:', error)
        });
      
      return results
    } catch (error) {
      console.error('Error submitting test:', error)
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit your test. Please try again.',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }
  
  // Start taking a test
  const startTest = () => {
    if (selectedTest) {
      setIsTestInProgress(true)
    }
  }
  
  // Close test dialog and reset state
  const closeTestDialog = () => {
    setIsTestDialogOpen(false)
    setSelectedTest(null)
    setIsTestInProgress(false)
    setTestResults(null)
  }
  
  // Load data on initial render
  useEffect(() => {
    fetchTests()
  }, [])
  
  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }
  
  // Format time limit
  const formatTimeLimit = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m` 
      : `${hours}h`
  }
  
  // Render test card
  const renderTestCard = (test: SkillTest, isRecommended = false) => {
    return (
      <Card key={test._id} className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold">{test.title}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                {test.skillCategory}
              </CardDescription>
            </div>
            <Badge className={getDifficultyColor(test.difficulty)}>
              {test.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{test.questions.length} Questions</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{formatTimeLimit(test.timeLimit)}</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {test.description}
          </p>
          
          {isRecommended && (
            <div className="mt-3 flex items-center">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Recommended for your profile
              </Badge>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            variant="default" 
            size="sm"
            className="w-full"
            onClick={() => fetchTestDetails(test._id)}
          >
            Start Test
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  // Render completed test card
  const renderCompletedTestCard = (test: CompletedTest) => {
    return (
      <Card key={test._id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold">{test.testId.title}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                {test.testId.skillCategory}
                {test.passed && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <CheckCircle2 className="h-4 w-4 ml-2 text-blue-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Verified Skill</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardDescription>
            </div>
            <Badge className={
              test.passed 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }>
              {test.passed ? 'Passed' : 'Failed'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Score</span>
              <span className="text-sm font-bold">{test.score}%</span>
            </div>
            <Progress
              value={test.score}
              className="h-2"
              indicatorClassName={`${
                test.score > 70
                  ? 'bg-green-500'
                  : test.score > 40
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            />
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Completed on {new Date(test.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            onClick={() => fetchTestDetails(test.testId._id)}
          >
            Retake Test
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  // Render loading skeleton
  const renderSkeletonCard = (index: number) => (
    <Card key={index} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      <CardFooter className="pt-2">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  )
  
  return (
    <div className="w-full">
      <div className="bg-[#d6ff00] dark:bg-gray-800 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Skills Assessments</h1>
        <p className="text-black dark:text-gray-300">
          Showcase your skills and improve your profile visibility
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="completed">Your Completed Tests</TabsTrigger>
          <TabsTrigger value="available">Available Tests</TabsTrigger>
        </TabsList>
        
        {/* Completed Tests Tab */}
        <TabsContent value="completed" className="space-y-4">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              Array(4).fill(0).map((_, index) => renderSkeletonCard(index))
            ) : completedTests.length > 0 ? (
              completedTests.map(test => renderCompletedTestCard(test))
            ) : (
              <div className="col-span-2 text-center py-10">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No completed tests yet</h3>
                <p className="mt-2 text-muted-foreground">
                  Take skill tests to verify your abilities and stand out to recruiters.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setActiveTab('available')}
                >
                  Browse Available Tests
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Available Tests Tab */}
        <TabsContent value="available" className="space-y-4">
          {recommendedTests.length > 0 && (
            <>
              <h2 className="text-xl font-bold flex items-center">
                Recommended for You
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">These tests are recommended based on your profile and skills</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {isLoading ? (
                  Array(2).fill(0).map((_, index) => renderSkeletonCard(index))
                ) : (
                  recommendedTests.map(test => renderTestCard(test, true))
                )}
              </div>
              
              <Separator className="my-6" />
            </>
          )}
          
          <h2 className="text-xl font-bold">Available Tests</h2>
          
          {error && <div className="text-red-500 mb-4">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              Array(4).fill(0).map((_, index) => renderSkeletonCard(index))
            ) : availableTests.length > 0 ? (
              availableTests.map(test => renderTestCard(test))
            ) : (
              <div className="col-span-2 text-center py-10">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No available tests</h3>
                <p className="mt-2 text-muted-foreground">
                  Check back later for new skill tests.
                </p>
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={fetchTests}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Verified Skills */}
      {verifiedSkills.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 text-blue-500 mr-2" />
              Verified Skills
            </CardTitle>
            <CardDescription>
              These skills have been verified through skill assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {verifiedSkills.map((skill, index) => (
                <VerifiedSkillBadge
                  key={index}
                  skill={skill.skill}
                  isVerified={skill.isVerified}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Test Dialog */}
      {selectedTest && (
        <Dialog 
          open={isTestDialogOpen} 
          onOpenChange={(open) => {
            if (!open && !isTestInProgress) {
              closeTestDialog()
            } else if (!open && isTestInProgress) {
              // Confirm before closing if test is in progress
              if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
                closeTestDialog()
              } else {
                setIsTestDialogOpen(true)
              }
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {!isTestInProgress && !testResults ? (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedTest.title}</DialogTitle>
                  <DialogDescription>
                    {selectedTest.description}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 my-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Badge className={getDifficultyColor(selectedTest.difficulty)}>
                        {selectedTest.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-end">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">{formatTimeLimit(selectedTest.timeLimit)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium mb-2">Test Information</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <BookOpen className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <span>{selectedTest.questions.length} questions to complete in {formatTimeLimit(selectedTest.timeLimit)}</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <span>Passing this test will add a verified badge to your {selectedTest.skillCategory} skill</span>
                      </li>
                      <li className="flex items-start">
                        <BarChart className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <span>Your score will be visible to recruiters searching for candidates with this skill</span>
                      </li>
                      <li className="flex items-start">
                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <span>You cannot pause the test once started. Ensure you have enough time to complete it.</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={closeTestDialog}>
                    Cancel
                  </Button>
                  <Button onClick={startTest}>
                    Start Test
                  </Button>
                </DialogFooter>
              </>
            ) : isTestInProgress && !testResults ? (
              <TestTakingView 
                test={selectedTest}
                onSubmit={(answers, startTime, endTime) => submitTest(selectedTest._id, answers, startTime, endTime)}
              />
            ) : testResults && (
              <TestResultsView 
                results={testResults}
                test={selectedTest}
                onClose={closeTestDialog}
                onRetake={() => {
                  setTestResults(null)
                  setIsTestInProgress(true)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Calendar component for date display
function Calendar({ className, ...props }: React.ComponentProps<typeof Clock>) {
  return (
    <Clock className={className} {...props} />
  )
}
