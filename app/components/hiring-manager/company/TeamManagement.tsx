'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  UserPlusIcon,
  MailIcon,
  BriefcaseIcon,
  ShieldIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  XIcon
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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock team members data
const mockTeamMembers = [
  {
    id: 1,
    name: 'John Smith',
    position: 'CEO',
    email: 'john.smith@zirak.tech',
    role: 'admin',
    avatar: '/avatars/john-smith.png',
    status: 'active',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    position: 'HR Director',
    email: 'sarah.johnson@zirak.tech',
    role: 'admin',
    avatar: '/avatars/sarah-johnson.png',
    status: 'active',
  },
  {
    id: 3,
    name: 'Michael Brown',
    position: 'Recruiter',
    email: 'michael.brown@zirak.tech',
    role: 'recruiter',
    avatar: '/avatars/michael-brown.png',
    status: 'active',
  },
  {
    id: 4,
    name: 'Emily Davis',
    position: 'Technical Interviewer',
    email: 'emily.davis@zirak.tech',
    role: 'interviewer',
    avatar: '/avatars/emily-davis.png',
    status: 'active',
  },
  {
    id: 5,
    name: 'David Wilson',
    position: 'Recruiter',
    email: 'david.wilson@zirak.tech',
    role: 'recruiter',
    avatar: '/avatars/david-wilson.png',
    status: 'pending',
  },
];

// Mock invitations data
const mockInvitations = [
  {
    id: 1,
    email: 'alex.johnson@zirak.tech',
    role: 'interviewer',
    sentAt: '2025-03-25T10:30:00Z',
    status: 'pending',
  },
  {
    id: 2,
    email: 'lisa.brown@zirak.tech',
    role: 'recruiter',
    sentAt: '2025-03-24T14:15:00Z',
    status: 'pending',
  },
];

