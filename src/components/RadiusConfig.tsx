import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Save, TestTube, Plus, Trash2, Eye, EyeOff, Edit, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RadiusServer {
  id: string;
  name: string;
  host: string;
  port: number;
  secret: string;
  status: "online" | "offline";
  type: "auth" | "accounting";
}

interface UserProfile {
  id: string;
  name: string;
  rateLimit: string;
  sessionTimeout: string;
  idleTimeout: string;
  description?: string;
}

const RadiusConfig = () => {
  const { toast } = useToast();
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [editingHost, setEditingHost] = useState<{ [key: string]: boolean }>({});
  const [editingHostValue, setEditingHostValue] = useState<{ [key: string]: string }>({});
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  
  const [radiusServers, setRadiusServers] = useState<RadiusServer[]>([
    { id: "1", name: "Primary Auth", host: "192.168.1.10", port: 1812, secret: "shared-secret-123", status: "online", type: "auth" },
    { id: "2", name: "Primary Accounting", host: "192.168.1.10", port: 1813, secret: "shared-secret-123", status: "online", type: "accounting" },
    { id: "3", name: "Backup Auth", host: "192.168.1.11", port: 1812, secret: "backup-secret-456", status: "offline", type: "auth" },
  ]);

  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([
    { id: "1", name: "1Mbps", rateLimit: "1M/1M", sessionTimeout: "0", idleTimeout: "300", description: "Basic 1Mbps plan" },
    { id: "2", name: "2Mbps", rateLimit: "2M/2M", sessionTimeout: "0", idleTimeout: "300", description: "Standard 2Mbps plan" },
    { id: "3", name: "5Mbps", rateLimit: "5M/5M", sessionTimeout: "0", idleTimeout: "600", description: "Premium 5Mbps plan" },
  ]);

  const [newProfile, setNewProfile] = useState<Omit<UserProfile, 'id'>>({
    name: "",
    rateLimit: "",
    sessionTimeout: "0",
    idleTimeout: "300",
    description: ""
  });

  const [mikrotikConfig, setMikrotikConfig] = useState({
    radiusEnabled: true,
    radiusTimeout: 3,
    radiusRetries: 3,
    defaultProfile: "default",
    ipPool: "dhcp_pool1",
    dnsServers: "8.8.8.8,8.8.4.4",
    useRadiusAccounting: true,
    interimInterval: 300
  });

  const handleSaveConfig = () => {
    toast({
      title: "Configuration Saved",
      description: "RADIUS configuration has been updated successfully",
    });
  };

  const handleTestConnection = (serverId: string) => {
    const server = radiusServers.find(s => s.id === serverId);
    toast({
      title: "Testing Connection",
      description: `Testing connection to ${server?.name}...`,
    });
    
    // Simulate test result
    setTimeout(() => {
      toast({
        title: "Connection Test",
        description: `Connection to ${server?.name} successful`,
      });
    }, 2000);
  };

  const toggleSecretVisibility = (serverId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [serverId]: !prev[serverId]
    }));
  };

  const startEditingHost = (serverId: string, currentHost: string) => {
    setEditingHost(prev => ({ ...prev, [serverId]: true }));
    setEditingHostValue(prev => ({ ...prev, [serverId]: currentHost }));
  };

  const cancelEditingHost = (serverId: string) => {
    setEditingHost(prev => ({ ...prev, [serverId]: false }));
    setEditingHostValue(prev => ({ ...prev, [serverId]: "" }));
  };

  const saveHost = (serverId: string) => {
    const newHost = editingHostValue[serverId];
    if (!newHost.trim()) {
      toast({
        title: "Error",
        description: "Host cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setRadiusServers(prev => prev.map(server => 
      server.id === serverId ? { ...server, host: newHost.trim() } : server
    ));

    setEditingHost(prev => ({ ...prev, [serverId]: false }));
    setEditingHostValue(prev => ({ ...prev, [serverId]: "" }));

    toast({
      title: "Host Updated",
      description: `Host has been updated to ${newHost.trim()}`,
    });
  };

  const handleCreateProfile = () => {
    if (!newProfile.name || !newProfile.rateLimit) {
      toast({
        title: "Error",
        description: "Profile name and rate limit are required",
        variant: "destructive"
      });
      return;
    }

    const profile: UserProfile = {
      ...newProfile,
      id: Date.now().toString()
    };

    setUserProfiles(prev => [...prev, profile]);
    setNewProfile({
      name: "",
      rateLimit: "",
      sessionTimeout: "0",
      idleTimeout: "300",
      description: ""
    });
    setIsProfileDialogOpen(false);

    toast({
      title: "Profile Created",
      description: `Profile "${profile.name}" has been created successfully`,
    });
  };

  const handleEditProfile = (profile: UserProfile) => {
    setEditingProfile(profile);
    setIsProfileDialogOpen(true);
  };

  const handleUpdateProfile = () => {
    if (!editingProfile || !editingProfile.name || !editingProfile.rateLimit) {
      toast({
        title: "Error",
        description: "Profile name and rate limit are required",
        variant: "destructive"
      });
      return;
    }

    setUserProfiles(prev => prev.map(p => p.id === editingProfile.id ? editingProfile : p));
    setEditingProfile(null);
    setIsProfileDialogOpen(false);

    toast({
      title: "Profile Updated",
      description: `Profile "${editingProfile.name}" has been updated successfully`,
    });
  };

  const handleDeleteProfile = (profileId: string) => {
    const profile = userProfiles.find(p => p.id === profileId);
    setUserProfiles(prev => prev.filter(p => p.id !== profileId));
    
    toast({
      title: "Profile Deleted",
      description: `Profile "${profile?.name}" has been deleted`,
    });
  };

  const resetProfileDialog = () => {
    setEditingProfile(null);
    setNewProfile({
      name: "",
      rateLimit: "",
      sessionTimeout: "0",
      idleTimeout: "300",
      description: ""
    });
    setIsProfileDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="servers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="servers">RADIUS Servers</TabsTrigger>
          <TabsTrigger value="mikrotik">MikroTik Config</TabsTrigger>
          <TabsTrigger value="profiles">User Profiles</TabsTrigger>
        </TabsList>

        <TabsContent value="servers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>RADIUS Server Configuration</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Server
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Secret</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {radiusServers.map((server) => (
                    <TableRow key={server.id}>
                      <TableCell className="font-medium">{server.name}</TableCell>
                      <TableCell>
                        {editingHost[server.id] ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editingHostValue[server.id] || ""}
                              onChange={(e) => setEditingHostValue(prev => ({
                                ...prev,
                                [server.id]: e.target.value
                              }))}
                              className="h-8"
                              placeholder="Enter host IP"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveHost(server.id)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelEditingHost(server.id)}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{server.host}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingHost(server.id, server.host)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{server.port}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm">
                            {showSecrets[server.id] ? server.secret : '••••••••••••'}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSecretVisibility(server.id)}
                          >
                            {showSecrets[server.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={server.type === 'auth' ? 'default' : 'secondary'}>
                          {server.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={server.status === 'online' ? 'default' : 'destructive'}>
                          {server.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTestConnection(server.id)}
                          >
                            <TestTube className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
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
        </TabsContent>

        <TabsContent value="mikrotik">
          <Card>
            <CardHeader>
              <CardTitle>MikroTik PPPoE Server Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="radius-enabled">Enable RADIUS Authentication</Label>
                    <Switch
                      id="radius-enabled"
                      checked={mikrotikConfig.radiusEnabled}
                      onCheckedChange={(checked) => 
                        setMikrotikConfig({ ...mikrotikConfig, radiusEnabled: checked })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="radius-timeout">RADIUS Timeout (seconds)</Label>
                    <Input
                      id="radius-timeout"
                      type="number"
                      value={mikrotikConfig.radiusTimeout}
                      onChange={(e) => 
                        setMikrotikConfig({ ...mikrotikConfig, radiusTimeout: parseInt(e.target.value) })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="radius-retries">RADIUS Retries</Label>
                    <Input
                      id="radius-retries"
                      type="number"
                      value={mikrotikConfig.radiusRetries}
                      onChange={(e) => 
                        setMikrotikConfig({ ...mikrotikConfig, radiusRetries: parseInt(e.target.value) })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="default-profile">Default Profile</Label>
                    <Input
                      id="default-profile"
                      value={mikrotikConfig.defaultProfile}
                      onChange={(e) => 
                        setMikrotikConfig({ ...mikrotikConfig, defaultProfile: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ip-pool">IP Pool</Label>
                    <Input
                      id="ip-pool"
                      value={mikrotikConfig.ipPool}
                      onChange={(e) => 
                        setMikrotikConfig({ ...mikrotikConfig, ipPool: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="dns-servers">DNS Servers</Label>
                    <Input
                      id="dns-servers"
                      value={mikrotikConfig.dnsServers}
                      onChange={(e) => 
                        setMikrotikConfig({ ...mikrotikConfig, dnsServers: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="radius-accounting">Enable RADIUS Accounting</Label>
                    <Switch
                      id="radius-accounting"
                      checked={mikrotikConfig.useRadiusAccounting}
                      onCheckedChange={(checked) => 
                        setMikrotikConfig({ ...mikrotikConfig, useRadiusAccounting: checked })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="interim-interval">Interim Update Interval (seconds)</Label>
                    <Input
                      id="interim-interval"
                      type="number"
                      value={mikrotikConfig.interimInterval}
                      onChange={(e) => 
                        setMikrotikConfig({ ...mikrotikConfig, interimInterval: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveConfig} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>PPPoE User Profiles</CardTitle>
                <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetProfileDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProfile ? 'Edit Profile' : 'Create New Profile'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="profile-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="profile-name"
                          value={editingProfile ? editingProfile.name : newProfile.name}
                          onChange={(e) => {
                            if (editingProfile) {
                              setEditingProfile({ ...editingProfile, name: e.target.value });
                            } else {
                              setNewProfile({ ...newProfile, name: e.target.value });
                            }
                          }}
                          className="col-span-3"
                          placeholder="e.g., 10Mbps"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="rate-limit" className="text-right">
                          Rate Limit
                        </Label>
                        <Input
                          id="rate-limit"
                          value={editingProfile ? editingProfile.rateLimit : newProfile.rateLimit}
                          onChange={(e) => {
                            if (editingProfile) {
                              setEditingProfile({ ...editingProfile, rateLimit: e.target.value });
                            } else {
                              setNewProfile({ ...newProfile, rateLimit: e.target.value });
                            }
                          }}
                          className="col-span-3"
                          placeholder="e.g., 10M/10M"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="session-timeout" className="text-right">
                          Session Timeout
                        </Label>
                        <Input
                          id="session-timeout"
                          value={editingProfile ? editingProfile.sessionTimeout : newProfile.sessionTimeout}
                          onChange={(e) => {
                            if (editingProfile) {
                              setEditingProfile({ ...editingProfile, sessionTimeout: e.target.value });
                            } else {
                              setNewProfile({ ...newProfile, sessionTimeout: e.target.value });
                            }
                          }}
                          className="col-span-3"
                          placeholder="0 for unlimited"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="idle-timeout" className="text-right">
                          Idle Timeout
                        </Label>
                        <Input
                          id="idle-timeout"
                          value={editingProfile ? editingProfile.idleTimeout : newProfile.idleTimeout}
                          onChange={(e) => {
                            if (editingProfile) {
                              setEditingProfile({ ...editingProfile, idleTimeout: e.target.value });
                            } else {
                              setNewProfile({ ...newProfile, idleTimeout: e.target.value });
                            }
                          }}
                          className="col-span-3"
                          placeholder="e.g., 300"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Input
                          id="description"
                          value={editingProfile ? editingProfile.description || '' : newProfile.description}
                          onChange={(e) => {
                            if (editingProfile) {
                              setEditingProfile({ ...editingProfile, description: e.target.value });
                            } else {
                              setNewProfile({ ...newProfile, description: e.target.value });
                            }
                          }}
                          className="col-span-3"
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={resetProfileDialog}>
                        Cancel
                      </Button>
                      <Button onClick={editingProfile ? handleUpdateProfile : handleCreateProfile}>
                        {editingProfile ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profile Name</TableHead>
                    <TableHead>Rate Limit</TableHead>
                    <TableHead>Session Timeout</TableHead>
                    <TableHead>Idle Timeout</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.name}</TableCell>
                      <TableCell>{profile.rateLimit}</TableCell>
                      <TableCell>{profile.sessionTimeout === "0" ? "unlimited" : `${profile.sessionTimeout}s`}</TableCell>
                      <TableCell>{profile.idleTimeout}s</TableCell>
                      <TableCell>{profile.description || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditProfile(profile)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteProfile(profile.id)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RadiusConfig;
