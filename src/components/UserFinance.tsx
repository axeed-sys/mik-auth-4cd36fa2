
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, History, Receipt } from 'lucide-react';
import PaymentHistory from '@/components/PaymentHistory';
import PaymentPlans from '@/components/PaymentPlans';
import PaymentReceipts from '@/components/PaymentReceipts';

const UserFinance = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Finance</h2>
        <p className="text-gray-400">Manage your payments, subscriptions, and billing information</p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
          <TabsTrigger 
            value="plans" 
            className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700"
          >
            <CreditCard className="h-4 w-4" />
            Payment Plans
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700"
          >
            <History className="h-4 w-4" />
            Payment History
          </TabsTrigger>
          <TabsTrigger 
            value="receipts" 
            className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700"
          >
            <Receipt className="h-4 w-4" />
            Receipts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">Available Payment Plans</h3>
            <p className="text-gray-400 mb-4">Choose a plan that works best for you</p>
          </div>
          <PaymentPlans />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">Payment History</h3>
            <p className="text-gray-400 mb-4">View your past transactions and payments</p>
          </div>
          <PaymentHistory />
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">Payment Receipts</h3>
            <p className="text-gray-400 mb-4">Download and view your payment receipts</p>
          </div>
          <PaymentReceipts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserFinance;
