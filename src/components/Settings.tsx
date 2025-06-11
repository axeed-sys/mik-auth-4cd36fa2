
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Building, CreditCard, Shield } from 'lucide-react';
import CompanyInfo from './CompanyInfo';
import TwoFactorAuth from './TwoFactorAuth';
import PaystackConfig from './PaystackConfig';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your system settings and company information
        </p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Company Info
          </TabsTrigger>
          <TabsTrigger value="paystack" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Paystack Config
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <CompanyInfo />
        </TabsContent>

        <TabsContent value="paystack">
          <PaystackConfig />
        </TabsContent>

        <TabsContent value="security">
          <TwoFactorAuth />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
