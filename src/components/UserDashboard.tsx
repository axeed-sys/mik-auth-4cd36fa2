
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserPortal } from '@/contexts/UserPortalContext';
import { User, Activity, Clock, Wifi } from 'lucide-react';
import SubscriptionStatus from '@/components/SubscriptionStatus';

const UserDashboard = () => {
  const { user } = useUserPortal();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400">Overview of your account and service status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Account Status Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Account Status</CardTitle>
            <User className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{user?.status?.toUpperCase()}</div>
            <p className="text-xs text-gray-400 mt-1">
              Profile: {user?.profile}
            </p>
          </CardContent>
        </Card>

        {/* Connection Status Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Connection</CardTitle>
            <Wifi className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">Connected</div>
            <p className="text-xs text-gray-400 mt-1">
              IP: {user?.ip_address || 'N/A'}
            </p>
          </CardContent>
        </Card>

        {/* Last Login Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Last Login</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-white">
              {user?.last_login 
                ? new Date(user.last_login).toLocaleDateString()
                : 'Never'
              }
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {user?.last_login 
                ? new Date(user.last_login).toLocaleTimeString()
                : ''
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <p className="text-base font-medium text-white">{user?.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">Profile</label>
              <p className="text-base text-gray-300">{user?.profile}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">Status</label>
              <div className="mt-1">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  user?.status === 'active' 
                    ? 'bg-green-900 text-green-300 border border-green-700' 
                    : 'bg-red-900 text-red-300 border border-red-700'
                }`}>
                  {user?.status}
                </span>
              </div>
            </div>
            {user?.mac_address && (
              <div>
                <label className="text-sm font-medium text-gray-400">MAC Address</label>
                <p className="text-base font-mono text-blue-400">{user.mac_address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <SubscriptionStatus />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
