
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
    { id: "users", label: "User Management" },
    { id: "monitor", label: "Connection Monitor" },
    { id: "config", label: "RADIUS Config" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="bg-white shadow-sm border-r h-full w-64 fixed lg:relative z-10">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-8">MikroTik Auth Link</h1>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onPageChange(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t">
          <Button
            variant="outline"
            className="w-full"
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
