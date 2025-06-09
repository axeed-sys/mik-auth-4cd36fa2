
import { useMemo } from 'react';

export interface SubscriptionInfo {
  daysLeft: number;
  isOverdue: boolean;
  status: 'active' | 'suspended' | 'blocked';
  nextDueDate: string;
}

export const useSubscriptionDays = (paymentStatus?: {
  next_due_date: string;
  status: 'active' | 'suspended' | 'blocked';
}): SubscriptionInfo | null => {
  return useMemo(() => {
    if (!paymentStatus) return null;

    const dueDate = new Date(paymentStatus.next_due_date);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      daysLeft,
      isOverdue: daysLeft < 0,
      status: paymentStatus.status,
      nextDueDate: paymentStatus.next_due_date
    };
  }, [paymentStatus]);
};
