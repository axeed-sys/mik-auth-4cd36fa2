
import { useMemo } from 'react';
import type { Tables } from '@/integrations/supabase/types';

export interface SubscriptionInfo {
  daysLeft: number;
  isOverdue: boolean;
  status: 'active' | 'suspended' | 'blocked';
  nextDueDate: string;
}

type UserPaymentStatus = Tables<'user_payment_status'>;

export const useSubscriptionDays = (paymentStatus?: UserPaymentStatus | null): SubscriptionInfo | null => {
  return useMemo(() => {
    if (!paymentStatus) return null;

    const dueDate = new Date(paymentStatus.next_due_date);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      daysLeft,
      isOverdue: daysLeft < 0,
      status: paymentStatus.status as 'active' | 'suspended' | 'blocked',
      nextDueDate: paymentStatus.next_due_date
    };
  }, [paymentStatus]);
};
