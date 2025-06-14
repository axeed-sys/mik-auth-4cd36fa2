
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation = ({ currentPage, onPageChange }: NavigationProps) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "users", label: "Customer Management" },
    { id: "monitor", label: "Connection Monitor" },
    { id: "config", label: "Config" },
    { id: "finance", label: "Finance" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="bg-gray-800 shadow-sm border-r border-gray-700 h-full w-64 fixed lg:relative z-10">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white mb-8">MikroTik Auth Link</h1>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${
                currentPage === item.id 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => onPageChange(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <Button
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
