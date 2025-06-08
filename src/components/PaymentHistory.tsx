
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserPortal } from '@/contexts/UserPortalContext';
import { Calendar, CreditCard, Receipt, Clock } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  reference: string;
  paystack_reference: string | null;
  status: string;
  payment_method: string | null;
  description: string | null;
  metadata: any;
  paid_at: string | null;
  created_at: string;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUserPortal();

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
    }
  }, [user]);

  const fetchPaymentHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { label: 'Successful', variant: 'default' as const },
      pending: { label: 'Pending', variant: 'secondary' as const },
      failed: { label: 'Failed', variant: 'destructive' as const },
      cancelled: { label: 'Cancelled', variant: 'outline' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>Your payment transactions will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">No payments found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Make your first payment to see it here
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
          <Receipt className="h-5 w-5" />
          Payment History
        </CardTitle>
        <CardDescription>
          View all your payment transactions and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <p className="font-medium">{payment.description || 'Payment'}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(payment.created_at).toLocaleDateString()}
                    </span>
                    <span>Ref: {payment.reference}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {formatAmount(payment.amount, payment.currency)}
                  </p>
                  {getStatusBadge(payment.status)}
                </div>
              </div>

              {payment.metadata?.plan_name && (
                <div className="text-sm text-muted-foreground">
                  Plan: {payment.metadata.plan_name}
                  {payment.metadata.billing_cycle && (
                    <span className="ml-2">({payment.metadata.billing_cycle})</span>
                  )}
                </div>
              )}

              {payment.paid_at && (
                <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                  <Clock className="h-3 w-3" />
                  Paid on {new Date(payment.paid_at).toLocaleString()}
                </div>
              )}

              {payment.paystack_reference && (
                <div className="text-xs text-muted-foreground mt-2">
                  Paystack Ref: {payment.paystack_reference}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
