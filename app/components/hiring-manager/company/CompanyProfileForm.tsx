'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define form schema with Zod
const profileFormSchema = z.object({
  companyName: z.string().min(2, {
    message: 'Company name must be at least 2 characters.',
  }),
  industry: z.string().min(2, {
    message: 'Industry must be at least 2 characters.',
  }),
  companySize: z.string({
    required_error: 'Please select a company size.',
  }),
  foundedYear: z.string().regex(/^\d{4}$/, {
    message: 'Please enter a valid year (e.g., 2020).',
  }),
  website: z.string().url({
    message: 'Please enter a valid URL.',
  }),
  location: z.string().min(2, {
    message: 'Location must be at least 2 characters.',
  }),
  description: z.string().min(50, {
    message: 'Company description must be at least 50 characters.',
  }),
  mission: z.string().optional(),
  values: z.string().optional(),
  culture: z.string().optional(),
  benefits: z.string().optional(),
});

const teamMemberSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  position: z.string().min(2, {
    message: 'Position must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  role: z.enum(['admin', 'recruiter', 'interviewer'], {
    required_error: 'Please select a role.',
  }),
});

// Mock company data
const mockCompanyData = {
  companyName: 'Zirak Technologies',
  industry: 'Information Technology',
  companySize: '51-200',
  foundedYear: '2020',
  website: 'https://zirak.tech',
  location: 'San Francisco, CA',
  description: 'Zirak Technologies is a forward-thinking tech company specializing in AI-powered HR solutions. We help companies streamline their hiring processes and find the best talent for their teams.',
  mission: 'To revolutionize the hiring process through innovative technology and human-centered design.',
  values: 'Innovation, Integrity, Inclusion, Excellence',
  culture: 'We foster a collaborative environment where creativity thrives. Our team is diverse, passionate, and committed to making a difference in the HR tech space.',
  benefits: 'Competitive salary, health insurance, flexible work hours, remote work options, professional development budget, generous vacation policy.',
  logo: '/company-logo.png',
  teamMembers: [
    {
      id: 1,
      name: 'John Smith',
      position: 'CEO',
      email: 'john.smith@zirak.tech',
      role: 'admin',
      avatar: '/avatars/john-smith.png',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      position: 'HR Director',
      email: 'sarah.johnson@zirak.tech',
      role: 'admin',
      avatar: '/avatars/sarah-johnson.png',
    },
    {
      id: 3,
      name: 'Michael Brown',
      position: 'Recruiter',
      email: 'michael.brown@zirak.tech',
      role: 'recruiter',
      avatar: '/avatars/michael-brown.png',
    },
    {
      id: 4,
      name: 'Emily Davis',
      position: 'Technical Interviewer',
      email: 'emily.davis@zirak.tech',
      role: 'interviewer',
      avatar: '/avatars/emily-davis.png',
    },
  ],
};

export default function CompanyProfileForm({ companyData = null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(companyData?.logo || mockCompanyData.logo);
  const [teamMembers, setTeamMembers] = useState(companyData?.teamMembers || mockCompanyData.teamMembers);
  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);
  const supabase = createClientComponentClient();

  // Initialize form with default values or existing company data
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: companyData || mockCompanyData,
  });

  // Initialize team member form
  const teamMemberForm = useForm({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: '',
      position: '',
      email: '',
      role: 'recruiter',
    },
  });

  // Handle logo upload
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      // Upload logo if changed
      let logoUrl = logoPreview;
      if (logoFile) {
        // In a real app, this would upload to Supabase Storage
        // const { data, error } = await supabase.storage
        //   .from('company-logos')
        //   .upload(`${values.companyName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`, logoFile);
        
        // if (error) throw error;
        // logoUrl = supabase.storage.from('company-logos').getPublicUrl(data.path).data.publicUrl;
      }
      
      // Save company profile with logo URL
      const companyProfile = {
        ...values,
        logo: logoUrl,
        teamMembers,
      };
      
      // In a real app, this would save to Supabase
      // const { error } = await supabase
      //   .from('company_profiles')
      //   .upsert({ ...companyProfile, user_id: user.id });
      
      // if (error) throw error;
      
      console.log('Saving company profile:', companyProfile);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile Updated",
        description: "Your company profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving company profile:', error);
      toast({
        title: "Error",
        description: "There was an error saving your company profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle adding a team member
  function handleAddTeamMember(data) {
    const newTeamMember = {
      id: Date.now(),
      name: data.name,
      position: data.position,
      email: data.email,
      role: data.role,
      avatar: null,
    };
    
    setTeamMembers([...teamMembers, newTeamMember]);
    setIsAddingTeamMember(false);
    teamMemberForm.reset();
    
    toast({
      title: "Team Member Added",
      description: `${data.name} has been added to your team.`,
    });
  }

  // Handle removing a team member
  function handleRemoveTeamMember(id) {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
    
    toast({
      title: "Team Member Removed",
      description: "The team member has been removed from your company.",
    });
  }

  return (
    <Tabs defaultValue="general" className="space-y-4" onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="general">General Information</TabsTrigger>
        <TabsTrigger value="details">Company Details</TabsTrigger>
        <TabsTrigger value="team">Team Members</TabsTrigger>
      </TabsList>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Logo</CardTitle>
                <CardDescription>
                  Upload your company logo. This will be displayed on your job postings and company profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={logoPreview} alt="Company Logo" />
                    <AvatarFallback>{form.getValues().companyName?.charAt(0) || 'C'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="max-w-sm"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Recommended size: 512x512 pixels. Max file size: 2MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter your company's basic information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Zirak Technologies" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Information Technology" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="501-1000">501-1000 employees</SelectItem>
                            <SelectItem value="1001+">1001+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="foundedYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Founded Year*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 2020" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. https://zirak.tech" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. San Francisco, CA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Description</CardTitle>
                <CardDescription>
                  Provide a detailed description of your company.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Description*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your company, its history, and what it does..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mission and Values</CardTitle>
                <CardDescription>
                  Share your company's mission and values.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="mission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mission Statement</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What is your company's mission?"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="values"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Values</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What values does your company uphold?"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Separate values with commas (e.g., Innovation, Integrity, Excellence)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Culture and Benefits</CardTitle>
                <CardDescription>
                  Describe your company culture and the benefits you offer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="culture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Culture</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your company's culture and work environment..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefits</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List the benefits and perks your company offers..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Separate benefits with commas or new lines
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage your company's team members and their roles.
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddingTeamMember(true)}>
                  Add Team Member
                </Button>
              </CardHeader>
              <CardContent>
                {isAddingTeamMember ? (
                  <Card className="mb-4 border-dashed">
                    <CardHeader>
                      <CardTitle className="text-base">Add Team Member</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...teamMemberForm}>
                        <form onSubmit={teamMemberForm.handleSubmit(handleAddTeamMember)} className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                              control={teamMemberForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. John Smith" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={teamMemberForm.control}
                              name="position"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Position*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. HR Manager" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={teamMemberForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. john.smith@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={teamMemberForm.control}
                              name="role"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Role*</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="recruiter">Recruiter</SelectItem>
                                      <SelectItem value="interviewer">Interviewer</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsAddingTeamMember(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">
                              Add Team Member
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                ) : null}
                
                {teamMembers.length > 0 ? (
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.position}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTeamMember(member.id)}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">No Team Members</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Add team members to your company profile.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setIsAddingTeamMember(true)}
                      >
                        Add Team Member
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Form>
    </Tabs>
  );
}
