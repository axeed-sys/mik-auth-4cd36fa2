
import React from "react";
import { Button } from "@/components/ui/button";
import { useUserPortal } from "@/contexts/UserPortalContext";
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
  Settings, 
  DollarSign,
  LogOut,
  MessageSquare
} from "lucide-react";

interface UserPortalSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const UserPortalSidebar = ({ currentSection, onSectionChange }: UserPortalSidebarProps) => {
  const { logout, user } = useUserPortal();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "service", label: "Service", icon: Settings },
    { id: "support", label: "Support", icon: MessageSquare },
    { id: "finance", label: "Finance", icon: DollarSign },
  ];

  return (
    <Sidebar className="bg-gray-800 border-r border-gray-600">
      <SidebarHeader className="p-6 bg-gray-800">
        <div>
          <h1 className="text-xl font-bold text-white">Customer Portal</h1>
          <p className="text-sm text-gray-300">Welcome, {user?.username}</p>
        </div>
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
                    onClick={() => onSectionChange(item.id)}
                    isActive={currentSection === item.id}
                    className={`w-full justify-start text-left ${
                      currentSection === item.id 
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

export default UserPortalSidebar;
