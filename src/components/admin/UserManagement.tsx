import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Shield, User, UserPlus, Mail } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
  role?: 'admin' | 'user';
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Get all profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          email,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get roles for all users
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with roles (prioritize admin role)
      const usersWithRoles = profiles?.map(profile => {
        const userRoles = roles?.filter(r => r.user_id === profile.user_id) || [];
        // Prioritize admin role over user role
        const primaryRole = userRoles.find(r => r.role === 'admin')?.role || 
                           userRoles.find(r => r.role === 'user')?.role || 'user';
        return {
          ...profile,
          role: primaryRole as 'admin' | 'user'
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading users',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter an email address',
      });
      return;
    }

    setIsInviting(true);
    
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', currentUser?.user?.id)
        .single();

      const response = await supabase.functions.invoke('send-invitation', {
        body: {
          email: inviteEmail.trim(),
          role: inviteRole,
          invitedBy: currentProfile?.email || currentUser?.user?.email || 'Administrator'
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        toast({
          title: 'Invitation sent',
          description: `Invitation email sent to ${inviteEmail}`,
        });
        
        setInviteEmail("");
        setInviteRole('user');
        setIsInviteDialogOpen(false);
        
        // Refresh users list
        loadUsers();
      } else {
        throw new Error(response.data?.error || 'Failed to send invitation');
      }
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        variant: 'destructive',
        title: 'Error sending invitation',
        description: error.message || 'Failed to send invitation',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: 'Role updated',
        description: `User role has been changed to ${newRole}`,
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        variant: 'destructive',
        title: 'Error updating role',
        description: error.message,
      });
    }
  };

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete user data from our tables (profiles and user_roles)
      // Note: We can't delete from auth.users on the client side for security reasons
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) throw roleError;

      // Remove from local state
      setUsers(prev => prev.filter(user => user.user_id !== userId));

      toast({
        title: 'User removed',
        description: `User ${email} has been removed from the system. Note: Their authentication account still exists.`,
      });
    } catch (error: any) {
      console.error('Error removing user:', error);
      toast({
        variant: 'destructive',
        title: 'Error removing user',
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card bg-gradient-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="w-5 h-5" />
            User Management
          </CardTitle>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Send User Invitation
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: 'admin' | 'user') => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsInviteDialogOpen(false);
                      setInviteEmail("");
                      setInviteRole('user');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={sendInvitation}
                    disabled={isInviting}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {isInviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                      className="flex items-center gap-1 w-fit"
                    >
                      {user.role === 'admin' ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value: 'admin' | 'user') => 
                          updateUserRole(user.user_id, value)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUser(user.user_id, user.email)}
                        className="px-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        )}
      </CardContent>
    </Card>
  );
};