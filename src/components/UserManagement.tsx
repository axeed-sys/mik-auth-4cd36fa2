
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  password: string;
  profile: string;
  status: "active" | "disabled";
  macAddress?: string;
  ipAddress?: string;
  lastLogin?: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([
    { id: "1", username: "user001", password: "pass123", profile: "1Mbps", status: "active", macAddress: "00:11:22:33:44:55", ipAddress: "10.0.1.100", lastLogin: "2024-01-15 14:30" },
    { id: "2", username: "user045", password: "pass456", profile: "2Mbps", status: "active", macAddress: "00:11:22:33:44:66", ipAddress: "10.0.1.101", lastLogin: "2024-01-15 14:25" },
    { id: "3", username: "user127", password: "pass789", profile: "5Mbps", status: "disabled", macAddress: "00:11:22:33:44:77", lastLogin: "2024-01-14 09:15" },
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.macAddress && user.macAddress.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const validateMacAddress = (mac: string): boolean => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  };

  const isMacAddressInUse = (macAddress: string, excludeUserId?: string): boolean => {
    return users.some(user => 
      user.macAddress?.toLowerCase() === macAddress.toLowerCase() && 
      user.id !== excludeUserId
    );
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.profile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newUser.macAddress) {
      if (!validateMacAddress(newUser.macAddress)) {
        toast({
          title: "Error",
          description: "Please enter a valid MAC address (e.g., 00:11:22:33:44:55)",
          variant: "destructive",
        });
        return;
      }

      if (isMacAddressInUse(newUser.macAddress)) {
        toast({
          title: "Error",
          description: "This MAC address is already registered to another user",
          variant: "destructive",
        });
        return;
      }
    }

    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      password: newUser.password,
      profile: newUser.profile,
      status: newUser.status || "active",
      macAddress: newUser.macAddress,
    };

    setUsers([...users, user]);
    setNewUser({});
    setIsAddDialogOpen(false);
    
    toast({
      title: "User Added",
      description: `User ${user.username} has been created successfully`,
    });
  };

  const handleEditUser = () => {
    if (!editingUser) return;

    if (editingUser.macAddress) {
      if (!validateMacAddress(editingUser.macAddress)) {
        toast({
          title: "Error",
          description: "Please enter a valid MAC address (e.g., 00:11:22:33:44:55)",
          variant: "destructive",
        });
        return;
      }

      if (isMacAddressInUse(editingUser.macAddress, editingUser.id)) {
        toast({
          title: "Error",
          description: "This MAC address is already registered to another user",
          variant: "destructive",
        });
        return;
      }
    }

    setUsers(users.map(user => 
      user.id === editingUser.id ? editingUser : user
    ));
    setEditingUser(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "User Updated",
      description: `User ${editingUser.username} has been updated successfully`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "User Deleted",
      description: "User has been removed from the system",
    });
  };

  const openEditDialog = (user: User) => {
    setEditingUser({ ...user });
    setIsEditDialogOpen(true);
  };

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
                      value={newUser.macAddress || ""}
                      onChange={(e) => setNewUser({ ...newUser, macAddress: e.target.value })}
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
                      {user.macAddress || "Not set"}
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
                  <TableCell>{user.ipAddress || "Not assigned"}</TableCell>
                  <TableCell>{user.lastLogin || "Never"}</TableCell>
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
                  value={editingUser.macAddress || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, macAddress: e.target.value })}
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
