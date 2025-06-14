
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import UserManagement from "@/components/UserManagement";
import ConnectionMonitor from "@/components/ConnectionMonitor";
import ConfigSection from "@/components/ConfigSection";
import PaymentTracking from "@/components/PaymentTracking";
import Settings from "@/components/Settings";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <UserManagement />;
      case "monitor":
        return <ConnectionMonitor />;
      case "config":
        return <ConfigSection />;
      case "finance":
        return <PaymentTracking />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-900">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b border-gray-700 bg-gray-800">
            <SidebarTrigger className="text-white hover:bg-gray-700" />
            <div className="ml-auto"></div>
          </header>
          
          <div className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8">
              {renderCurrentPage()}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
