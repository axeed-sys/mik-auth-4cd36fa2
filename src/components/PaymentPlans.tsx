
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, Zap, Star, Crown } from 'lucide-react';
import { useUserPortal } from '@/contexts/UserPortalContext';

interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  features: any;
  is_active: boolean;
}

interface PaymentPlansProps {
  onSelectPlan: (plan: PaymentPlan) => void;
}

const PaymentPlans: React.FC<PaymentPlansProps> = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUserPortal();

  useEffect(() => {
    fetchPaymentPlans();
  }, []);

  const fetchPaymentPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('is_active', true)
        .order('amount', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching payment plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('basic')) return <Zap className="h-6 w-6" />;
    if (planName.toLowerCase().includes('standard')) return <Star className="h-6 w-6" />;
    if (planName.toLowerCase().includes('premium')) return <Crown className="h-6 w-6" />;
    return <Zap className="h-6 w-6" />;
  };

  const getPlanColor = (planName: string) => {
    if (planName.toLowerCase().includes('basic')) return 'border-blue-200 hover:border-blue-300';
    if (planName.toLowerCase().includes('standard')) return 'border-green-200 hover:border-green-300';
    if (planName.toLowerCase().includes('premium')) return 'border-purple-200 hover:border-purple-300';
    return 'border-gray-200 hover:border-gray-300';
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold">Choose Your Plan</h3>
        <p className="text-muted-foreground mt-2">Select a plan that fits your internet needs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative transition-all duration-200 ${getPlanColor(plan.name)}`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {getPlanIcon(plan.name)}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {formatAmount(plan.amount, plan.currency)}
                </span>
                <span className="text-muted-foreground">/{plan.billing_cycle}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                {plan.features && Object.entries(plan.features).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm capitalize">
                      {key.replace('_', ' ')}: {value as string}
                    </span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full" 
                onClick={() => onSelectPlan(plan)}
                disabled={!user}
              >
                {user ? 'Select Plan' : 'Login Required'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PaymentPlans;
