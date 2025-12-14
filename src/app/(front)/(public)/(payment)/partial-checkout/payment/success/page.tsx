import { RequestPaymentProps } from '@/app/(front)/(public)/(payment)/payment/success/_hooks/use-request-payment';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { PaymentSuccess } from './_components/payment-success';
import { db } from '@/lib/db';

export const metadata: Metadata = {
    title: '결제 인증',
};

const paymentSchema = z.object({
    paymentType: z.string().optional(),
    orderId: z.string().uuid(),
    paymentKey: z.string(),
    amount: z.coerce.number(),

    productId: z.string().uuid(),
    productOptionId: z.string().optional(),
    userId: z.string().uuid(),
    couponId: z.string().uuid().optional(),
});

interface Props {
    searchParams: Promise<RequestPaymentProps>;
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
    const searchParamsData = await searchParams;
    const { success, data, error } = paymentSchema.safeParse(searchParamsData);

    if (!success) {
        console.log('[PAYMENT_SUCCESS_PAGE_ERROR]', error.flatten());
        return notFound();
    }

    const virtualAccount = await db.virtualAccount.findUnique({
        where: {
            paymentId: data.orderId,
        },
    });

    const payment = await db.payment.findUnique({
        where: {
            id: data.orderId,
        },
        select: {
            order: {
                select: {
                    orderName: true,
                    orderNumber: true,
                },
            },
        },
    });

    return (
        <PaymentSuccess
            data={data}
            virtualAccount={virtualAccount}
            orderNumber={payment?.order?.orderNumber ?? ''}
            orderName={payment?.order?.orderName ?? ''}
        />
    );
}
