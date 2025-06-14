
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const { login, isTwoFactorEnabled } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const result = login(username, password, totpCode);
      
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to MikroTik Auth Link",
        });
        navigate('/');
      } else if (result.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        toast({
          title: "2FA Required",
          description: "Please enter your authenticator code",
        });
      } else {
        toast({
          title: "Login Failed",
          description: requiresTwoFactor ? "Invalid authenticator code" : "Invalid username or password",
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">MikroTik Auth Link</CardTitle>
          <CardDescription className="text-center text-gray-300">
            {requiresTwoFactor ? "Enter your authenticator code" : "Enter your credentials to access the system"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!requiresTwoFactor ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-200">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="totpCode" className="text-gray-200">Authenticator Code</Label>
                <Input
                  id="totpCode"
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  required
                />
                <p className="text-sm text-gray-400">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}
            
            {requiresTwoFactor && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white" 
                onClick={() => {
                  setRequiresTwoFactor(false);
                  setTotpCode('');
                }}
              >
                Back to Login
              </Button>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : (requiresTwoFactor ? "Verify Code" : "Sign In")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
