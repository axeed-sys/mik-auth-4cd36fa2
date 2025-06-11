
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserPortal } from '@/contexts/UserPortalContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, CreditCard, History, LogOut, Receipt, AlertTriangle, ArrowLeft } from 'lucide-react';
import PaymentHistory from '@/components/PaymentHistory';
import PaymentPlans from '@/components/PaymentPlans';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import PaymentReceipts from '@/components/PaymentReceipts';

const UserPortal = () => {
  const { user, logout, isAuthenticated, loading } = useUserPortal();
  const navigate = useNavigate();

  console.log('UserPortal render - loading:', loading, 'isAuthenticated:', isAuthenticated, 'user:', user);

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('UserPortal: Not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [isAuthenticated, navigate, loading]);

  const handleLogout = () => {
    console.log('UserPortal: Logging out user');
    logout();
    navigate('/login');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-pulse text-center">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You need to be logged in to access the user portal.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleBackToLogin} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Portal</h1>
              <p className="text-gray-600">Welcome back, {user.username}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Username</label>
                  <p className="text-lg">{user.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Profile</label>
                  <p className="text-lg">{user.profile}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </div>
                {user.ip_address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">IP Address</label>
                    <p className="text-lg font-mono">{user.ip_address}</p>
                  </div>
                )}
                {user.last_login && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Login</label>
                    <p className="text-lg">{new Date(user.last_login).toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-6">
              <SubscriptionStatus />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="plans" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="plans" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Plans
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Payment History
                </TabsTrigger>
                <TabsTrigger value="receipts" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Receipts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="plans">
                <PaymentPlans />
              </TabsContent>

              <TabsContent value="history">
                <PaymentHistory />
              </TabsContent>

              <TabsContent value="receipts">
                <PaymentReceipts />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPortal;
