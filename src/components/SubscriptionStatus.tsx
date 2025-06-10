import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserPortal } from '@/contexts/UserPortalContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionDays } from '@/hooks/useSubscriptionDays';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type UserPaymentStatus = Tables<'user_payment_status'>;

const SubscriptionStatus: React.FC = () => {
  const [paymentStatus, setPaymentStatus] = useState<UserPaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUserPortal();
  const { toast } = useToast();
  const subscriptionInfo = useSubscriptionDays(paymentStatus);

  useEffect(() => {
    if (user) {
      fetchPaymentStatus();
    }
  }, [user]);

  const fetchPaymentStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_payment_status')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setPaymentStatus(data);
    } catch (error) {
      console.error('Error fetching payment status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!subscriptionInfo) return 'bg-gray-100 text-gray-800';
    
    if (subscriptionInfo.status === 'blocked') return 'bg-red-100 text-red-800';
    if (subscriptionInfo.status === 'suspended') return 'bg-yellow-100 text-yellow-800';
    if (subscriptionInfo.isOverdue) return 'bg-red-100 text-red-800';
    if (subscriptionInfo.daysLeft <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = () => {
    if (!subscriptionInfo) return 'No subscription found';
    
    if (subscriptionInfo.isOverdue) {
      return `${Math.abs(subscriptionInfo.daysLeft)} days overdue`;
    }
    return `${subscriptionInfo.daysLeft} days remaining`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!paymentStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Subscription Status
          </CardTitle>
          <CardDescription>Your subscription information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">No active subscription found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please contact your administrator to set up payment tracking
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Subscription Status
        </CardTitle>
        <CardDescription>Your current subscription details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Plan Price:</span>
          <span className="font-bold">₦{paymentStatus.plan_price.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge className={getStatusColor()}>
            {paymentStatus.status}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Days Left:</span>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Next Due Date:</span>
          <span className="text-sm flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(paymentStatus.next_due_date).toLocaleDateString()}
          </span>
        </div>

        {paymentStatus.last_payment_date && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Payment:</span>
            <span className="text-sm">
              {new Date(paymentStatus.last_payment_date).toLocaleDateString()}
            </span>
          </div>
        )}

        {subscriptionInfo?.isOverdue && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Payment Overdue</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Your subscription is overdue. Please make a payment to continue using the service.
            </p>
          </div>
        )}

        {subscriptionInfo && !subscriptionInfo.isOverdue && subscriptionInfo.daysLeft <= 7 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Payment Due Soon</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Your subscription expires in {subscriptionInfo.daysLeft} days. Please renew to avoid service interruption.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
