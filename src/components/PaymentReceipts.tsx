
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, Download, Calendar, CreditCard } from 'lucide-react';
import { useUserPortal } from '@/contexts/UserPortalContext';

interface PaymentReceipt {
  id: string;
  payment_id: string;
  receipt_number: string;
  company_info: any;
  user_info: any;
  payment_details: any;
  issued_at: string;
  created_at: string;
}

const PaymentReceipts = () => {
  const { user } = useUserPortal();

  const { data: receipts, isLoading } = useQuery({
    queryKey: ['payment-receipts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('payment_receipts')
        .select(`
          *,
          payments!inner(user_id)
        `)
        .eq('payments.user_id', user.id)
        .order('issued_at', { ascending: false });
      
      if (error) throw error;
      return data as PaymentReceipt[];
    },
    enabled: !!user
  });

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const downloadReceipt = (receipt: PaymentReceipt) => {
    // Create a simple receipt HTML for download
    const receiptHtml = `
      <html>
        <head>
          <title>Receipt ${receipt.receipt_number}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-info { margin-bottom: 20px; }
            .receipt-details { border: 1px solid #ddd; padding: 20px; }
            .amount { font-size: 24px; font-weight: bold; color: #16a34a; }
          </style>
        </head>
        <body>
          <div class="header">
            ${receipt.company_info.logo_url ? `<img src="${receipt.company_info.logo_url}" alt="Logo" style="max-height: 80px;">` : ''}
            <h1>${receipt.company_info.company_name}</h1>
          </div>
          
          <div class="company-info">
            ${receipt.company_info.address ? `<p><strong>Address:</strong> ${receipt.company_info.address}</p>` : ''}
            ${receipt.company_info.email ? `<p><strong>Email:</strong> ${receipt.company_info.email}</p>` : ''}
            ${receipt.company_info.phone_number ? `<p><strong>Phone:</strong> ${receipt.company_info.phone_number}</p>` : ''}
            ${receipt.company_info.rc_number ? `<p><strong>RC Number:</strong> ${receipt.company_info.rc_number}</p>` : ''}
          </div>

          <div class="receipt-details">
            <h2>Payment Receipt</h2>
            <p><strong>Receipt Number:</strong> ${receipt.receipt_number}</p>
            <p><strong>Date:</strong> ${new Date(receipt.issued_at).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${receipt.user_info.username}</p>
            <p><strong>Description:</strong> ${receipt.payment_details.description || 'Payment'}</p>
            <p class="amount"><strong>Amount:</strong> ${formatAmount(receipt.payment_details.amount, receipt.payment_details.currency)}</p>
            <p><strong>Status:</strong> ${receipt.payment_details.status}</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.receipt_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Receipts</CardTitle>
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

  if (!receipts || receipts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment Receipts
          </CardTitle>
          <CardDescription>Your payment receipts will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">No receipts found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Receipts will be generated after successful payments
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
          Payment Receipts
        </CardTitle>
        <CardDescription>
          Download and view your payment receipts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <p className="font-medium">Receipt #{receipt.receipt_number}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(receipt.issued_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {receipt.payment_details.description || 'Payment'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {formatAmount(receipt.payment_details.amount, receipt.payment_details.currency)}
                  </p>
                  <Badge variant="default">
                    {receipt.payment_details.status}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Company: {receipt.company_info.company_name}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadReceipt(receipt)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentReceipts;
