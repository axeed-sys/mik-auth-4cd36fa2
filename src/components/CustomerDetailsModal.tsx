
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Receipt, Download, Calendar, CreditCard } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type User = Tables<'pppoe_users'>;
type UserPaymentStatus = Tables<'user_payment_status'>;

interface CustomerDetailsModalProps {
  customer: User | null;
  isOpen: boolean;
  onClose: () => void;
}

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

const CustomerDetailsModal = ({ customer, isOpen, onClose }: CustomerDetailsModalProps) => {
  const { data: receipts, isLoading: receiptsLoading } = useQuery({
    queryKey: ['customer-receipts', customer?.id],
    queryFn: async () => {
      if (!customer) return [];
      
      const { data, error } = await supabase
        .from('payment_receipts')
        .select(`
          *,
          payments!inner(user_id)
        `)
        .eq('payments.user_id', customer.id)
        .order('issued_at', { ascending: false });
      
      if (error) throw error;
      return data as PaymentReceipt[];
    },
    enabled: !!customer && isOpen
  });

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const downloadReceipt = (receipt: PaymentReceipt) => {
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

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Details - {customer.username}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Information
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Username</label>
                    <p className="text-lg">{customer.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Profile</label>
                    <p className="text-lg">{customer.profile}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">MAC Address</label>
                    <p className="text-lg font-mono">{customer.mac_address || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">IP Address</label>
                    <p className="text-lg font-mono">{customer.ip_address || "Not assigned"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Login</label>
                    <p className="text-lg">{customer.last_login ? new Date(customer.last_login).toLocaleString() : "Never"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-lg">{new Date(customer.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Updated</label>
                    <p className="text-lg">{new Date(customer.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Payment Receipts
                </CardTitle>
                <CardDescription>
                  Download and view payment receipts for this customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                {receiptsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : !receipts || receipts.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No receipts found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receipts will be generated after successful payments
                    </p>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsModal;
