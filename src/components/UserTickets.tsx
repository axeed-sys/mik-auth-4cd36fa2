
import React, { useState, useEffect } from 'react';
import { useUserPortal } from '@/contexts/UserPortalContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Clock, CheckCircle, AlertTriangle, Send } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

interface TicketMessage {
  id: string;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
}

const UserTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { user } = useUserPortal();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        toast({
          title: "Error",
          description: "Failed to load tickets",
          variant: "destructive",
        });
        return;
      }

      setTickets(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          message: newMessage.trim(),
          is_admin_reply: false
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        return;
      }

      setNewMessage('');
      fetchMessages(selectedTicket.id);
      toast({
        title: "Message Sent",
        description: "Your message has been added to the ticket",
      });
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-900 text-blue-300 border-blue-700';
      case 'in_progress':
        return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'resolved':
        return 'bg-green-900 text-green-300 border-green-700';
      case 'closed':
        return 'bg-gray-900 text-gray-300 border-gray-700';
      default:
        return 'bg-gray-900 text-gray-300 border-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-900 text-gray-300 border-gray-700';
      case 'medium':
        return 'bg-blue-900 text-blue-300 border-blue-700';
      case 'high':
        return 'bg-orange-900 text-orange-300 border-orange-700';
      case 'urgent':
        return 'bg-red-900 text-red-300 border-red-700';
      default:
        return 'bg-gray-900 text-gray-300 border-gray-700';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto" />
            <p className="text-gray-400">Loading tickets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedTicket) {
    return (
      <div className="space-y-6">
        <Button
          onClick={() => setSelectedTicket(null)}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          ← Back to Tickets
        </Button>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-white">{selectedTicket.title}</CardTitle>
                <CardDescription className="text-gray-400">
                  Created {new Date(selectedTicket.created_at).toLocaleString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={`${getPriorityColor(selectedTicket.priority)} border`}>
                  {selectedTicket.priority.toUpperCase()}
                </Badge>
                <Badge className={`${getStatusColor(selectedTicket.status)} border flex items-center gap-1`}>
                  {getStatusIcon(selectedTicket.status)}
                  {selectedTicket.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Original Description:</h4>
              <p className="text-gray-300 whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversation ({messages.length})
              </h4>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.is_admin_reply
                        ? 'bg-blue-900/30 border-l-4 border-blue-500'
                        : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        {message.is_admin_reply ? 'Admin Support' : 'You'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{message.message}</p>
                  </div>
                ))}
                
                {messages.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No messages yet</p>
                )}
              </div>

              {selectedTicket.status !== 'closed' && (
                <div className="space-y-3">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    disabled={isSending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </div>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageSquare className="h-5 w-5" />
          My Tickets ({tickets.length})
        </CardTitle>
        <CardDescription className="text-gray-400">
          View and manage your support tickets
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No tickets found</p>
            <p className="text-sm text-gray-500">Create your first ticket to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white truncate pr-4">{ticket.title}</h4>
                  <div className="flex gap-2 flex-shrink-0">
                    <Badge className={`${getPriorityColor(ticket.priority)} border text-xs`}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(ticket.status)} border flex items-center gap-1 text-xs`}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-400 truncate mb-2">{ticket.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                  <span>Updated {new Date(ticket.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTickets;
