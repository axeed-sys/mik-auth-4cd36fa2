
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Save, TestTube, Plus, Trash2 } from "lucide-react";
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

const RadiusConfig = () => {
  const { toast } = useToast();
  
  const [radiusServers, setRadiusServers] = useState<RadiusServer[]>([
    { id: "1", name: "Primary Auth", host: "192.168.1.10", port: 1812, secret: "shared-secret-123", status: "online", type: "auth" },
    { id: "2", name: "Primary Accounting", host: "192.168.1.10", port: 1813, secret: "shared-secret-123", status: "online", type: "accounting" },
    { id: "3", name: "Backup Auth", host: "192.168.1.11", port: 1812, secret: "backup-secret-456", status: "offline", type: "auth" },
  ]);

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
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {radiusServers.map((server) => (
                    <TableRow key={server.id}>
                      <TableCell className="font-medium">{server.name}</TableCell>
                      <TableCell>{server.host}</TableCell>
                      <TableCell>{server.port}</TableCell>
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
              <CardTitle>PPPoE User Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profile Name</TableHead>
                    <TableHead>Rate Limit</TableHead>
                    <TableHead>Session Timeout</TableHead>
                    <TableHead>Idle Timeout</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">1Mbps</TableCell>
                    <TableCell>1M/1M</TableCell>
                    <TableCell>0 (unlimited)</TableCell>
                    <TableCell>300s</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">2Mbps</TableCell>
                    <TableCell>2M/2M</TableCell>
                    <TableCell>0 (unlimited)</TableCell>
                    <TableCell>300s</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">5Mbps</TableCell>
                    <TableCell>5M/5M</TableCell>
                    <TableCell>0 (unlimited)</TableCell>
                    <TableCell>600s</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
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
