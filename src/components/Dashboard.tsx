
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wifi, Shield, Activity } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RADIUS Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">All servers responding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2 Gbps</div>
            <p className="text-xs text-muted-foreground">Peak: 1.8 Gbps</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Authentications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: "user001", ip: "10.0.1.100", time: "2 min ago", status: "success" },
                { user: "user045", ip: "10.0.1.101", time: "5 min ago", status: "success" },
                { user: "user127", ip: "10.0.1.102", time: "8 min ago", status: "failed" },
                { user: "user089", ip: "10.0.1.103", time: "12 min ago", status: "success" },
              ].map((auth, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${auth.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-medium">{auth.user}</p>
                      <p className="text-sm text-muted-foreground">{auth.ip}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{auth.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MikroTik Router Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>RouterOS Version</span>
                <span className="font-medium">7.10.2</span>
              </div>
              <div className="flex items-center justify-between">
                <span>PPPoE Server</span>
                <span className="text-green-600 font-medium">Running</span>
              </div>
              <div className="flex items-center justify-between">
                <span>RADIUS Client</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span>IP Pool</span>
                <span className="font-medium">10.0.1.0/24</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
