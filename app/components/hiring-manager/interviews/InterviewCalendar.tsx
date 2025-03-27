'use client';

import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { addDays, addHours, startOfDay } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

import 'react-big-calendar/lib/css/react-big-calendar.css';

// Date-fns localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Mock interview types
const interviewTypes = [
  { id: 1, name: 'Technical Interview', color: '#0ea5e9' },
  { id: 2, name: 'HR Interview', color: '#8b5cf6' },
  { id: 3, name: 'Culture Fit', color: '#10b981' },
  { id: 4, name: 'System Design', color: '#f59e0b' },
  { id: 5, name: 'Coding Challenge', color: '#ef4444' },
];

// Mock interviewers
const interviewers = [
  { id: 1, name: 'John Smith', position: 'Senior Developer', availability: ['Monday', 'Wednesday', 'Friday'] },
  { id: 2, name: 'Sarah Johnson', position: 'HR Director', availability: ['Tuesday', 'Thursday'] },
  { id: 3, name: 'Michael Brown', position: 'Tech Lead', availability: ['Monday', 'Tuesday', 'Friday'] },
  { id: 4, name: 'Emily Davis', position: 'UX Designer', availability: ['Wednesday', 'Thursday', 'Friday'] },
];

// Mock candidates
const candidates = [
  { id: 1, name: 'Alex Wilson', position: 'Frontend Developer', email: 'alex.wilson@example.com' },
  { id: 2, name: 'Jessica Lee', position: 'UX Designer', email: 'jessica.lee@example.com' },
  { id: 3, name: 'Ryan Taylor', position: 'Backend Developer', email: 'ryan.taylor@example.com' },
  { id: 4, name: 'Olivia Martin', position: 'Product Manager', email: 'olivia.martin@example.com' },
];

// Generate mock interview events
const generateMockEvents = () => {
  const today = startOfDay(new Date());
  const events = [];

  // Generate some random events for the next 14 days
  for (let i = 0; i < 10; i++) {
    const startDate = addHours(addDays(today, Math.floor(Math.random() * 14)), 9 + Math.floor(Math.random() * 8));
    const endDate = addHours(startDate, 1);
    const interviewType = interviewTypes[Math.floor(Math.random() * interviewTypes.length)];
    const interviewer = interviewers[Math.floor(Math.random() * interviewers.length)];
    const candidate = candidates[Math.floor(Math.random() * candidates.length)];

    events.push({
      id: i,
      title: `${interviewType.name}: ${candidate.name}`,
      start: startDate,
      end: endDate,
      interviewType,
      interviewer,
      candidate,
      location: Math.random() > 0.5 ? 'Video Call' : 'Office',
      notes: 'Prepare questions about previous experience and technical skills.',
    });
  }

  return events;
};

