
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserX, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActiveSession {
  id: string;
  username: string;
  ipAddress: string;
  macAddress: string;
  sessionTime: string;
  uploadSpeed: string;
  downloadSpeed: string;
  bytesIn: string;
  bytesOut: string;
  callingStationId: string;
}

const ConnectionMonitor = () => {
  const { toast } = useToast();
  
  const activeSessions: ActiveSession[] = [
    {
      id: "1",
      username: "user001",
      ipAddress: "10.0.1.100",
      macAddress: "AA:BB:CC:DD:EE:01",
      sessionTime: "02:45:30",
      uploadSpeed: "0.8 Mbps",
      downloadSpeed: "0.9 Mbps",
      bytesIn: "250 MB",
      bytesOut: "1.2 GB",
      callingStationId: "pppoe-user001"
    },
    {
      id: "2",
      username: "user045",
      ipAddress: "10.0.1.101",
      macAddress: "AA:BB:CC:DD:EE:02",
      sessionTime: "01:20:15",
      uploadSpeed: "1.5 Mbps",
      downloadSpeed: "1.8 Mbps",
      bytesIn: "180 MB",
      bytesOut: "850 MB",
      callingStationId: "pppoe-user045"
    },
    {
      id: "3",
      username: "user089",
      ipAddress: "10.0.1.103",
      macAddress: "AA:BB:CC:DD:EE:03",
      sessionTime: "00:35:22",
      uploadSpeed: "4.2 Mbps",
      downloadSpeed: "4.8 Mbps",
      bytesIn: "95 MB",
      bytesOut: "320 MB",
      callingStationId: "pppoe-user089"
    }
  ];

  const handleDisconnectUser = (username: string) => {
    toast({
      title: "User Disconnected",
      description: `${username} has been disconnected from the PPPoE server`,
    });
  };

  const handleRefreshSessions = () => {
    toast({
      title: "Sessions Refreshed",
      description: "Active sessions data has been updated",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active PPPoE Sessions</CardTitle>
            <Button onClick={handleRefreshSessions} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{activeSessions.length}</div>
                <p className="text-xs text-muted-foreground">Active Sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">1.2 Gbps</div>
                <p className="text-xs text-muted-foreground">Total Bandwidth</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">42 GB</div>
                <p className="text-xs text-muted-foreground">Data Transferred</p>
              </CardContent>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>MAC Address</TableHead>
                <TableHead>Session Time</TableHead>
                <TableHead>Speed (Up/Down)</TableHead>
                <TableHead>Data (In/Out)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.username}</TableCell>
                  <TableCell>{session.ipAddress}</TableCell>
                  <TableCell className="font-mono text-sm">{session.macAddress}</TableCell>
                  <TableCell>{session.sessionTime}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>↑ {session.uploadSpeed}</div>
                      <div>↓ {session.downloadSpeed}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>In: {session.bytesIn}</div>
                      <div>Out: {session.bytesOut}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDisconnectUser(session.username)}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">142</div>
              <div className="text-sm text-muted-foreground">Successful Auths (24h)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">3</div>
              <div className="text-sm text-muted-foreground">Failed Auths (24h)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">89</div>
              <div className="text-sm text-muted-foreground">Peak Concurrent</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">4.2</div>
              <div className="text-sm text-muted-foreground">Avg Session (hrs)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionMonitor;
