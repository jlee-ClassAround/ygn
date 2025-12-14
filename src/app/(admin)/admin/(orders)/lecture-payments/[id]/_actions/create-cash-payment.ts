'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

interface CreateCashPaymentInput {
    userId: string;
    courseId: string;
    ebookId?: string;
    productTitle: string;
    productType: string;
    price: number;
    cancelAmount?: number;
    cancelReason?: string | null;
    createdAt?: Date | null;
}

export async function createCashPaymentAction(input: CreateCashPaymentInput) {
    try {
        const session = await getSession();

        if (!session?.id) {
            return { success: false, error: '관리자 인증 실패' };
        }

        if (!input.userId) {
            return { success: false, error: 'userId 누락' };
        }
        if (!input.courseId) {
            return { success: false, error: 'courseId 누락' };
        }

        const created = await db.cashPayment.create({
            data: {
                productTitle: input.productTitle,
                productType: input.productType,
                price: input.price,
                paymentStatus: 'WAIT',
                cancelAmount: input.cancelAmount ?? 0,
                cancelReason: input.cancelReason ?? null,

                createdAt: input.createdAt ? new Date(input.createdAt) : undefined,

                user: input.userId ? { connect: { id: input.userId } } : undefined,

                admin: session.id ? { connect: { id: session.id } } : undefined,

                course: input.courseId ? { connect: { id: input.courseId } } : undefined,

                ebook: input.ebookId ? { connect: { id: input.ebookId } } : undefined,
            },
        });

        return { success: true, data: created };
    } catch (error) {
        console.error('[CREATE_CASH_PAYMENT_ACTION_ERROR]', error);
        return { success: false, error: 'Server Error' };
    }
}
