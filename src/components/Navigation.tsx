
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  Monitor, 
  Settings as SettingsIcon, 
  DollarSign, 
  Cog,
  LogOut,
  MessageSquare
} from "lucide-react";

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
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Customer Management", icon: Users },
    { id: "monitor", label: "Connection Monitor", icon: Monitor },
    { id: "config", label: "Config", icon: Cog },
    { id: "finance", label: "Finance", icon: DollarSign },
    { id: "tickets", label: "Support Tickets", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <Sidebar className="bg-gray-800 border-r border-gray-600">
      <SidebarHeader className="p-6 bg-gray-800">
        <h1 className="text-xl font-bold text-white">MikroTik Auth Link</h1>
      </SidebarHeader>
      
      <SidebarContent className="bg-gray-800">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300 text-sm font-medium mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onPageChange(item.id)}
                    isActive={currentPage === item.id}
                    className={`w-full justify-start text-left ${
                      currentPage === item.id 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "text-gray-200 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 bg-gray-800">
        <Button
          variant="outline"
          className="w-full border-gray-500 text-gray-200 hover:bg-gray-700 hover:text-white hover:border-gray-400"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default Navigation;
