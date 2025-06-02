
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserX, Clock, Network, HardDrive } from "lucide-react";
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

interface SessionDetailDialogProps {
  session: ActiveSession | null;
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: (username: string) => void;
}

const SessionDetailDialog = ({ session, isOpen, onClose, onDisconnect }: SessionDetailDialogProps) => {
  const { toast } = useToast();

  if (!session) return null;

  const handleDisconnect = () => {
    onDisconnect(session.username);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Session Details - {session.username}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Network className="h-4 w-4 mr-2" />
                Connection Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Username:</span>
                <span className="text-sm font-medium">{session.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">IP Address:</span>
                <span className="text-sm font-mono">{session.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">MAC Address:</span>
                <span className="text-sm font-mono">{session.macAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Calling Station:</span>
                <span className="text-sm font-mono">{session.callingStationId}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Session Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Session Time:</span>
                <span className="text-sm font-medium">{session.sessionTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Upload Speed:</span>
                <span className="text-sm">{session.uploadSpeed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Download Speed:</span>
                <span className="text-sm">{session.downloadSpeed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="default">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <HardDrive className="h-4 w-4 mr-2" />
                Data Transfer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{session.bytesIn}</div>
                  <div className="text-sm text-muted-foreground">Data In</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{session.bytesOut}</div>
                  <div className="text-sm text-muted-foreground">Data Out</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="destructive" onClick={handleDisconnect}>
            <UserX className="h-4 w-4 mr-2" />
            Disconnect User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionDetailDialog;
