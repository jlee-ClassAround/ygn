'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

interface RefundCashInput {
    paymentId: string;
    cancelReason: string;
    cancelAmount: string;
    isDeleteEnrollment: boolean;
}

export async function refundCashPayment(values: RefundCashInput) {
    const session = await getSession();

    if (!session?.id) {
        return { success: false, message: 'UNAUTHORIZED' };
    }

    const payment = await db.cashPayment.findUnique({
        where: { id: values.paymentId },
    });

    if (!payment) {
        return { success: false, message: '결제 정보를 찾을 수 없습니다.' };
    }

    const refundInput = Number(values.cancelAmount ?? 0);

    if (isNaN(refundInput) || refundInput <= 0) {
        return { success: false, message: '올바른 환불 금액을 입력해주세요.' };
    }

    // 기존 환불 금액
    const refundedSoFar = payment.cancelAmount ?? 0;
    const totalRefundAfter = refundedSoFar + refundInput;

    if (totalRefundAfter > payment.price) {
        return {
            success: false,
            message: `총 환불 금액이 결제금액(${payment.price.toLocaleString()}원)을 초과합니다.`,
        };
    }

    // 🔥 전액 환불 여부 확인
    const status = totalRefundAfter === payment.price ? 'REFUNDED' : 'PARTIAL_REFUNDED';

    const updated = await db.cashPayment.update({
        where: { id: values.paymentId },
        data: {
            paymentStatus: status,
            cancelAmount: totalRefundAfter, // 누적 환불 금액
            canceledAt: new Date(),
            cancelReason: values.cancelReason || '관리자 환불 처리',
        },
    });

    if (values.isDeleteEnrollment && payment.courseId && payment.userId) {
        await db.enrollment.deleteMany({
            where: {
                userId: payment.userId,
                courseId: payment.courseId,
            },
        });
    }

    revalidatePath('/admin/lecture-payments');

    return {
        success: true,
        message:
            status === 'REFUNDED' ? '전액 환불이 완료되었습니다.' : '부분 환불이 완료되었습니다.',
        data: updated,
    };
}
