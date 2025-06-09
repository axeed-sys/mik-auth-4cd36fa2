
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Key, Settings as SettingsIcon } from 'lucide-react';
import TwoFactorAuth from './TwoFactorAuth';

const Settings = () => {
  const { credentials, updateCredentials, logout } = useAuth();
  const [newUsername, setNewUsername] = useState(credentials.username);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Paystack configuration state
  const [paystackPublicKey, setPaystackPublicKey] = useState(
    localStorage.getItem('paystack_public_key') || ''
  );
  const [paystackSecretKey, setPaystackSecretKey] = useState(
    localStorage.getItem('paystack_secret_key') || ''
  );
  const [isTestMode, setIsTestMode] = useState(
    localStorage.getItem('paystack_test_mode') === 'true'
  );
  
  const { toast } = useToast();

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    updateCredentials(newUsername, newPassword);
    setNewPassword('');
    setConfirmPassword('');
    
    toast({
      title: "Credentials Updated",
      description: "Your login credentials have been successfully updated",
    });
  };

  const handleUpdatePaystackConfig = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paystackPublicKey.trim()) {
      toast({
        title: "Error",
        description: "Paystack public key is required",
        variant: "destructive",
      });
      return;
    }

    if (!paystackSecretKey.trim()) {
      toast({
        title: "Error",
        description: "Paystack secret key is required",
        variant: "destructive",
      });
      return;
    }

    // Store keys in localStorage (in production, these should be stored securely on the backend)
    localStorage.setItem('paystack_public_key', paystackPublicKey);
    localStorage.setItem('paystack_secret_key', paystackSecretKey);
    localStorage.setItem('paystack_test_mode', isTestMode.toString());
    
    toast({
      title: "Paystack Configuration Updated",
      description: "Your Paystack keys have been successfully saved",
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Tabs defaultValue="credentials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credentials">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Credentials
          </TabsTrigger>
          <TabsTrigger value="paystack">
            <Key className="h-4 w-4 mr-2" />
            Paystack Config
          </TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle>Login Credentials</CardTitle>
              <CardDescription>
                Update your username and password for accessing the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCredentials} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-username">Current Username</Label>
                  <Input
                    id="current-username"
                    type="text"
                    value={credentials.username}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-username">New Username</Label>
                  <Input
                    id="new-username"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Update Credentials
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paystack">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Paystack Configuration
              </CardTitle>
              <CardDescription>
                Configure your Paystack API keys for payment processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePaystackConfig} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paystack-public-key">Public Key</Label>
                  <Input
                    id="paystack-public-key"
                    type="text"
                    value={paystackPublicKey}
                    onChange={(e) => setPaystackPublicKey(e.target.value)}
                    placeholder="pk_test_... or pk_live_..."
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Paystack public key (safe to expose in frontend)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paystack-secret-key">Secret Key</Label>
                  <Input
                    id="paystack-secret-key"
                    type="password"
                    value={paystackSecretKey}
                    onChange={(e) => setPaystackSecretKey(e.target.value)}
                    placeholder="sk_test_... or sk_live_..."
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Paystack secret key (keep this secure)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="test-mode"
                    checked={isTestMode}
                    onChange={(e) => setIsTestMode(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="test-mode" className="text-sm">
                    Test Mode (Use test keys)
                  </Label>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Getting Your Keys</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    You can find your Paystack API keys in your Paystack dashboard:
                  </p>
                  <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                    <li>Login to your Paystack dashboard</li>
                    <li>Navigate to Settings → API Keys & Webhooks</li>
                    <li>Copy your public key and secret key</li>
                    <li>Use test keys for development, live keys for production</li>
                  </ol>
                </div>

                <Button type="submit" className="w-full">
                  Save Paystack Configuration
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <TwoFactorAuth />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
