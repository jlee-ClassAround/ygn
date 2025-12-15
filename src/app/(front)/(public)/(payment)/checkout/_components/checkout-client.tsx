'use client';

import { Course, User } from '@prisma/client';
import { usePaymentsWindow } from '../_hooks/use-payments-window';
import { CheckoutForm } from './checkout-form';
import { OrderSummary } from './order-summary';
import { GetUserBillingInfo } from '@/utils/auth/get-user-billing-info';

interface Props {
    user: User;
}

export default function CheckoutClient({ user }: Props) {
    return <CheckoutForm user={user} />;
}
