
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Plus } from 'lucide-react';
import CreateTicket from './CreateTicket';
import UserTickets from './UserTickets';

const SupportTickets = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-white">Support Tickets</h2>
        <p className="text-gray-400 mb-4">Get help with technical issues, billing questions, or report problems</p>
      </div>

      <Tabs defaultValue="my-tickets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
          <TabsTrigger 
            value="my-tickets" 
            className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700"
          >
            <MessageSquare className="h-4 w-4" />
            My Tickets
          </TabsTrigger>
          <TabsTrigger 
            value="create-ticket" 
            className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
            Create Ticket
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-tickets" className="space-y-6">
          <UserTickets />
        </TabsContent>

        <TabsContent value="create-ticket" className="space-y-6">
          <CreateTicket />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportTickets;
