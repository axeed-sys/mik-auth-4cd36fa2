
import React, { useState } from 'react';
import { PaystackButton } from 'react-paystack';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserPortal } from '@/contexts/UserPortalContext';
import { ArrowLeft, CreditCard, Shield } from 'lucide-react';

interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  features: any;
}

interface PaystackPaymentProps {
  plan: PaymentPlan;
  onBack: () => void;
  onSuccess: () => void;
}

const PaystackPayment: React.FC<PaystackPaymentProps> = ({ plan, onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUserPortal();

  // You'll need to set this in your environment
  const publicKey = "pk_test_your_paystack_public_key"; // Replace with your actual Paystack public key

  const generateReference = () => {
    return `ref_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  const createPaymentRecord = async (reference: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: plan.amount,
          currency: plan.currency,
          reference: reference,
          description: `Payment for ${plan.name}`,
          metadata: {
            plan_id: plan.id,
            plan_name: plan.name,
            billing_cycle: plan.billing_cycle
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment record:', error);
      return null;
    }
  };

  const updatePaymentRecord = async (reference: string, paystackReference: string, status: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          paystack_reference: paystackReference,
          status: status,
          paid_at: status === 'success' ? new Date().toISOString() : null
        })
        .eq('reference', reference);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating payment record:', error);
    }
  };

  const handlePaymentSuccess = async (reference: any) => {
    console.log('Payment successful:', reference);
    await updatePaymentRecord(reference.reference, reference.trxref, 'success');
    
    toast({
      title: "Payment Successful!",
      description: `Your payment for ${plan.name} has been processed successfully.`,
    });
    
    onSuccess();
  };

  const handlePaymentClose = () => {
    toast({
      title: "Payment Cancelled",
      description: "Your payment was cancelled.",
      variant: "destructive",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleInitiatePayment = async () => {
    if (!email || !phone) {
      toast({
        title: "Missing Information",
        description: "Please provide your email and phone number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const reference = generateReference();
    const paymentRecord = await createPaymentRecord(reference);
    
    if (!paymentRecord) {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    setLoading(false);
  };

  const componentProps = {
    email,
    amount: plan.amount * 100, // Paystack expects amount in kobo
    currency: plan.currency,
    metadata: {
      custom_fields: [
        {
          display_name: "Plan",
          variable_name: "plan",
          value: plan.name
        },
        {
          display_name: "User ID",
          variable_name: "user_id",
          value: user?.id || ''
        }
      ]
    },
    publicKey,
    text: `Pay ${formatAmount(plan.amount, plan.currency)}`,
    onSuccess: handlePaymentSuccess,
    onClose: handlePaymentClose,
    reference: generateReference(),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
          <CardDescription>
            Complete your payment for {plan.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Plan Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Billing Cycle:</span>
                <span className="font-medium capitalize">{plan.billing_cycle}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">{formatAmount(plan.amount, plan.currency)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h4 className="font-semibold">Customer Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Secure Payment</p>
              <p className="text-blue-700">
                Your payment is processed securely through Paystack. We don't store your card details.
              </p>
            </div>
          </div>

          {/* Payment Button */}
          <div className="space-y-4">
            {email && phone ? (
              <PaystackButton
                {...componentProps}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
              />
            ) : (
              <Button 
                className="w-full" 
                disabled
                onClick={handleInitiatePayment}
              >
                Enter Email and Phone to Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaystackPayment;
