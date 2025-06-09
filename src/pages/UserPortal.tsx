
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserPortal } from '@/contexts/UserPortalContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, CreditCard, History, LogOut } from 'lucide-react';
import PaymentHistory from '@/components/PaymentHistory';
import PaymentPlans from '@/components/PaymentPlans';
import SubscriptionStatus from '@/components/SubscriptionStatus';

const UserPortal = () => {
  const { user, logout, isAuthenticated } = useUserPortal();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="plans" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Plans
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Payment History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="plans">
                <PaymentPlans />
              </TabsContent>

              <TabsContent value="history">
                <PaymentHistory />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPortal;
