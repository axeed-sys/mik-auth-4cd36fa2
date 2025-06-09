
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserPaymentStatus {
  id: string;
  user_id: string;
  plan_price: number;
  last_payment_date: string | null;
  next_due_date: string;
  status: 'active' | 'suspended' | 'blocked';
  auto_block_enabled: boolean;
  created_at: string;
  updated_at: string;
  pppoe_users?: {
    username: string;
    profile: string;
    status: string;
  };
}

const PaymentTracking = () => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [formData, setFormData] = useState({
    plan_price: '',
    auto_block_enabled: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users for the dropdown
  const { data: users } = useQuery({
    queryKey: ['pppoe-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pppoe_users')
        .select('id, username, profile, status')
        .order('username');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch payment tracking data
  const { data: paymentStatuses, isLoading } = useQuery({
    queryKey: ['payment-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_payment_status' as any)
        .select(`
          *,
          pppoe_users (
            username,
            profile,
            status
          )
        `)
        .order('next_due_date', { ascending: true });
      
      if (error) throw error;
      return data as UserPaymentStatus[];
    }
  });

  const addPaymentTrackingMutation = useMutation({
    mutationFn: async (data: { user_id: string; plan_price: number; auto_block_enabled: boolean }) => {
      const nextDueDate = new Date();
      nextDueDate.setDate(nextDueDate.getDate() + 30); // 30 days from now

      const { data: result, error } = await supabase
        .from('user_payment_status' as any)
        .insert([{
          user_id: data.user_id,
          plan_price: data.plan_price,
          next_due_date: nextDueDate.toISOString(),
          auto_block_enabled: data.auto_block_enabled
        }])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-status'] });
      setSelectedUserId('');
      setFormData({ plan_price: '', auto_block_enabled: true });
      toast({
        title: "Payment Tracking Added",
        description: "User payment tracking has been successfully configured",
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'suspended' | 'blocked' }) => {
      const { data, error } = await supabase
        .from('user_payment_status' as any)
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-status'] });
      toast({
        title: "Status Updated",
        description: "User status has been successfully updated",
      });
    }
  });

  const extendDueDateMutation = useMutation({
    mutationFn: async ({ id, days }: { id: string; days: number }) => {
      const currentDueDate = paymentStatuses?.find(p => p.id === id)?.next_due_date;
      if (!currentDueDate) throw new Error('Due date not found');

      const newDueDate = new Date(currentDueDate);
      newDueDate.setDate(newDueDate.getDate() + days);

      const { data, error } = await supabase
        .from('user_payment_status' as any)
        .update({ 
          next_due_date: newDueDate.toISOString(),
          last_payment_date: new Date().toISOString(),
          status: 'active'
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-status'] });
      toast({
        title: "Due Date Extended",
        description: "Payment due date has been successfully extended",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId || !formData.plan_price) {
      toast({
        title: "Error",
        description: "Please select a user and enter plan price",
        variant: "destructive",
      });
      return;
    }

    addPaymentTrackingMutation.mutate({
      user_id: selectedUserId,
      plan_price: parseFloat(formData.plan_price),
      auto_block_enabled: formData.auto_block_enabled
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string, daysUntilDue: number) => {
    if (status === 'blocked') return 'bg-red-100 text-red-800';
    if (status === 'suspended') return 'bg-yellow-100 text-yellow-800';
    if (daysUntilDue <= 0) return 'bg-red-100 text-red-800';
    if (daysUntilDue <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading payment tracking data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Payment Tracking & Auto-Block
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor user payments and automatically block users after 30 days without payment
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Payment Tracking</CardTitle>
          <CardDescription>
            Configure payment tracking for a user with automatic blocking after 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_select">Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username} ({user.profile})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_price">Plan Price (NGN)</Label>
                <Input
                  id="plan_price"
                  type="number"
                  step="0.01"
                  value={formData.plan_price}
                  onChange={(e) => setFormData({ ...formData, plan_price: e.target.value })}
                  placeholder="5000.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Auto-Block Settings</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_block"
                    checked={formData.auto_block_enabled}
                    onChange={(e) => setFormData({ ...formData, auto_block_enabled: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="auto_block" className="text-sm">Enable auto-block after 30 days</Label>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={addPaymentTrackingMutation.isPending}>
              Add Payment Tracking
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Status Overview</CardTitle>
          <CardDescription>
            Monitor all users' payment status and due dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentStatuses && paymentStatuses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Plan Price</TableHead>
                  <TableHead>Last Payment</TableHead>
                  <TableHead>Next Due Date</TableHead>
                  <TableHead>Days Until Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentStatuses.map((payment) => {
                  const daysUntilDue = getDaysUntilDue(payment.next_due_date);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.pppoe_users?.username}
                      </TableCell>
                      <TableCell>₦{payment.plan_price.toLocaleString()}</TableCell>
                      <TableCell>
                        {payment.last_payment_date 
                          ? new Date(payment.last_payment_date).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        {new Date(payment.next_due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          daysUntilDue <= 0 ? 'bg-red-100 text-red-800' :
                          daysUntilDue <= 7 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {daysUntilDue > 0 ? `${daysUntilDue} days` : `${Math.abs(daysUntilDue)} days overdue`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payment.status, daysUntilDue)}`}>
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select
                            value={payment.status}
                            onValueChange={(value: 'active' | 'suspended' | 'blocked') => 
                              updateStatusMutation.mutate({ id: payment.id, status: value })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => extendDueDateMutation.mutate({ id: payment.id, days: 30 })}
                            disabled={extendDueDateMutation.isPending}
                          >
                            Extend 30 Days
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No payment tracking configured yet. Add users to start monitoring payments.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTracking;
