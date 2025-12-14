'use server';

import { db } from '@/lib/db';

export async function getLecturePaymentStats({ courseId }: { courseId: string }) {
    try {
        const whereCourse = { courseId, productType: 'COURSE' };

        /** ------------------------------------------------------------------
         * 1) Toss 결제 집계
         * ------------------------------------------------------------------ */
        const tossStats = await db.tossCustomer.aggregate({
            where: whereCourse,
            _sum: {
                finalPrice: true,
                cancelAmount: true,
                couponAmount: true,
            },
            _count: { id: true },
        });

        const couponStats = await db.tossCustomer.aggregate({
            where: {
                ...whereCourse,
                NOT: { couponType: null },
            },
            _count: { id: true },
            _sum: { couponAmount: true },
        });

        const tossRefundCount = await db.tossCustomer.aggregate({
            where: { ...whereCourse, paymentStatus: 'REFUNDED' },
            _count: { id: true },
        });

        /** ------------------------------------------------------------------
         * 2) Cash 결제 집계
         * ------------------------------------------------------------------ */
        const cashStats = await db.cashPayment.aggregate({
            where: whereCourse,
            _sum: {
                price: true,
                cancelAmount: true,
            },
            _count: { id: true },
        });

        const cashRefundCount = await db.cashPayment.aggregate({
            where: { ...whereCourse, paymentStatus: 'REFUNDED' },
            _count: { id: true },
        });

        /** ------------------------------------------------------------------
         * 3) 통합 집계
         * ------------------------------------------------------------------ */

        // 총 주문 수
        const totalOrders = (tossStats._count.id || 0) + (cashStats._count.id || 0);

        // 총 결제 금액 (환불 포함)
        const totalPaymentAmount = (tossStats._sum.finalPrice || 0) + (cashStats._sum.price || 0);

        // 총 환불 금액
        const totalRefundAmount =
            (tossStats._sum.cancelAmount || 0) + (cashStats._sum.cancelAmount || 0);

        // 최종 결제 금액
        const finalPaymentAmount = totalPaymentAmount - totalRefundAmount;

        // 쿠폰 사용 건수 (toss만 존재)
        const couponUsageCount = couponStats._count.id || 0;

        // 총 쿠폰 할인 금액
        const totalDiscountAmount = couponStats._sum.couponAmount || 0;

        // 총 환불 건수
        const refundStatsCount =
            (tossRefundCount._count.id || 0) + (cashRefundCount._count.id || 0);

        return {
            totalOrders, // 전체 주문 수
            totalPaymentAmount, // 총 결제 금액
            totalRefundAmount, // 환불 금액
            finalPaymentAmount, // 최종 매출
            couponUsageCount, // 쿠폰 사용 건수
            totalDiscountAmount, // 총 쿠폰 할인액
            refundStatsCount, // 환불 건수
        };
    } catch (error) {
        console.error('[GET_PAYMENT_STATS_ERROR]', error);
        throw new Error('결제 통계를 불러오는데 실패했습니다.');
    }
}
