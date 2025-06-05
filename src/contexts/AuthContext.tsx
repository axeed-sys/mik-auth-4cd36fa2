
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  credentials: { username: string; password: string };
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateCredentials: (username: string, password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem('mikrotik-credentials');
    return saved ? JSON.parse(saved) : { username: 'mikrotik', password: 'authen@20' };
  });

  useEffect(() => {
    const authState = localStorage.getItem('mikrotik-auth');
    if (authState === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === credentials.username && password === credentials.password) {
      setIsAuthenticated(true);
      localStorage.setItem('mikrotik-auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('mikrotik-auth');
  };

  const updateCredentials = (username: string, password: string) => {
    const newCredentials = { username, password };
    setCredentials(newCredentials);
    localStorage.setItem('mikrotik-credentials', JSON.stringify(newCredentials));
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      credentials,
      login,
      logout,
      updateCredentials
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
