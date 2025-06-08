
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PPPoEUser {
  id: string;
  username: string;
  profile: string;
  status: string;
  mac_address?: string;
  ip_address?: string;
  last_login?: string;
}

interface UserPortalContextType {
  isAuthenticated: boolean;
  user: PPPoEUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const UserPortalContext = createContext<UserPortalContextType | undefined>(undefined);

export const UserPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<PPPoEUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('pppoe-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pppoe_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid credentials or inactive account' };
      }

      setUser(data);
      setIsAuthenticated(true);
      localStorage.setItem('pppoe-user', JSON.stringify(data));
      
      // Update last login
      await supabase
        .from('pppoe_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('pppoe-user');
  };

  return (
    <UserPortalContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout,
      loading
    }}>
      {children}
    </UserPortalContext.Provider>
  );
};

export const useUserPortal = () => {
  const context = useContext(UserPortalContext);
  if (context === undefined) {
    throw new Error('useUserPortal must be used within a UserPortalProvider');
  }
  return context;
};
