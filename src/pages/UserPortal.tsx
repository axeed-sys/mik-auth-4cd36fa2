
import React, { useState } from 'react';
import { useUserPortal } from '@/contexts/UserPortalContext';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import UserPortalLogin from '@/components/UserPortalLogin';
import UserPortalSidebar from '@/components/UserPortalSidebar';
import UserDashboard from '@/components/UserDashboard';
import UserService from '@/components/UserService';
import SupportTickets from '@/components/SupportTickets';
import UserFinance from '@/components/UserFinance';

const UserPortal = () => {
  const { user, isAuthenticated, loading } = useUserPortal();
  const [currentSection, setCurrentSection] = useState("dashboard");

  console.log('UserPortal: Render state -', {
    loading,
    isAuthenticated,
    hasUser: !!user,
    username: user?.username
  });

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

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "dashboard":
        return <UserDashboard />;
      case "service":
        return <UserService />;
      case "support":
        return <SupportTickets />;
      case "finance":
        return <UserFinance />;
      default:
        return <UserDashboard />;
    }
  };

  // Main portal interface for authenticated users
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-900">
        <UserPortalSidebar 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection} 
        />
        
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b border-gray-700 bg-gray-800">
            <SidebarTrigger className="text-white hover:bg-gray-700" />
            <div className="ml-auto">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                user.status === 'active' 
                  ? 'bg-green-900 text-green-300 border border-green-700' 
                  : 'bg-red-900 text-red-300 border border-red-700'
              }`}>
                {user.status?.toUpperCase()}
              </span>
            </div>
          </header>
          
          <div className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8">
              {renderCurrentSection()}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UserPortal;
