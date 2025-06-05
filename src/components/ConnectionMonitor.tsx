
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserX, RefreshCw, Activity, Pause, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SessionDetailDialog from "./SessionDetailDialog";

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
  currentUpload?: number; // in Mbps
  currentDownload?: number; // in Mbps
  maxUpload?: number; // in Mbps
  maxDownload?: number; // in Mbps
}

const ConnectionMonitor = () => {
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
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
      callingStationId: "pppoe-user001",
      currentUpload: 0.6,
      currentDownload: 0.7,
      maxUpload: 2.0,
      maxDownload: 5.0
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
      callingStationId: "pppoe-user045",
      currentUpload: 1.2,
      currentDownload: 1.4,
      maxUpload: 3.0,
      maxDownload: 10.0
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
      callingStationId: "pppoe-user089",
      currentUpload: 3.8,
      currentDownload: 4.2,
      maxUpload: 5.0,
      maxDownload: 15.0
    }
  ]);

  // Simulate live bandwidth updates
  useEffect(() => {
    if (!isLiveMonitoring) return;

    const interval = setInterval(() => {
      setActiveSessions(prevSessions => 
        prevSessions.map(session => ({
          ...session,
          currentUpload: Math.max(0, (session.currentUpload || 0) + (Math.random() - 0.5) * 0.4),
          currentDownload: Math.max(0, (session.currentDownload || 0) + (Math.random() - 0.5) * 0.6),
          uploadSpeed: `${Math.max(0, (session.currentUpload || 0) + (Math.random() - 0.5) * 0.4).toFixed(1)} Mbps`,
          downloadSpeed: `${Math.max(0, (session.currentDownload || 0) + (Math.random() - 0.5) * 0.6).toFixed(1)} Mbps`
        }))
      );
      setLastUpdate(new Date());
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isLiveMonitoring]);

  const handleDisconnectUser = (username: string) => {
    toast({
      title: "User Disconnected",
      description: `${username} has been disconnected from the PPPoE server`,
    });
  };

  const handleRefreshSessions = () => {
    // Simulate bandwidth data refresh
    setActiveSessions(prevSessions => 
      prevSessions.map(session => ({
        ...session,
        currentUpload: Math.random() * (session.maxUpload || 2),
        currentDownload: Math.random() * (session.maxDownload || 5)
      }))
    );
    setLastUpdate(new Date());
    toast({
      title: "Sessions Refreshed",
      description: "Active sessions and bandwidth data has been updated",
    });
  };

  const toggleLiveMonitoring = () => {
    setIsLiveMonitoring(!isLiveMonitoring);
    toast({
      title: isLiveMonitoring ? "Live Monitoring Paused" : "Live Monitoring Started",
      description: isLiveMonitoring ? "Bandwidth updates paused" : "Real-time bandwidth monitoring enabled",
    });
  };

  const handleRowClick = (session: ActiveSession) => {
    setSelectedSession(session);
    setIsDialogOpen(true);
  };

  const getBandwidthUsageColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 80) return "bg-red-500";
    if (percentage > 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const BandwidthBar = ({ current, max, label }: { current: number; max: number; label: string }) => {
    const percentage = Math.min((current / max) * 100, 100);
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{label}</span>
          <span>{current.toFixed(1)}/{max.toFixed(1)} Mbps</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getBandwidthUsageColor(current, max)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Active PPPoE Sessions
              </CardTitle>
              <Badge variant={isLiveMonitoring ? "default" : "secondary"}>
                {isLiveMonitoring ? "Live" : "Paused"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
              <Button onClick={toggleLiveMonitoring} variant="outline" size="sm">
                {isLiveMonitoring ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isLiveMonitoring ? "Pause" : "Resume"}
              </Button>
              <Button onClick={handleRefreshSessions} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
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
                <div className="text-2xl font-bold">
                  {activeSessions.reduce((sum, session) => sum + (session.currentDownload || 0), 0).toFixed(1)} Mbps
                </div>
                <p className="text-xs text-muted-foreground">Total Download</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {activeSessions.reduce((sum, session) => sum + (session.currentUpload || 0), 0).toFixed(1)} Mbps
                </div>
                <p className="text-xs text-muted-foreground">Total Upload</p>
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
                <TableHead>Live Bandwidth</TableHead>
                <TableHead>Data (In/Out)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSessions.map((session) => (
                <TableRow 
                  key={session.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(session)}
                >
                  <TableCell className="font-medium">{session.username}</TableCell>
                  <TableCell>{session.ipAddress}</TableCell>
                  <TableCell className="font-mono text-sm">{session.macAddress}</TableCell>
                  <TableCell>{session.sessionTime}</TableCell>
                  <TableCell className="min-w-[200px]">
                    <div className="space-y-2">
                      <BandwidthBar 
                        current={session.currentUpload || 0} 
                        max={session.maxUpload || 2} 
                        label="↑ Upload" 
                      />
                      <BandwidthBar 
                        current={session.currentDownload || 0} 
                        max={session.maxDownload || 5} 
                        label="↓ Download" 
                      />
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDisconnectUser(session.username);
                      }}
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

      <SessionDetailDialog
        session={selectedSession}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onDisconnect={handleDisconnectUser}
      />
    </div>
  );
};

export default ConnectionMonitor;
