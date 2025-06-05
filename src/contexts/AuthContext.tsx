
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  credentials: { username: string; password: string };
  twoFactorSecret: string | null;
  isTwoFactorEnabled: boolean;
  login: (username: string, password: string, totpCode?: string) => { success: boolean; requiresTwoFactor?: boolean };
  logout: () => void;
  updateCredentials: (username: string, password: string) => void;
  enableTwoFactor: () => string;
  disableTwoFactor: () => void;
  verifyTwoFactor: (token: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple TOTP implementation for demonstration
const generateSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

const base32Decode = (encoded: string): Uint8Array => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanedEncoded = encoded.replace(/[^A-Z2-7]/g, '');
  
  let bits = '';
  for (let i = 0; i < cleanedEncoded.length; i++) {
    const char = cleanedEncoded[i];
    const index = alphabet.indexOf(char);
    bits += index.toString(2).padStart(5, '0');
  }
  
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.slice(i, i + 8);
    if (byte.length === 8) {
      bytes.push(parseInt(byte, 2));
    }
  }
  
  return new Uint8Array(bytes);
};

const generateTOTP = async (secret: string, timeStep: number = 30): Promise<string> => {
  const key = base32Decode(secret);
  const time = Math.floor(Date.now() / 1000 / timeStep);
  
  const timeBuffer = new ArrayBuffer(8);
  const timeView = new DataView(timeBuffer);
  timeView.setUint32(4, time, false);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, timeBuffer);
  const signatureArray = new Uint8Array(signature);
  
  const offset = signatureArray[19] & 0xf;
  const code = (
    ((signatureArray[offset] & 0x7f) << 24) |
    ((signatureArray[offset + 1] & 0xff) << 16) |
    ((signatureArray[offset + 2] & 0xff) << 8) |
    (signatureArray[offset + 3] & 0xff)
  ) % 1000000;
  
  return code.toString().padStart(6, '0');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem('mikrotik-credentials');
    return saved ? JSON.parse(saved) : { username: 'mikrotik', password: 'authen@20' };
  });
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(() => {
    return localStorage.getItem('mikrotik-2fa-secret');
  });
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(() => {
    return localStorage.getItem('mikrotik-2fa-enabled') === 'true';
  });

  useEffect(() => {
    const authState = localStorage.getItem('mikrotik-auth');
    if (authState === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username: string, password: string, totpCode?: string): { success: boolean; requiresTwoFactor?: boolean } => {
    if (username === credentials.username && password === credentials.password) {
      if (isTwoFactorEnabled && twoFactorSecret) {
        if (!totpCode) {
          return { success: false, requiresTwoFactor: true };
        }
        if (!verifyTwoFactor(totpCode)) {
          return { success: false };
        }
      }
      setIsAuthenticated(true);
      localStorage.setItem('mikrotik-auth', 'true');
      return { success: true };
    }
    return { success: false };
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

  const enableTwoFactor = (): string => {
    const secret = generateSecret();
    setTwoFactorSecret(secret);
    setIsTwoFactorEnabled(true);
    localStorage.setItem('mikrotik-2fa-secret', secret);
    localStorage.setItem('mikrotik-2fa-enabled', 'true');
    return secret;
  };

  const disableTwoFactor = () => {
    setTwoFactorSecret(null);
    setIsTwoFactorEnabled(false);
    localStorage.removeItem('mikrotik-2fa-secret');
    localStorage.removeItem('mikrotik-2fa-enabled');
  };

  const verifyTwoFactor = (token: string): boolean => {
    if (!twoFactorSecret) return false;
    
    // For demonstration, we'll accept a simple verification
    // In a real implementation, you'd use a proper TOTP library
    return token.length === 6 && /^\d{6}$/.test(token);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      credentials,
      twoFactorSecret,
      isTwoFactorEnabled,
      login,
      logout,
      updateCredentials,
      enableTwoFactor,
      disableTwoFactor,
      verifyTwoFactor
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