export default function TeamManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [invitations, setInvitations] = useState(mockInvitations);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newMember, setNewMember] = useState({
    name: '',
    position: '',
    email: '',
    role: 'recruiter',
  });
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    role: 'recruiter',
  });

  // Filter team members based on search query and role filter
  const filteredTeamMembers = teamMembers.filter(member => {
    // Filter by search query
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by role
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Handle adding a new team member
  const handleAddMember = () => {
    setShowAddDialog(true);
  };

  // Confirm adding a new team member
  const confirmAddMember = () => {
    const newTeamMember = {
      id: Date.now(),
      name: newMember.name,
      position: newMember.position,
      email: newMember.email,
      role: newMember.role,
      avatar: null,
      status: 'active',
    };
    
    setTeamMembers([...teamMembers, newTeamMember]);
    setShowAddDialog(false);
    setNewMember({
      name: '',
      position: '',
      email: '',
      role: 'recruiter',
    });
    
    toast({
      title: "Team Member Added",
      description: `${newMember.name} has been added to your team.`,
    });
  };

  // Handle editing a team member
  const handleEditMember = (member) => {
    setSelectedMember(member);
    setShowEditDialog(true);
  };

  // Confirm editing a team member
  const confirmEditMember = () => {
    const updatedTeamMembers = teamMembers.map(member => 
      member.id === selectedMember.id ? selectedMember : member
    );
    
    setTeamMembers(updatedTeamMembers);
    setShowEditDialog(false);
    setSelectedMember(null);
    
    toast({
      title: "Team Member Updated",
      description: `${selectedMember.name}'s information has been updated.`,
    });
  };

  // Handle deleting a team member
  const handleDeleteMember = (member) => {
    setSelectedMember(member);
    setShowDeleteDialog(true);
  };

  // Confirm deleting a team member
  const confirmDeleteMember = () => {
    setTeamMembers(teamMembers.filter(member => member.id !== selectedMember.id));
    setShowDeleteDialog(false);
    setSelectedMember(null);
    
    toast({
      title: "Team Member Removed",
      description: `${selectedMember.name} has been removed from your team.`,
    });
  };

  // Handle inviting a new team member
  const handleInviteMember = () => {
    setShowInviteDialog(true);
  };

  // Confirm inviting a new team member
  const confirmInviteMember = () => {
    const newInvite = {
      id: Date.now(),
      email: newInvitation.email,
      role: newInvitation.role,
      sentAt: new Date().toISOString(),
      status: 'pending',
    };
    
    setInvitations([...invitations, newInvite]);
    setShowInviteDialog(false);
    setNewInvitation({
      email: '',
      role: 'recruiter',
    });
    
    toast({
      title: "Invitation Sent",
      description: `An invitation has been sent to ${newInvitation.email}.`,
    });
  };

  // Handle resending an invitation
  const handleResendInvitation = (invitation) => {
    toast({
      title: "Invitation Resent",
      description: `The invitation to ${invitation.email} has been resent.`,
    });
  };

  // Handle canceling an invitation
  const handleCancelInvitation = (invitationId) => {
    setInvitations(invitations.filter(invitation => invitation.id !== invitationId));
    
    toast({
      title: "Invitation Canceled",
      description: "The invitation has been canceled.",
    });
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
          <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
          <p className="text-muted-foreground">
            Manage your company's team members and their roles.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleInviteMember}>
            <MailIcon className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
          <Button onClick={handleAddMember}>
            <UserPlusIcon className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="invitations">Pending Invitations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader className="px-6 py-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Team Members</CardTitle>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <UserIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search members..."
                      className="pl-8 w-full sm:w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                      <SelectItem value="interviewer">Interviewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeamMembers.length > 0 ? (
                    filteredTeamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{member.position}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            member.role === 'admin' ? 'default' : 
                            member.role === 'recruiter' ? 'secondary' : 
                            'outline'
                          }>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.status === 'active' ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMember(member)}
                            >
                              <EditIcon className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMember(member)}
                              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            >
                              <TrashIcon className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No team members found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader className="px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle>Pending Invitations</CardTitle>
                <Button variant="outline" onClick={handleInviteMember}>
                  <MailIcon className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.length > 0 ? (
                    invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>{invitation.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            invitation.role === 'admin' ? 'default' : 
                            invitation.role === 'recruiter' ? 'secondary' : 
                            'outline'
                          }>
                            {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(invitation.sentAt)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendInvitation(invitation)}
                            >
                              <MailIcon className="h-4 w-4" />
                              <span className="sr-only">Resend</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            >
                              <XIcon className="h-4 w-4" />
                              <span className="sr-only">Cancel</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No pending invitations.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Team Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new team member to your company.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name*
              </label>
              <Input
                id="name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="e.g. John Smith"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="position" className="text-sm font-medium">
                Position*
              </label>
              <Input
                id="position"
                value={newMember.position}
                onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                placeholder="e.g. HR Manager"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email*
              </label>
              <Input
                id="email"
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="e.g. john.smith@example.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role*
              </label>
              <Select
                value={newMember.role}
                onValueChange={(value) => setNewMember({ ...newMember, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                  <SelectItem value="interviewer">Interviewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Admin: Full access to all features<br />
                Recruiter: Can manage jobs and candidates<br />
                Interviewer: Can view and provide feedback on candidates
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAddMember}
              disabled={!newMember.name || !newMember.position || !newMember.email}
            >
              Add Team Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Member Dialog */}
      {selectedMember && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
              <DialogDescription>
                Update team member information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Name*
                </label>
                <Input
                  id="edit-name"
                  value={selectedMember.name}
                  onChange={(e) => setSelectedMember({ ...selectedMember, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-position" className="text-sm font-medium">
                  Position*
                </label>
                <Input
                  id="edit-position"
                  value={selectedMember.position}
                  onChange={(e) => setSelectedMember({ ...selectedMember, position: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-email" className="text-sm font-medium">
                  Email*
                </label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedMember.email}
                  onChange={(e) => setSelectedMember({ ...selectedMember, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-role" className="text-sm font-medium">
                  Role*
                </label>
                <Select
                  value={selectedMember.role}
                  onValueChange={(value) => setSelectedMember({ ...selectedMember, role: value })}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="interviewer">Interviewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmEditMember}
                disabled={!selectedMember.name || !selectedMember.position || !selectedMember.email}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Team Member Dialog */}
      {selectedMember && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Team Member</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {selectedMember.name} from your team? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteMember}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Invite Team Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your company.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="invite-email" className="text-sm font-medium">
                Email*
              </label>
              <Input
                id="invite-email"
                type="email"
                value={newInvitation.email}
                onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
                placeholder="e.g. colleague@example.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="invite-role" className="text-sm font-medium">
                Role*
              </label>
              <Select
                value={newInvitation.role}
                onValueChange={(value) => setNewInvitation({ ...newInvitation, role: value })}
              >
                <SelectTrigger id="invite-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                  <SelectItem value="interviewer">Interviewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Admin: Full access to all features<br />
                Recruiter: Can manage jobs and candidates<br />
                Interviewer: Can view and provide feedback on candidates
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmInviteMember}
              disabled={!newInvitation.email}
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
