
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserPortal } from '@/contexts/UserPortalContext';
import { Settings, Wifi, Monitor, Router } from 'lucide-react';

const UserService = () => {
  const { user } = useUserPortal();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Service Management</h2>
        <p className="text-gray-400">Manage your internet service settings and information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Details */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Settings className="h-5 w-5" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Service Profile</label>
              <p className="text-base font-medium text-white">{user?.profile}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">Username</label>
              <p className="text-base text-gray-300">{user?.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">Service Status</label>
              <div className="mt-1">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  user?.status === 'active' 
                    ? 'bg-green-900 text-green-300 border border-green-700' 
                    : 'bg-red-900 text-red-300 border border-red-700'
                }`}>
                  {user?.status?.toUpperCase()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Wifi className="h-5 w-5" />
              Connection Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.ip_address && (
              <div>
                <label className="text-sm font-medium text-gray-400">Current IP Address</label>
                <p className="text-base font-mono text-blue-400">{user.ip_address}</p>
              </div>
            )}
            {user?.mac_address && (
              <div>
                <label className="text-sm font-medium text-gray-400">MAC Address</label>
                <p className="text-base font-mono text-gray-300">{user.mac_address}</p>
              </div>
            )}
            {user?.last_login && (
              <div>
                <label className="text-sm font-medium text-gray-400">Last Connection</label>
                <p className="text-sm text-gray-300">
                  {new Date(user.last_login).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <Router className="h-5 w-5" />
            Service Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <Monitor className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h3 className="font-medium text-white">Connection Status</h3>
              <p className="text-sm text-gray-400 mt-1">
                {user?.status === 'active' ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <Wifi className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h3 className="font-medium text-white">Network Profile</h3>
              <p className="text-sm text-gray-400 mt-1">{user?.profile}</p>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <Settings className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h3 className="font-medium text-white">Service Type</h3>
              <p className="text-sm text-gray-400 mt-1">PPPoE Internet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserService;