export default function InterviewCalendar() {
  const { toast } = useToast();
  const [events, setEvents] = useState(generateMockEvents());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: addHours(new Date(), 1),
    interviewType: interviewTypes[0].id,
    interviewer: interviewers[0].id,
    candidate: candidates[0].id,
    location: 'Video Call',
    notes: '',
  });

  // Handle event selection
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  // Handle slot selection (for creating new events)
  const handleSelectSlot = ({ start, end }) => {
    setNewEvent({
      ...newEvent,
      start,
      end,
    });
    setShowAddDialog(true);
  };

  // Handle adding a new event
  const handleAddEvent = () => {
    const interviewType = interviewTypes.find(type => type.id === parseInt(newEvent.interviewType));
    const interviewer = interviewers.find(person => person.id === parseInt(newEvent.interviewer));
    const candidate = candidates.find(person => person.id === parseInt(newEvent.candidate));
    
    const event = {
      id: events.length,
      title: `${interviewType.name}: ${candidate.name}`,
      start: newEvent.start,
      end: newEvent.end,
      interviewType,
      interviewer,
      candidate,
      location: newEvent.location,
      notes: newEvent.notes,
    };
    
    setEvents([...events, event]);
    setShowAddDialog(false);
    
    toast({
      title: "Interview Scheduled",
      description: `Interview with ${candidate.name} has been scheduled.`,
    });
  };

  // Handle updating an event
  const handleUpdateEvent = () => {
    const updatedEvents = events.map(event => 
      event.id === selectedEvent.id ? selectedEvent : event
    );
    
    setEvents(updatedEvents);
    setShowEventDialog(false);
    
    toast({
      title: "Interview Updated",
      description: `Interview with ${selectedEvent.candidate.name} has been updated.`,
    });
  };

  // Handle deleting an event
  const handleDeleteEvent = () => {
    setEvents(events.filter(event => event.id !== selectedEvent.id));
    setShowEventDialog(false);
    
    toast({
      title: "Interview Canceled",
      description: `Interview with ${selectedEvent.candidate.name} has been canceled.`,
    });
  };

  // Format date for display
  const formatDate = (date) => {
    return format(date, 'MMMM dd, yyyy h:mm a');
  };

  // Custom event component for the calendar
  const EventComponent = ({ event }) => (
    <div
      style={{
        backgroundColor: event.interviewType.color,
        color: '#fff',
        padding: '2px 5px',
        borderRadius: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        height: '100%',
      }}
    >
      {event.title}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Interview Calendar</h2>
          <p className="text-muted-foreground">
            Schedule and manage interviews with candidates.
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="mt-2 sm:mt-0">
          Schedule Interview
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardContent className="p-4">
            <div style={{ height: 700 }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                components={{
                  event: EventComponent,
                }}
                views={['month', 'week', 'day']}
                defaultView="week"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
            <CardDescription>
              Your scheduled interviews for the next 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events
                .filter(event => event.start >= new Date() && event.start <= addDays(new Date(), 7))
                .sort((a, b) => a.start - b.start)
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{event.candidate.name}</h4>
                      <Badge style={{ backgroundColor: event.interviewType.color }}>
                        {event.interviewType.name}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.start)}
                    </p>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <span>Interviewer: {event.interviewer.name}</span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <span>Location: {event.location}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 p-0 h-auto"
                      onClick={() => handleSelectEvent(event)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              {events.filter(event => event.start >= new Date() && event.start <= addDays(new Date(), 7)).length === 0 && (
                <p className="text-sm text-muted-foreground">No upcoming interviews scheduled.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View/Edit Event Dialog */}
      {selectedEvent && (
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Interview Details</DialogTitle>
              <DialogDescription>
                View and manage interview information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="candidate" className="text-right">
                  Candidate
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedEvent.candidate.id.toString()}
                    onValueChange={(value) => setSelectedEvent({
                      ...selectedEvent,
                      candidate: candidates.find(c => c.id === parseInt(value)),
                    })}
                  >
                    <SelectTrigger id="candidate">
                      <SelectValue placeholder="Select candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map(candidate => (
                        <SelectItem key={candidate.id} value={candidate.id.toString()}>
                          {candidate.name} - {candidate.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="interviewer" className="text-right">
                  Interviewer
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedEvent.interviewer.id.toString()}
                    onValueChange={(value) => setSelectedEvent({
                      ...selectedEvent,
                      interviewer: interviewers.find(i => i.id === parseInt(value)),
                    })}
                  >
                    <SelectTrigger id="interviewer">
                      <SelectValue placeholder="Select interviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {interviewers.map(interviewer => (
                        <SelectItem key={interviewer.id} value={interviewer.id.toString()}>
                          {interviewer.name} - {interviewer.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="interview-type" className="text-right">
                  Interview Type
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedEvent.interviewType.id.toString()}
                    onValueChange={(value) => setSelectedEvent({
                      ...selectedEvent,
                      interviewType: interviewTypes.find(t => t.id === parseInt(value)),
                    })}
                  >
                    <SelectTrigger id="interview-type">
                      <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                    <SelectContent>
                      {interviewTypes.map(type => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date & Time
                </Label>
                <div className="col-span-3">
                  <div className="text-sm">
                    {formatDate(selectedEvent.start)} - {format(selectedEvent.end, 'h:mm a')}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedEvent.location}
                    onValueChange={(value) => setSelectedEvent({
                      ...selectedEvent,
                      location: value,
                    })}
                  >
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Video Call">Video Call</SelectItem>
                      <SelectItem value="Phone Call">Phone Call</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <div className="col-span-3">
                  <Textarea
                    id="notes"
                    value={selectedEvent.notes}
                    onChange={(e) => setSelectedEvent({
                      ...selectedEvent,
                      notes: e.target.value,
                    })}
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button variant="destructive" onClick={handleDeleteEvent}>
                Cancel Interview
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                  Close
                </Button>
                <Button onClick={handleUpdateEvent}>
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Event Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Create a new interview with a candidate.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-candidate" className="text-right">
                Candidate*
              </Label>
              <div className="col-span-3">
                <Select
                  value={newEvent.candidate.toString()}
                  onValueChange={(value) => setNewEvent({
                    ...newEvent,
                    candidate: parseInt(value),
                  })}
                >
                  <SelectTrigger id="new-candidate">
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map(candidate => (
                      <SelectItem key={candidate.id} value={candidate.id.toString()}>
                        {candidate.name} - {candidate.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-interviewer" className="text-right">
                Interviewer*
              </Label>
              <div className="col-span-3">
                <Select
                  value={newEvent.interviewer.toString()}
                  onValueChange={(value) => setNewEvent({
                    ...newEvent,
                    interviewer: parseInt(value),
                  })}
                >
                  <SelectTrigger id="new-interviewer">
                    <SelectValue placeholder="Select interviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewers.map(interviewer => (
                      <SelectItem key={interviewer.id} value={interviewer.id.toString()}>
                        {interviewer.name} - {interviewer.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-interview-type" className="text-right">
                Interview Type*
              </Label>
              <div className="col-span-3">
                <Select
                  value={newEvent.interviewType.toString()}
                  onValueChange={(value) => setNewEvent({
                    ...newEvent,
                    interviewType: parseInt(value),
                  })}
                >
                  <SelectTrigger id="new-interview-type">
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewTypes.map(type => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-date" className="text-right">
                Date & Time*
              </Label>
              <div className="col-span-3">
                <div className="text-sm">
                  {formatDate(newEvent.start)} - {format(newEvent.end, 'h:mm a')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Selected from calendar. Close and select a different time slot to change.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-location" className="text-right">
                Location*
              </Label>
              <div className="col-span-3">
                <Select
                  value={newEvent.location}
                  onValueChange={(value) => setNewEvent({
                    ...newEvent,
                    location: value,
                  })}
                >
                  <SelectTrigger id="new-location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Video Call">Video Call</SelectItem>
                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-notes" className="text-right">
                Notes
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="new-notes"
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({
                    ...newEvent,
                    notes: e.target.value,
                  })}
                  placeholder="Add any preparation notes or instructions for the interviewer"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>
              Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
