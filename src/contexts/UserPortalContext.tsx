
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('UserPortalProvider: Initializing - checking for saved user');
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const savedUser = localStorage.getItem('pppoe-user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        console.log('UserPortalProvider: Found saved user:', parsedUser.username);
        
        // Verify the user still exists and is active
        const { data, error } = await supabase
          .from('pppoe_users')
          .select('*')
          .eq('id', parsedUser.id)
          .eq('status', 'active')
          .single();

        if (data && !error) {
          console.log('UserPortalProvider: Verified saved user is still active');
          setUser(data);
          setIsAuthenticated(true);
        } else {
          console.log('UserPortalProvider: Saved user is no longer valid, clearing');
          localStorage.removeItem('pppoe-user');
        }
      } else {
        console.log('UserPortalProvider: No saved user found');
      }
    } catch (error) {
      console.error('UserPortalProvider: Error during initialization:', error);
      localStorage.removeItem('pppoe-user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('UserPortalProvider: Login attempt for username:', username);
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('pppoe_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('UserPortalProvider: Database error during login:', error);
        return { success: false, error: 'Login failed. Please try again.' };
      }

      if (!data) {
        console.log('UserPortalProvider: No matching user found or user inactive');
        return { success: false, error: 'Invalid username or password, or account is inactive.' };
      }

      console.log('UserPortalProvider: Login successful for user:', data.username);
      
      // Update last login timestamp
      try {
        await supabase
          .from('pppoe_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);
      } catch (updateError) {
        console.warn('UserPortalProvider: Failed to update last login time:', updateError);
        // Don't fail the login for this
      }

      // Set user state and save to localStorage
      setUser(data);
      setIsAuthenticated(true);
      localStorage.setItem('pppoe-user', JSON.stringify(data));
      
      return { success: true };
    } catch (error) {
      console.error('UserPortalProvider: Unexpected error during login:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('UserPortalProvider: Logging out user');
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('pppoe-user');
  };

  const contextValue = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <UserPortalContext.Provider value={contextValue}>
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
