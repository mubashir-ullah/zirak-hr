'use client';

import { useState } from 'react';
import { PlusCircleIcon, TrashIcon, CheckIcon, XIcon, EditIcon, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock interview question templates
const mockQuestionTemplates = [
  {
    id: 1,
    title: 'Frontend Developer Interview',
    description: 'Questions for assessing frontend development skills',
    questions: [
      { id: 1, question: 'Explain the difference between localStorage and sessionStorage', category: 'technical' },
      { id: 2, question: 'What is the virtual DOM and how does it work?', category: 'technical' },
      { id: 3, question: 'Describe your experience with responsive design', category: 'experience' },
      { id: 4, question: 'How do you stay updated with the latest frontend technologies?', category: 'behavioral' },
      { id: 5, question: 'Walk through a complex UI component you built recently', category: 'experience' },
    ],
  },
  {
    id: 2,
    title: 'Backend Developer Interview',
    description: 'Questions for assessing backend development skills',
    questions: [
      { id: 1, question: 'Explain RESTful API design principles', category: 'technical' },
      { id: 2, question: 'How would you handle database migrations in a production environment?', category: 'technical' },
      { id: 3, question: 'Describe your experience with microservices architecture', category: 'experience' },
      { id: 4, question: 'How do you approach API security?', category: 'technical' },
      { id: 5, question: 'Tell me about a challenging backend problem you solved', category: 'experience' },
    ],
  },
  {
    id: 3,
    title: 'UX Designer Interview',
    description: 'Questions for assessing UX design skills',
    questions: [
      { id: 1, question: 'Walk me through your design process', category: 'experience' },
      { id: 2, question: 'How do you incorporate user feedback into your designs?', category: 'behavioral' },
      { id: 3, question: 'Describe a time when you had to defend a design decision', category: 'behavioral' },
      { id: 4, question: 'How do you balance user needs with business requirements?', category: 'behavioral' },
      { id: 5, question: 'Show examples of how you've improved a user experience', category: 'experience' },
    ],
  },
];

// Mock feedback templates
const mockFeedbackTemplates = [
  {
    id: 1,
    title: 'Technical Assessment',
    description: 'Evaluate technical skills and knowledge',
    criteria: [
      { id: 1, criterion: 'Technical Knowledge', description: 'Understanding of core concepts and technologies' },
      { id: 2, criterion: 'Problem Solving', description: 'Ability to analyze and solve technical problems' },
      { id: 3, criterion: 'Code Quality', description: 'Writing clean, maintainable, and efficient code' },
      { id: 4, criterion: 'System Design', description: 'Ability to design scalable and robust systems' },
    ],
  },
  {
    id: 2,
    title: 'Behavioral Assessment',
    description: 'Evaluate soft skills and cultural fit',
    criteria: [
      { id: 1, criterion: 'Communication', description: 'Clarity and effectiveness of communication' },
      { id: 2, criterion: 'Teamwork', description: 'Ability to collaborate and work in a team' },
      { id: 3, criterion: 'Adaptability', description: 'Openness to feedback and ability to adapt' },
      { id: 4, criterion: 'Cultural Fit', description: 'Alignment with company values and culture' },
    ],
  },
];

export default function InterviewQuestions() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('questions');
  const [questionTemplates, setQuestionTemplates] = useState(mockQuestionTemplates);
  const [feedbackTemplates, setFeedbackTemplates] = useState(mockFeedbackTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    description: '',
    questions: [],
  });
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState('technical');
  
  const [selectedFeedbackTemplate, setSelectedFeedbackTemplate] = useState(null);
  const [showEditFeedbackDialog, setShowEditFeedbackDialog] = useState(false);
  const [showCreateFeedbackDialog, setShowCreateFeedbackDialog] = useState(false);
  const [newFeedbackTemplate, setNewFeedbackTemplate] = useState({
    title: '',
    description: '',
    criteria: [],
  });
  const [newCriterion, setNewCriterion] = useState('');
  const [newCriterionDescription, setNewCriterionDescription] = useState('');

  // Handle selecting a question template
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  // Handle selecting a feedback template
  const handleSelectFeedbackTemplate = (template) => {
    setSelectedFeedbackTemplate(template);
  };

  // Handle editing a question template
  const handleEditTemplate = () => {
    setNewTemplate({
      ...selectedTemplate,
      questions: [...selectedTemplate.questions],
    });
    setShowEditDialog(true);
  };

  // Handle creating a new question template
  const handleCreateTemplate = () => {
    setNewTemplate({
      title: '',
      description: '',
      questions: [],
    });
    setShowCreateDialog(true);
  };

  // Handle adding a question to a new template
  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    
    setNewTemplate({
      ...newTemplate,
      questions: [
        ...newTemplate.questions,
        {
          id: Date.now(),
          question: newQuestion,
          category: newQuestionCategory,
        },
      ],
    });
    
    setNewQuestion('');
    setNewQuestionCategory('technical');
  };

  // Handle removing a question from a template
  const handleRemoveQuestion = (questionId) => {
    setNewTemplate({
      ...newTemplate,
      questions: newTemplate.questions.filter(q => q.id !== questionId),
    });
  };

  // Handle saving a template
  const handleSaveTemplate = () => {
    if (showEditDialog) {
      // Update existing template
      const updatedTemplates = questionTemplates.map(template => 
        template.id === newTemplate.id ? newTemplate : template
      );
      setQuestionTemplates(updatedTemplates);
      setShowEditDialog(false);
      
      toast({
        title: "Template Updated",
        description: `"${newTemplate.title}" has been updated.`,
      });
    } else {
      // Create new template
      const newTemplateWithId = {
        ...newTemplate,
        id: Date.now(),
      };
      setQuestionTemplates([...questionTemplates, newTemplateWithId]);
      setShowCreateDialog(false);
      
      toast({
        title: "Template Created",
        description: `"${newTemplate.title}" has been created.`,
      });
    }
  };

  // Handle deleting a template
  const handleDeleteTemplate = (templateId) => {
    setQuestionTemplates(questionTemplates.filter(template => template.id !== templateId));
    setSelectedTemplate(null);
    
    toast({
      title: "Template Deleted",
      description: "The template has been deleted.",
    });
  };

  // Handle editing a feedback template
  const handleEditFeedbackTemplate = () => {
    setNewFeedbackTemplate({
      ...selectedFeedbackTemplate,
      criteria: [...selectedFeedbackTemplate.criteria],
    });
    setShowEditFeedbackDialog(true);
  };

  // Handle creating a new feedback template
  const handleCreateFeedbackTemplate = () => {
    setNewFeedbackTemplate({
      title: '',
      description: '',
      criteria: [],
    });
    setShowCreateFeedbackDialog(true);
  };

  // Handle adding a criterion to a feedback template
  const handleAddCriterion = () => {
    if (!newCriterion.trim()) return;
    
    setNewFeedbackTemplate({
      ...newFeedbackTemplate,
      criteria: [
        ...newFeedbackTemplate.criteria,
        {
          id: Date.now(),
          criterion: newCriterion,
          description: newCriterionDescription,
        },
      ],
    });
    
    setNewCriterion('');
    setNewCriterionDescription('');
  };

  // Handle removing a criterion from a feedback template
  const handleRemoveCriterion = (criterionId) => {
    setNewFeedbackTemplate({
      ...newFeedbackTemplate,
      criteria: newFeedbackTemplate.criteria.filter(c => c.id !== criterionId),
    });
  };

  // Handle saving a feedback template
  const handleSaveFeedbackTemplate = () => {
    if (showEditFeedbackDialog) {
      // Update existing template
      const updatedTemplates = feedbackTemplates.map(template => 
        template.id === newFeedbackTemplate.id ? newFeedbackTemplate : template
      );
      setFeedbackTemplates(updatedTemplates);
      setShowEditFeedbackDialog(false);
      
      toast({
        title: "Feedback Template Updated",
        description: `"${newFeedbackTemplate.title}" has been updated.`,
      });
    } else {
      // Create new template
      const newTemplateWithId = {
        ...newFeedbackTemplate,
        id: Date.now(),
      };
      setFeedbackTemplates([...feedbackTemplates, newTemplateWithId]);
      setShowCreateFeedbackDialog(false);
      
      toast({
        title: "Feedback Template Created",
        description: `"${newFeedbackTemplate.title}" has been created.`,
      });
    }
  };

  // Handle deleting a feedback template
  const handleDeleteFeedbackTemplate = (templateId) => {
    setFeedbackTemplates(feedbackTemplates.filter(template => template.id !== templateId));
    setSelectedFeedbackTemplate(null);
    
    toast({
      title: "Feedback Template Deleted",
      description: "The feedback template has been deleted.",
    });
  };

  // Get category badge color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'technical':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'behavioral':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'experience':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Interview Resources</h2>
          <p className="text-muted-foreground">
            Manage interview questions and feedback templates.
          </p>
        </div>
      </div>

      <Tabs defaultValue="questions" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="questions">Question Templates</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleCreateTemplate}>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Question Templates</CardTitle>
                  <CardDescription>
                    Select a template to view its questions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {questionTemplates.map(template => (
                      <div
                        key={template.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted border border-transparent'
                        }`}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <div className="font-medium">{template.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {template.questions.length} questions
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              {selectedTemplate ? (
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle>{selectedTemplate.title}</CardTitle>
                      <CardDescription>
                        {selectedTemplate.description}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleEditTemplate}>
                        <EditIcon className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-2">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-2">Delete</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedTemplate.questions.map((question, index) => (
                        <div key={question.id} className="border-b pb-3 last:border-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">{index + 1}. {question.question}</div>
                              <Badge
                                variant="outline"
                                className={`mt-1 ${getCategoryColor(question.category)}`}
                              >
                                {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Template Selected</CardTitle>
                    <CardDescription>
                      Select a template from the list or create a new one.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleCreateFeedbackTemplate}>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Create Feedback Template
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Templates</CardTitle>
                  <CardDescription>
                    Select a template to view its criteria.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feedbackTemplates.map(template => (
                      <div
                        key={template.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedFeedbackTemplate?.id === template.id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted border border-transparent'
                        }`}
                        onClick={() => handleSelectFeedbackTemplate(template)}
                      >
                        <div className="font-medium">{template.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {template.criteria.length} criteria
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              {selectedFeedbackTemplate ? (
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle>{selectedFeedbackTemplate.title}</CardTitle>
                      <CardDescription>
                        {selectedFeedbackTemplate.description}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleEditFeedbackTemplate}>
                        <EditIcon className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-2">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => handleDeleteFeedbackTemplate(selectedFeedbackTemplate.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-2">Delete</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedFeedbackTemplate.criteria.map((criterion, index) => (
                        <div key={criterion.id} className="border-b pb-3 last:border-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">{criterion.criterion}</div>
                              <div className="text-sm text-muted-foreground">
                                {criterion.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Template Selected</CardTitle>
                    <CardDescription>
                      Select a feedback template from the list or create a new one.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit/Create Question Template Dialog */}
      <Dialog
        open={showEditDialog || showCreateDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowEditDialog(false);
            setShowCreateDialog(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {showEditDialog ? 'Edit Question Template' : 'Create Question Template'}
            </DialogTitle>
            <DialogDescription>
              {showEditDialog
                ? 'Update the template details and questions.'
                : 'Create a new template for interview questions.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-title" className="text-right">
                Title*
              </Label>
              <Input
                id="template-title"
                value={newTemplate.title}
                onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="template-description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Questions</Label>
              <div className="col-span-3 space-y-4">
                <div className="space-y-2">
                  {newTemplate.questions.map((question, index) => (
                    <div key={question.id} className="flex items-start justify-between space-x-2 p-2 border rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">{index + 1}. {question.question}</div>
                        <Badge
                          variant="outline"
                          className={`mt-1 ${getCategoryColor(question.category)}`}
                        >
                          {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveQuestion(question.id)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Enter a new question"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                      />
                    </div>
                    <Select
                      value={newQuestionCategory}
                      onValueChange={setNewQuestionCategory}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleAddQuestion}
                      disabled={!newQuestion.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setShowCreateDialog(false);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={!newTemplate.title || newTemplate.questions.length === 0}
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Feedback Template Dialog */}
      <Dialog
        open={showEditFeedbackDialog || showCreateFeedbackDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowEditFeedbackDialog(false);
            setShowCreateFeedbackDialog(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {showEditFeedbackDialog ? 'Edit Feedback Template' : 'Create Feedback Template'}
            </DialogTitle>
            <DialogDescription>
              {showEditFeedbackDialog
                ? 'Update the feedback template details and criteria.'
                : 'Create a new template for interview feedback.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="feedback-title" className="text-right">
                Title*
              </Label>
              <Input
                id="feedback-title"
                value={newFeedbackTemplate.title}
                onChange={(e) => setNewFeedbackTemplate({ ...newFeedbackTemplate, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="feedback-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="feedback-description"
                value={newFeedbackTemplate.description}
                onChange={(e) => setNewFeedbackTemplate({ ...newFeedbackTemplate, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Criteria</Label>
              <div className="col-span-3 space-y-4">
                <div className="space-y-2">
                  {newFeedbackTemplate.criteria.map((criterion, index) => (
                    <div key={criterion.id} className="flex items-start justify-between space-x-2 p-2 border rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">{criterion.criterion}</div>
                        <div className="text-sm text-muted-foreground">
                          {criterion.description}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCriterion(criterion.id)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Criterion name"
                    value={newCriterion}
                    onChange={(e) => setNewCriterion(e.target.value)}
                  />
                  <Textarea
                    placeholder="Criterion description"
                    value={newCriterionDescription}
                    onChange={(e) => setNewCriterionDescription(e.target.value)}
                  />
                  <Button
                    onClick={handleAddCriterion}
                    disabled={!newCriterion.trim()}
                    className="w-full"
                  >
                    Add Criterion
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditFeedbackDialog(false);
              setShowCreateFeedbackDialog(false);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveFeedbackTemplate}
              disabled={!newFeedbackTemplate.title || newFeedbackTemplate.criteria.length === 0}
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
