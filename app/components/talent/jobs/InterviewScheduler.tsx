'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, Video, Users, User, Phone, MapPin, Check, X, AlertCircle, Loader2 } from 'lucide-react'
import { format, addDays, startOfDay, addHours, isBefore, isAfter, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface Interview {
  id?: string;
  date: string;
  type: string;
  interviewerName: string;
  notes: string;
  status: string;
  location?: string;
  meetingLink?: string;
  phoneNumber?: string;
}

interface InterviewSchedulerProps {
  applicationId: string;
  existingInterviews?: Interview[];
  onInterviewScheduled: () => void;
}

export default function InterviewScheduler({ applicationId, existingInterviews = [], onInterviewScheduled }: InterviewSchedulerProps) {
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [interviewType, setInterviewType] = useState<string>('video')
  const [notes, setNotes] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<boolean>(false)
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [activeTab, setActiveTab] = useState<string>('upcoming')
  const [rescheduleInterview, setRescheduleInterview] = useState<Interview | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false)
  const [interviewToCancel, setInterviewToCancel] = useState<Interview | null>(null)
  const [cancelReason, setCancelReason] = useState<string>('')
  const [isCancelling, setIsCancelling] = useState<boolean>(false)
  
  // Fetch available time slots when date changes
  useEffect(() => {
    if (date) {
      fetchAvailableTimeSlots(date);
    }
  }, [date]);
  
  // Fetch available dates for the next 14 days
  useEffect(() => {
    fetchAvailableDates();
  }, []);
  
  // Reset form when reschedule interview changes
  useEffect(() => {
    if (rescheduleInterview) {
      try {
        const interviewDate = parseISO(rescheduleInterview.date);
        setDate(interviewDate);
        setInterviewType(rescheduleInterview.type);
        setNotes(rescheduleInterview.notes);
      } catch (error) {
        console.error('Error parsing interview date:', error);
      }
    }
  }, [rescheduleInterview]);
  
  const fetchAvailableDates = async () => {
    try {
      // In a real app, this would be an API call to get available dates
      // For now, we'll simulate it with some random availability
      const dates: Date[] = [];
      const today = startOfDay(new Date());
      
      for (let i = 1; i <= 14; i++) {
        const currentDate = addDays(today, i);
        // Randomly make some dates unavailable (weekends are always unavailable)
        const day = currentDate.getDay();
        if (day !== 0 && day !== 6 && Math.random() > 0.3) {
          dates.push(currentDate);
        }
      }
      
      setAvailableDates(dates);
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  };
  
  const fetchAvailableTimeSlots = async (selectedDate: Date) => {
    try {
      setIsLoading(true);
      setError('');
      
      // In a real app, this would be an API call to get available time slots
      // For now, we'll simulate it with some random availability
      const slots: TimeSlot[] = [];
      const startHour = 9; // 9 AM
      const endHour = 17; // 5 PM
      
      for (let hour = startHour; hour < endHour; hour++) {
        const startTime = addHours(selectedDate, hour);
        const endTime = addHours(selectedDate, hour + 1);
        
        // Randomly make some slots unavailable
        const available = Math.random() > 0.3;
        
        slots.push({
          id: `slot-${hour}`,
          startTime: format(startTime, "HH:mm"),
          endTime: format(endTime, "HH:mm"),
          available
        });
      }
      
      setTimeSlots(slots);
      setSelectedTimeSlot(null);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setError('Failed to load available time slots. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScheduleInterview = async () => {
    if (!date || !selectedTimeSlot || !interviewType) {
      setError('Please select a date, time slot, and interview type.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const selectedSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);
      if (!selectedSlot) {
        throw new Error('Invalid time slot selected');
      }
      
      // Format the date and time for the API
      const interviewDate = date;
      const [hours, minutes] = selectedSlot.startTime.split(':');
      interviewDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const interviewData = {
        date: interviewDate.toISOString(),
        type: interviewType,
        notes: notes,
        status: 'scheduled',
        interviewerName: 'TBD', // This would be populated by the API
      };
      
      // In a real app, this would be an API call to schedule the interview
      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (rescheduleInterview) {
        // This would be an API call to reschedule the interview
        console.log('Rescheduling interview:', rescheduleInterview.id, interviewData);
      } else {
        // This would be an API call to schedule a new interview
        console.log('Scheduling new interview:', applicationId, interviewData);
      }
      
      setSuccess(true);
      setShowConfirmation(true);
      
      // Reset form
      setDate(addDays(new Date(), 1));
      setSelectedTimeSlot(null);
      setInterviewType('video');
      setNotes('');
      setRescheduleInterview(null);
      
      // Notify parent component
      onInterviewScheduled();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setError('Failed to schedule interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelInterview = async () => {
    if (!interviewToCancel) return;
    
    try {
      setIsCancelling(true);
      
      // In a real app, this would be an API call to cancel the interview
      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Cancelling interview:', interviewToCancel.id, cancelReason);
      
      setCancelDialogOpen(false);
      setInterviewToCancel(null);
      setCancelReason('');
      
      // Notify parent component
      onInterviewScheduled();
    } catch (error) {
      console.error('Error cancelling interview:', error);
    } finally {
      setIsCancelling(false);
    }
  };
  
  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'in-person':
        return <Users className="h-4 w-4" />;
      case 'one-on-one':
        return <User className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };
  
  const getInterviewStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">Cancelled</Badge>;
      case 'rescheduled':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">Rescheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const renderScheduler = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="date" className="block text-sm font-medium mb-2">Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => {
                    // Disable dates before today
                    const today = startOfDay(new Date());
                    if (isBefore(date, today)) return true;
                    
                    // Disable dates that are not in the available dates list
                    return !availableDates.some(availableDate => 
                      availableDate.getDate() === date.getDate() && 
                      availableDate.getMonth() === date.getMonth() && 
                      availableDate.getFullYear() === date.getFullYear()
                    );
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-1">
              Only dates with available slots are selectable
            </p>
          </div>
          
          <div>
            <Label htmlFor="time" className="block text-sm font-medium mb-2">Select Time Slot</Label>
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                    className={cn(
                      "justify-center",
                      !slot.available && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!slot.available}
                    onClick={() => setSelectedTimeSlot(slot.id)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {slot.startTime} - {slot.endTime}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No time slots available for the selected date.
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="type" className="block text-sm font-medium mb-2">Interview Type</Label>
            <RadioGroup value={interviewType} onValueChange={setInterviewType} className="grid grid-cols-1 gap-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video" className="flex items-center cursor-pointer">
                  <Video className="mr-2 h-4 w-4" />
                  Video Interview
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone" />
                <Label htmlFor="phone" className="flex items-center cursor-pointer">
                  <Phone className="mr-2 h-4 w-4" />
                  Phone Interview
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-person" id="in-person" />
                <Label htmlFor="in-person" className="flex items-center cursor-pointer">
                  <MapPin className="mr-2 h-4 w-4" />
                  In-Person Interview
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one-on-one" id="one-on-one" />
                <Label htmlFor="one-on-one" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  One-on-One Interview
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="notes" className="block text-sm font-medium mb-2">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or questions for the interviewer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end">
        <Button 
          onClick={handleScheduleInterview} 
          disabled={isLoading || !date || !selectedTimeSlot || !interviewType}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {rescheduleInterview ? 'Reschedule Interview' : 'Schedule Interview'}
        </Button>
      </div>
    </div>
  );
  
  const renderUpcomingInterviews = () => {
    const upcomingInterviews = existingInterviews.filter(interview => 
      interview.status === 'scheduled' || interview.status === 'rescheduled'
    );
    
    if (upcomingInterviews.length === 0) {
      return (
        <div className="text-center py-8">
          <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No Upcoming Interviews</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You don't have any interviews scheduled yet.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {upcomingInterviews.map((interview, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base flex items-center">
                    {getInterviewTypeIcon(interview.type)}
                    <span className="ml-2">{interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview</span>
                  </CardTitle>
                  <CardDescription>
                    with {interview.interviewerName}
                  </CardDescription>
                </div>
                {getInterviewStatusBadge(interview.status)}
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center text-sm mb-2">
                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{format(new Date(interview.date), "PPP")}</span>
                <Clock className="h-4 w-4 ml-4 mr-2 text-muted-foreground" />
                <span>{format(new Date(interview.date), "p")}</span>
              </div>
              
              {interview.notes && (
                <div className="text-sm text-muted-foreground mt-2">
                  <p>{interview.notes}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setInterviewToCancel(interview);
                  setCancelDialogOpen(true);
                }}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={() => setRescheduleInterview(interview)}
              >
                Reschedule
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderPastInterviews = () => {
    const pastInterviews = existingInterviews.filter(interview => 
      interview.status === 'completed' || interview.status === 'cancelled'
    );
    
    if (pastInterviews.length === 0) {
      return (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No Past Interviews</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You don't have any completed or cancelled interviews.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {pastInterviews.map((interview, index) => (
          <Card key={index} className={cn(
            "overflow-hidden",
            interview.status === 'cancelled' && "opacity-75"
          )}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base flex items-center">
                    {getInterviewTypeIcon(interview.type)}
                    <span className="ml-2">{interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview</span>
                  </CardTitle>
                  <CardDescription>
                    with {interview.interviewerName}
                  </CardDescription>
                </div>
                {getInterviewStatusBadge(interview.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm mb-2">
                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{format(new Date(interview.date), "PPP")}</span>
                <Clock className="h-4 w-4 ml-4 mr-2 text-muted-foreground" />
                <span>{format(new Date(interview.date), "p")}</span>
              </div>
              
              {interview.notes && (
                <div className="text-sm text-muted-foreground mt-2">
                  <p>{interview.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-800">
      <h3 className="text-xl font-semibold mb-6">Interview Management</h3>
      
      {rescheduleInterview ? (
        <div className="mb-6">
          <Alert>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <AlertTitle>Rescheduling Interview</AlertTitle>
            </div>
            <AlertDescription>
              You are rescheduling your {rescheduleInterview.type} interview originally scheduled for {format(new Date(rescheduleInterview.date), "PPP 'at' p")}.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end mt-2">
            <Button variant="ghost" size="sm" onClick={() => setRescheduleInterview(null)}>
              Cancel Rescheduling
            </Button>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="schedule">Schedule New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-4">
            {renderUpcomingInterviews()}
          </TabsContent>
          
          <TabsContent value="past" className="mt-4">
            {renderPastInterviews()}
          </TabsContent>
          
          <TabsContent value="schedule" className="mt-4">
            {renderScheduler()}
          </TabsContent>
        </Tabs>
      )}
      
      {rescheduleInterview && renderScheduler()}
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Interview Scheduled Successfully</DialogTitle>
            <DialogDescription>
              Your interview has been scheduled. You will receive a confirmation email with all the details.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <div className="flex items-center text-sm mb-2">
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{date ? format(date, "PPP") : ""}</span>
            </div>
            <div className="flex items-center text-sm mb-2">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {selectedTimeSlot ? 
                  timeSlots.find(slot => slot.id === selectedTimeSlot)?.startTime + " - " + 
                  timeSlots.find(slot => slot.id === selectedTimeSlot)?.endTime : 
                  ""}
              </span>
            </div>
            <div className="flex items-center text-sm">
              {getInterviewTypeIcon(interviewType)}
              <span className="ml-2">{interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setShowConfirmation(false);
              setActiveTab('upcoming');
            }}>
              View Upcoming Interviews
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Interview Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this interview? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {interviewToCancel && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-4">
              <div className="flex items-center text-sm mb-2">
                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{format(new Date(interviewToCancel.date), "PPP")}</span>
              </div>
              <div className="flex items-center text-sm mb-2">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{format(new Date(interviewToCancel.date), "p")}</span>
              </div>
              <div className="flex items-center text-sm">
                {getInterviewTypeIcon(interviewToCancel.type)}
                <span className="ml-2">{interviewToCancel.type.charAt(0).toUpperCase() + interviewToCancel.type.slice(1)} Interview</span>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="cancelReason">Reason for cancellation (Optional)</Label>
            <Textarea
              id="cancelReason"
              placeholder="Please provide a reason for cancelling this interview..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={isCancelling}>
              Keep Interview
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelInterview}
              disabled={isCancelling}
            >
              {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
