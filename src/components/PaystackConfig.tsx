
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Eye, EyeOff, Save } from 'lucide-react';

const PaystackConfig = () => {
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing keys from localStorage
    const storedPublicKey = localStorage.getItem('paystack_public_key');
    const storedSecretKey = localStorage.getItem('paystack_secret_key');
    
    if (storedPublicKey) setPublicKey(storedPublicKey);
    if (storedSecretKey) setSecretKey(storedSecretKey);
  }, []);

  const handleSave = async () => {
    if (!publicKey.trim() || !secretKey.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both public and secret keys.",
        variant: "destructive",
      });
      return;
    }

    if (!publicKey.startsWith('pk_')) {
      toast({
        title: "Invalid Public Key",
        description: "Paystack public key should start with 'pk_'",
        variant: "destructive",
      });
      return;
    }

    if (!secretKey.startsWith('sk_')) {
      toast({
        title: "Invalid Secret Key",
        description: "Paystack secret key should start with 'sk_'",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Store keys in localStorage
      localStorage.setItem('paystack_public_key', publicKey.trim());
      localStorage.setItem('paystack_secret_key', secretKey.trim());
      
      toast({
        title: "Configuration Saved",
        description: "Paystack API keys have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('paystack_public_key');
    localStorage.removeItem('paystack_secret_key');
    setPublicKey('');
    setSecretKey('');
    toast({
      title: "Configuration Cleared",
      description: "Paystack API keys have been removed.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paystack Configuration
        </CardTitle>
        <CardDescription>
          Configure your Paystack API keys to enable payment processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="public-key">Public Key</Label>
          <Input
            id="public-key"
            type="text"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
          <p className="text-xs text-muted-foreground">
            Your Paystack public key (starts with pk_)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secret-key">Secret Key</Label>
          <div className="relative">
            <Input
              id="secret-key"
              type={showSecretKey ? "text" : "password"}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowSecretKey(!showSecretKey)}
            >
              {showSecretKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your Paystack secret key (starts with sk_)
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use test keys for development (pk_test_ and sk_test_)</li>
            <li>• Use live keys for production (pk_live_ and sk_live_)</li>
            <li>• Keep your secret key secure and never share it</li>
            <li>• Keys are stored locally in your browser</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear Keys
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaystackConfig;
