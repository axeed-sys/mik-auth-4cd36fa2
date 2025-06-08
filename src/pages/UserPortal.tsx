import React, { useState } from 'react';
import { useUserPortal } from '@/contexts/UserPortalContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Wifi, User, Activity, Download, Upload, Clock, MapPin, Smartphone, CreditCard, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PaymentPlans from '@/components/PaymentPlans';
import PaystackPayment from '@/components/PaystackPayment';
import PaymentHistory from '@/components/PaymentHistory';

const UserPortalLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useUserPortal();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(username, password);
    
    if (result.success) {
      toast({
        title: "Login Successful",
        description: "Welcome to your user portal",
      });
    } else {
      toast({
        title: "Login Failed",
        description: result.error || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Wifi className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">User Portal</CardTitle>
          <CardDescription>
            Enter your PPPoE credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your PPPoE username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your PPPoE password"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const UserPortalDashboard = () => {
  const { user, logout } = useUserPortal();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);

  // Mock bandwidth data - in real implementation, this would come from your monitoring system
  const bandwidthData = {
    currentUpload: 1.2,
    currentDownload: 4.8,
    maxUpload: 2.0,
    maxDownload: 10.0,
    totalUploaded: "2.3 GB",
    totalDownloaded: "15.7 GB",
    monthlyQuota: "100 GB",
    quotaUsed: 18.0
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const getBandwidthColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 80) return "bg-red-500";
    if (percentage > 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const BandwidthBar = ({ current, max, label }: { current: number; max: number; label: string }) => {
    const percentage = Math.min((current / max) * 100, 100);
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{current.toFixed(1)}/{max.toFixed(1)} Mbps</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getBandwidthColor(current, max)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedPlan(null);
    toast({
      title: "Payment Successful!",
      description: "Your payment has been processed successfully.",
    });
  };

  const handleBackToPlans = () => {
    setShowPayment(false);
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Wifi className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">User Portal</h1>
              <p className="text-muted-foreground">Welcome, {user?.username}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="payments">Make Payment</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Profile Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant={user?.status === 'active' ? 'default' : 'destructive'}>
                      {user?.status || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Profile</div>
                    <div className="font-medium">{user?.profile || 'Not assigned'}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      IP Address
                    </div>
                    <div className="font-mono text-sm">{user?.ip_address || 'Not assigned'}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Smartphone className="h-4 w-4" />
                      MAC Address
                    </div>
                    <div className="font-mono text-sm">{user?.mac_address || 'Not available'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Bandwidth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Bandwidth Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BandwidthBar 
                    current={bandwidthData.currentUpload} 
                    max={bandwidthData.maxUpload} 
                    label="Upload Speed" 
                  />
                  <BandwidthBar 
                    current={bandwidthData.currentDownload} 
                    max={bandwidthData.maxDownload} 
                    label="Download Speed" 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data Consumption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{bandwidthData.totalUploaded}</div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Upload className="h-4 w-4" />
                      Total Uploaded
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{bandwidthData.totalDownloaded}</div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Download className="h-4 w-4" />
                      Total Downloaded
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{bandwidthData.monthlyQuota}</div>
                    <div className="text-sm text-muted-foreground">Monthly Quota</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{bandwidthData.quotaUsed}%</div>
                    <div className="text-sm text-muted-foreground">Quota Used</div>
                  </div>
                </div>
                
                {/* Quota Usage Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Monthly Data Usage</span>
                    <span className="font-medium">{bandwidthData.quotaUsed}% of {bandwidthData.monthlyQuota}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        bandwidthData.quotaUsed > 90 ? 'bg-red-500' : 
                        bandwidthData.quotaUsed > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(bandwidthData.quotaUsed, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Last Login</div>
                    <div className="font-medium">
                      {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Account Created</div>
                    <div className="font-medium">January 15, 2024</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Connection Status</div>
                    <Badge variant="default">Online</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            {showPayment && selectedPlan ? (
              <PaystackPayment
                plan={selectedPlan}
                onBack={handleBackToPlans}
                onSuccess={handlePaymentSuccess}
              />
            ) : (
              <PaymentPlans onSelectPlan={handleSelectPlan} />
            )}
          </TabsContent>

          <TabsContent value="history">
            <PaymentHistory />
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Profile
                </CardTitle>
                <CardDescription>
                  View and manage your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Username</Label>
                      <Input value={user?.username || ''} disabled />
                    </div>
                    <div>
                      <Label>Profile Plan</Label>
                      <Input value={user?.profile || ''} disabled />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Input value={user?.status || ''} disabled />
                    </div>
                    <div>
                      <Label>Last Login</Label>
                      <Input 
                        value={user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'} 
                        disabled 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const UserPortal = () => {
  const { isAuthenticated } = useUserPortal();
  
  return isAuthenticated ? <UserPortalDashboard /> : <UserPortalLogin />;
};

export default UserPortal;
