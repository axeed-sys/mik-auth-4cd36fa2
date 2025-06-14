
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserPortal } from '@/contexts/UserPortalContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, CreditCard, History, LogOut, Receipt, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import PaymentHistory from '@/components/PaymentHistory';
import PaymentPlans from '@/components/PaymentPlans';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import PaymentReceipts from '@/components/PaymentReceipts';
import UserPortalLogin from '@/components/UserPortalLogin';

const UserPortal = () => {
  const { user, logout, isAuthenticated, loading } = useUserPortal();
  const navigate = useNavigate();

  console.log('UserPortal: Render state -', {
    loading,
    isAuthenticated,
    hasUser: !!user,
    username: user?.username
  });

  const handleLogout = () => {
    console.log('UserPortal: Logging out user');
    logout();
    // Don't navigate immediately, let the context handle the state change
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <div className="text-center space-y-2">
              <h3 className="font-medium text-white">Loading Portal</h3>
              <p className="text-sm text-gray-400">Please wait while we prepare your dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated || !user) {
    return <UserPortalLogin />;
  }

  // Main portal interface for authenticated users
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Customer Portal</h1>
                <p className="text-gray-300">Welcome back, {user.username}</p>
              </div>
              <div className="hidden sm:block">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  user.status === 'active' 
                    ? 'bg-green-900 text-green-300 border border-green-700' 
                    : 'bg-red-900 text-red-300 border border-red-700'
                }`}>
                  {user.status?.toUpperCase()}
                </span>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Account Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Username</label>
                  <p className="text-base font-medium text-white">{user.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Profile</label>
                  <p className="text-base text-gray-300">{user.profile}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-900 text-green-300 border border-green-700' 
                        : 'bg-red-900 text-red-300 border border-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
                {user.ip_address && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">IP Address</label>
                    <p className="text-base font-mono text-blue-400">{user.ip_address}</p>
                  </div>
                )}
                {user.last_login && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">Last Login</label>
                    <p className="text-sm text-gray-300">
                      {new Date(user.last_login).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <SubscriptionStatus />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="plans" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
                <TabsTrigger value="plans" className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
                  <CreditCard className="h-4 w-4" />
                  Payment Plans
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
                  <History className="h-4 w-4" />
                  Payment History
                </TabsTrigger>
                <TabsTrigger value="receipts" className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
                  <Receipt className="h-4 w-4" />
                  Receipts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="plans" className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-white">Available Payment Plans</h2>
                  <p className="text-gray-400 mb-4">Choose a plan that works best for you</p>
                </div>
                <PaymentPlans />
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-white">Payment History</h2>
                  <p className="text-gray-400 mb-4">View your past transactions and payments</p>
                </div>
                <PaymentHistory />
              </TabsContent>

              <TabsContent value="receipts" className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-white">Payment Receipts</h2>
                  <p className="text-gray-400 mb-4">Download and view your payment receipts</p>
                </div>
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
