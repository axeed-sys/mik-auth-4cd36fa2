
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Clock, CheckCircle, AlertTriangle, Send, User, Calendar } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  user_id: string;
  pppoe_users?: {
    username: string;
  };
}

interface TicketMessage {
  id: string;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
}

const TicketManagement = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          pppoe_users (
            username
          )
        `)
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
          is_admin_reply: true
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
      
      // Update ticket status to in_progress if it's open
      if (selectedTicket.status === 'open') {
        await updateTicketStatus('in_progress');
      }

      toast({
        title: "Message Sent",
        description: "Your reply has been sent to the user",
      });
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const updateTicketStatus = async (newStatus: string) => {
    if (!selectedTicket) return;

    setIsUpdating(true);
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'resolved' || newStatus === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', selectedTicket.id);

      if (error) {
        console.error('Error updating ticket:', error);
        toast({
          title: "Error",
          description: "Failed to update ticket status",
          variant: "destructive",
        });
        return;
      }

      setSelectedTicket({ ...selectedTicket, status: newStatus });
      fetchTickets();
      
      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsUpdating(false);
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

  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = statusFilter === 'all' || ticket.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

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
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setSelectedTicket(null)}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            ← Back to Tickets
          </Button>

          <div className="flex gap-2">
            <Select
              value={selectedTicket.status}
              onValueChange={updateTicketStatus}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="open" className="text-white hover:bg-gray-600">Open</SelectItem>
                <SelectItem value="in_progress" className="text-white hover:bg-gray-600">In Progress</SelectItem>
                <SelectItem value="resolved" className="text-white hover:bg-gray-600">Resolved</SelectItem>
                <SelectItem value="closed" className="text-white hover:bg-gray-600">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-white">{selectedTicket.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedTicket.pppoe_users?.username || 'Unknown User'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </div>
                </div>
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
                        ? 'bg-green-900/30 border-l-4 border-green-500'
                        : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        {message.is_admin_reply ? 'Admin Support' : selectedTicket.pppoe_users?.username || 'User'}
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

              <div className="space-y-3">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply here..."
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
                      Send Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5" />
            Ticket Management ({filteredTickets.length})
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage and respond to customer support tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-600">All Status</SelectItem>
                  <SelectItem value="open" className="text-white hover:bg-gray-600">Open</SelectItem>
                  <SelectItem value="in_progress" className="text-white hover:bg-gray-600">In Progress</SelectItem>
                  <SelectItem value="resolved" className="text-white hover:bg-gray-600">Resolved</SelectItem>
                  <SelectItem value="closed" className="text-white hover:bg-gray-600">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by Priority" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-600">All Priority</SelectItem>
                  <SelectItem value="low" className="text-white hover:bg-gray-600">Low</SelectItem>
                  <SelectItem value="medium" className="text-white hover:bg-gray-600">Medium</SelectItem>
                  <SelectItem value="high" className="text-white hover:bg-gray-600">High</SelectItem>
                  <SelectItem value="urgent" className="text-white hover:bg-gray-600">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No tickets found</p>
              <p className="text-sm text-gray-500">No tickets match the selected filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 pr-4">
                      <h4 className="font-medium text-white mb-1">{ticket.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.pppoe_users?.username || 'Unknown User'}
                        </span>
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
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
                  <p className="text-sm text-gray-400 truncate">{ticket.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketManagement;
