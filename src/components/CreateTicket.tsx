
import React, { useState } from 'react';
import { useUserPortal } from '@/contexts/UserPortalContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, AlertCircle } from 'lucide-react';

const CreateTicket = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserPortal();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a ticket",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and description",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          priority: priority as any,
          status: 'open'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating ticket:', error);
        toast({
          title: "Error Creating Ticket",
          description: "Failed to create ticket. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Ticket Created",
        description: "Your ticket has been submitted successfully. Our team will respond soon.",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Plus className="h-5 w-5" />
          Create New Ticket
        </CardTitle>
        <CardDescription className="text-gray-400">
          Submit a ticket for technical support, billing questions, or report issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-200">
              Subject
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of your issue"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              required
              disabled={isLoading}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-gray-200">
              Priority
            </Label>
            <Select value={priority} onValueChange={setPriority} disabled={isLoading}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="low" className="text-white hover:bg-gray-600">Low</SelectItem>
                <SelectItem value="medium" className="text-white hover:bg-gray-600">Medium</SelectItem>
                <SelectItem value="high" className="text-white hover:bg-gray-600">High</SelectItem>
                <SelectItem value="urgent" className="text-white hover:bg-gray-600">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-200">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide detailed information about your issue, including any error messages or steps to reproduce the problem..."
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[120px]"
              required
              disabled={isLoading}
              maxLength={2000}
            />
            <div className="text-sm text-gray-400">
              {description.length}/2000 characters
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating Ticket...
              </div>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateTicket;
