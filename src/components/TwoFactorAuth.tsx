
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldCheck, QrCode } from 'lucide-react';

const TwoFactorAuth = () => {
  const { isTwoFactorEnabled, twoFactorSecret, enableTwoFactor, disableTwoFactor, verifyTwoFactor, credentials } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleEnable2FA = () => {
    const secret = enableTwoFactor();
    setSetupSecret(secret);
    setIsVerifying(true);
    toast({
      title: "2FA Setup Started",
      description: "Add the secret to your authenticator app and verify",
    });
  };

  const handleVerifySetup = () => {
    if (verifyTwoFactor(verificationCode)) {
      setIsVerifying(false);
      setSetupSecret(null);
      setVerificationCode('');
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled",
      });
    } else {
      toast({
        title: "Verification Failed",
        description: "Invalid code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisable2FA = () => {
    disableTwoFactor();
    setIsVerifying(false);
    setSetupSecret(null);
    setVerificationCode('');
    toast({
      title: "2FA Disabled",
      description: "Two-factor authentication has been disabled",
    });
  };

  const generateQRCodeURL = (secret: string) => {
    const issuer = "MikroTik Auth Link";
    const account = credentials.username;
    const otpauthURL = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthURL)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isTwoFactorEnabled ? <ShieldCheck className="h-5 w-5 text-green-600" /> : <Shield className="h-5 w-5" />}
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          {isTwoFactorEnabled 
            ? "Your account is protected with two-factor authentication" 
            : "Add an extra layer of security to your account"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isTwoFactorEnabled && !isVerifying && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Two-factor authentication adds an extra layer of security to your account. 
              You'll need an authenticator app like Google Authenticator or Authy.
            </p>
            <Button onClick={handleEnable2FA} className="w-full">
              Enable Two-Factor Authentication
            </Button>
          </div>
        )}

        {isVerifying && setupSecret && (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-medium mb-2">Step 1: Scan QR Code</h4>
              <div className="flex justify-center mb-4">
                <img 
                  src={generateQRCodeURL(setupSecret)} 
                  alt="QR Code for 2FA setup"
                  className="border rounded"
                />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Or manually enter this secret in your authenticator app:
              </p>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm break-all">
                {setupSecret}
              </code>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification">Step 2: Enter Verification Code</Label>
              <Input
                id="verification"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleVerifySetup} 
                disabled={verificationCode.length !== 6}
                className="flex-1"
              >
                Verify & Enable
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsVerifying(false);
                  setSetupSecret(null);
                  setVerificationCode('');
                  disableTwoFactor();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isTwoFactorEnabled && !isVerifying && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Two-factor authentication is enabled</span>
            </div>
            <p className="text-sm text-gray-600">
              Your account is protected with two-factor authentication. You'll need your authenticator app to sign in.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleDisable2FA}
              className="w-full"
            >
              Disable Two-Factor Authentication
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;
