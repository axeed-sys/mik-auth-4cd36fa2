
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  username: string;
  password: string;
  profile: string;
  status: "active" | "disabled";
  mac_address?: string;
  ip_address?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('pppoe_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users from database",
          variant: "destructive",
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.mac_address && user.mac_address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const validateMacAddress = (mac: string): boolean => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.profile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newUser.mac_address) {
      if (!validateMacAddress(newUser.mac_address)) {
        toast({
          title: "Error",
          description: "Please enter a valid MAC address (e.g., 00:11:22:33:44:55)",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .from('pppoe_users')
        .insert([
          {
            username: newUser.username,
            password: newUser.password,
            profile: newUser.profile,
            status: newUser.status || "active",
            mac_address: newUser.mac_address || null,
          }
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505' && error.message.includes('unique_mac_address')) {
          toast({
            title: "Error",
            description: "This MAC address is already registered to another user",
            variant: "destructive",
          });
        } else if (error.code === '23505' && error.message.includes('username')) {
          toast({
            title: "Error",
            description: "This username already exists",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to create user",
            variant: "destructive",
          });
        }
        return;
      }

      setUsers([data, ...users]);
      setNewUser({});
      setIsAddDialogOpen(false);
      
      toast({
        title: "User Added",
        description: `User ${data.username} has been created successfully`,
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    if (editingUser.mac_address) {
      if (!validateMacAddress(editingUser.mac_address)) {
        toast({
          title: "Error",
          description: "Please enter a valid MAC address (e.g., 00:11:22:33:44:55)",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .from('pppoe_users')
        .update({
          username: editingUser.username,
          password: editingUser.password,
          profile: editingUser.profile,
          status: editingUser.status,
          mac_address: editingUser.mac_address || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingUser.id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505' && error.message.includes('unique_mac_address')) {
          toast({
            title: "Error",
            description: "This MAC address is already registered to another user",
            variant: "destructive",
          });
        } else if (error.code === '23505' && error.message.includes('username')) {
          toast({
            title: "Error",
            description: "This username already exists",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update user",
            variant: "destructive",
          });
        }
        return;
      }

      setUsers(users.map(user => 
        user.id === editingUser.id ? data : user
      ));
      setEditingUser(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "User Updated",
        description: `User ${data.username} has been updated successfully`,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('pppoe_users')
        .delete()
        .eq('id', userId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
        return;
      }

      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "User Deleted",
        description: "User has been removed from the system",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser({ ...user });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>PPPoE User Management</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New PPPoE User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUser.username || ""}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password || ""}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="macAddress">MAC Address (Optional)</Label>
                    <Input
                      id="macAddress"
                      value={newUser.mac_address || ""}
                      onChange={(e) => setNewUser({ ...newUser, mac_address: e.target.value })}
                      placeholder="e.g., 00:11:22:33:44:55"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile">Profile</Label>
                    <Select onValueChange={(value) => setNewUser({ ...newUser, profile: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select profile" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1Mbps">1 Mbps</SelectItem>
                        <SelectItem value="2Mbps">2 Mbps</SelectItem>
                        <SelectItem value="5Mbps">5 Mbps</SelectItem>
                        <SelectItem value="10Mbps">10 Mbps</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={(value) => setNewUser({ ...newUser, status: value as "active" | "disabled" })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddUser} className="w-full">
                    Create User
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users, profiles, or MAC addresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>MAC Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.profile}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {user.mac_address || "Not set"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>{user.ip_address || "Not assigned"}</TableCell>
                  <TableCell>{user.last_login ? new Date(user.last_login).toLocaleString() : "Never"}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit PPPoE User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="edit-password">Password</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="edit-macAddress">MAC Address</Label>
                <Input
                  id="edit-macAddress"
                  value={editingUser.mac_address || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, mac_address: e.target.value })}
                  placeholder="e.g., 00:11:22:33:44:55"
                />
              </div>
              <div>
                <Label htmlFor="edit-profile">Profile</Label>
                <Select value={editingUser.profile} onValueChange={(value) => setEditingUser({ ...editingUser, profile: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1Mbps">1 Mbps</SelectItem>
                    <SelectItem value="2Mbps">2 Mbps</SelectItem>
                    <SelectItem value="5Mbps">5 Mbps</SelectItem>
                    <SelectItem value="10Mbps">10 Mbps</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editingUser.status} onValueChange={(value) => setEditingUser({ ...editingUser, status: value as "active" | "disabled" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEditUser} className="w-full">
                Update User
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
