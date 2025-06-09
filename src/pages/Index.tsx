
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import UserManagement from "@/components/UserManagement";
import ConnectionMonitor from "@/components/ConnectionMonitor";
import RadiusConfig from "@/components/RadiusConfig";
import RouterConfig from "@/components/RouterConfig";
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
        return <RadiusConfig />;
      case "router":
        return <RouterConfig />;
      case "payments":
        return <PaymentTracking />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <div className="flex-1 lg:ml-0 ml-0">
        <div className="h-full overflow-auto">
          <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {renderCurrentPage()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
