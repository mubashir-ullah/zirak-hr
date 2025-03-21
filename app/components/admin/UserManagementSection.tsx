import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Search, Plus, Filter, MoreHorizontal, UserPlus, UserMinus, Shield, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Mock user data
const mockUsers = [
  {
    id: '1',
    name: 'Ahmed Khan',
    email: 'ahmed.khan@techinnovations.com',
    role: 'hiring-manager',
    status: 'active',
    lastActive: '2025-03-20T14:30:00',
    avatar: '/images/default-avatar.png'
  },
  {
    id: '2',
    name: 'Fatima Ali',
    email: 'fatima.ali@example.com',
    role: 'talent',
    status: 'active',
    lastActive: '2025-03-21T09:15:00',
    avatar: '/images/default-avatar.png'
  },
  {
    id: '3',
    name: 'Syed Ali',
    email: 'admin@zirak-hr.com',
    role: 'admin',
    status: 'active',
    lastActive: '2025-03-21T05:20:00',
    avatar: '/images/default-avatar.png'
  },
  {
    id: '4',
    name: 'Zara Malik',
    email: 'zara.malik@example.com',
    role: 'talent',
    status: 'inactive',
    lastActive: '2025-03-10T11:45:00',
    avatar: '/images/default-avatar.png'
  },
  {
    id: '5',
    name: 'Omar Hassan',
    email: 'omar.hassan@example.com',
    role: 'hiring-manager',
    status: 'active',
    lastActive: '2025-03-19T16:20:00',
    avatar: '/images/default-avatar.png'
  }
];

export default function UserManagementSection() {
  const [users, setUsers] = useState(mockUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all-users');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const { toast } = useToast();

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter users based on search query and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get users for specific tabs
  const admins = filteredUsers.filter(user => user.role === 'admin');
  const hiringManagers = filteredUsers.filter(user => user.role === 'hiring-manager');
  const talents = filteredUsers.filter(user => user.role === 'talent');

  const handleAddUser = (formData: any) => {
    // In a real app, this would make an API call
    const newUser = {
      id: String(users.length + 1),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'active',
      lastActive: new Date().toISOString(),
      avatar: '/images/default-avatar.png'
    };
    
    setUsers([...users, newUser]);
    setIsAddUserDialogOpen(false);
    
    toast({
      title: 'User Added',
      description: `${formData.name} has been added successfully.`,
    });
  };

  const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    
    const user = users.find(u => u.id === userId);
    
    toast({
      title: 'Status Updated',
      description: `${user?.name}'s status has been updated to ${newStatus}.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    
    setUsers(users.filter(user => user.id !== userId));
    
    toast({
      title: 'User Deleted',
      description: `${user?.name} has been deleted successfully.`,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const UserTable = ({ users }: { users: typeof mockUsers }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
              No users found
            </TableCell>
          </TableRow>
        ) : (
          users.map(user => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={
                  user.role === 'admin' ? 'default' :
                  user.role === 'hiring-manager' ? 'secondary' : 'outline'
                }>
                  {user.role === 'admin' ? 'Admin' : 
                   user.role === 'hiring-manager' ? 'Hiring Manager' : 'Talent'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
                  {user.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(user.lastActive)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
                    </DropdownMenuItem>
                    {user.status === 'active' ? (
                      <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'inactive')}>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Deactivate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'active')}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Activate
                      </DropdownMenuItem>
                    )}
                    {user.role !== 'admin' && (
                      <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        Change Role
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account in the system.
              </DialogDescription>
            </DialogHeader>
            <AddUserForm onSubmit={handleAddUser} onCancel={() => setIsAddUserDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage all users in the Zirak HR platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hiring-manager">Hiring Manager</SelectItem>
                    <SelectItem value="talent">Talent</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all-users">All Users</TabsTrigger>
                <TabsTrigger value="admins">Admins</TabsTrigger>
                <TabsTrigger value="hiring-managers">Hiring Managers</TabsTrigger>
                <TabsTrigger value="talents">Talents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all-users" className="mt-4">
                {isLoading ? (
                  <div className="py-8 text-center">Loading users...</div>
                ) : (
                  <UserTable users={filteredUsers} />
                )}
              </TabsContent>
              
              <TabsContent value="admins" className="mt-4">
                {isLoading ? (
                  <div className="py-8 text-center">Loading admins...</div>
                ) : (
                  <UserTable users={admins} />
                )}
              </TabsContent>
              
              <TabsContent value="hiring-managers" className="mt-4">
                {isLoading ? (
                  <div className="py-8 text-center">Loading hiring managers...</div>
                ) : (
                  <UserTable users={hiringManagers} />
                )}
              </TabsContent>
              
              <TabsContent value="talents" className="mt-4">
                {isLoading ? (
                  <div className="py-8 text-center">Loading talents...</div>
                ) : (
                  <UserTable users={talents} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AddUserForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'talent',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select name="role" value={formData.role} onValueChange={(value) => handleChange({ target: { name: 'role', value } } as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="hiring-manager">Hiring Manager</SelectItem>
              <SelectItem value="talent">Talent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add User
        </Button>
      </DialogFooter>
    </form>
  );
}
