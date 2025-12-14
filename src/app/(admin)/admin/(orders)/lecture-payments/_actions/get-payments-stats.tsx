'use server';

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { DateRange } from 'react-day-picker';

export async function getPaymentStats({
    dateRange,
    status,
    type,
    courseId,
    search,
}: {
    dateRange?: DateRange;
    status?: string;
    type?: string;
    courseId?: string;
    search?: string;
} = {}) {
    let whereClause: Prisma.TossCustomerWhereInput = {};

    // -----------------------------
    // 1) 날짜 필터
    // -----------------------------
    if (dateRange?.from) {
        whereClause.createdAt = {
            gte: dateRange.from,
            lte: dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59)) : undefined,
        };
    }

    // -----------------------------
    // 2) 상태 필터
    // -----------------------------
    if (status && status !== 'ALL') {
        whereClause.paymentStatus = status;
    }

    // -----------------------------
    // 3) 타입 필터 (COURSE / EBOOK)
    // -----------------------------
    if (type && type !== 'ALL') {
        whereClause.productType = type;
    }

    // -----------------------------
    // 4) 강의 필터
    // -----------------------------
    if (courseId && type === 'COURSE') {
        whereClause.courseId = courseId;
    }

    // -----------------------------
    // 5) 검색 필터
    // -----------------------------
    if (search) {
        whereClause.OR = [
            {
                user: {
                    OR: [
                        { username: { contains: search } },
                        { email: { contains: search } },
                        { phone: { contains: search } },
                    ],
                },
            },
            {
                course: {
                    title: { contains: search },
                },
            },
        ];
    }

    try {
        // =============================================
        // ⭐ 1) 카드/계좌/가상계좌(tossCustomer)
        // =============================================
        const totalStats = await db.tossCustomer.aggregate({
            where: whereClause,
            _sum: {
                finalPrice: true,
                cancelAmount: true,
            },
            _count: {
                id: true,
            },
        });

        const typeStats = await db.tossCustomer.groupBy({
            where: whereClause,
            by: ['productType'],
            _sum: {
                finalPrice: true,
                cancelAmount: true,
            },
            _count: { id: true },
        });

        const couponStats = await db.tossCustomer.aggregate({
            where: {
                AND: [whereClause, { NOT: { couponType: null } }],
            },
            _count: { id: true },
            _sum: { couponAmount: true },
        });

        // =============================================
        // ⭐ 2) 현금 결제(cashPayments)
        // =============================================

        // 🔍 cashPayment where조건 재구성 (toss와 동일하게 처리)
        const cashWhere: any = {};

        if (dateRange?.from) {
            cashWhere.createdAt = whereClause.createdAt;
        }

        if (status && status !== 'ALL') {
            cashWhere.paymentStatus = status;
        }

        if (type && type !== 'ALL') {
            cashWhere.productType = type;
        }

        if (courseId && type === 'COURSE') {
            cashWhere.courseId = courseId;
        }

        // 🔍 검색 처리 (userJoin 필요)
        if (search) {
            cashWhere.OR = [
                {
                    user: {
                        OR: [{ username: { contains: search } }, { phone: { contains: search } }],
                    },
                },
            ];
        }

        // -----------------------
        // DB 조회
        // -----------------------
        const cashPayments = await db.cashPayment.findMany({
            where: cashWhere,
            include: {
                user: { select: { username: true, phone: true } },
            },
        });

        // -----------------------
        // 현금통계 환산
        // -----------------------
        const cashTotalRevenue = cashPayments.reduce((acc, c) => {
            const price = c.paymentStatus === 'REFUNDED' ? 0 : c.price - (c.cancelAmount ?? 0);
            return acc + price;
        }, 0);

        const cashTotalOrders = cashPayments.length;

        const cashCourseRevenue = cashPayments
            .filter((c) => c.productType === 'COURSE')
            .reduce((acc, c) => acc + (c.price - (c.cancelAmount ?? 0)), 0);

        const cashEbookRevenue = cashPayments
            .filter((c) => c.productType === 'EBOOK')
            .reduce((acc, c) => acc + (c.price - (c.cancelAmount ?? 0)), 0);

        const cashRefundAmount = cashPayments.reduce((acc, c) => acc + (c.cancelAmount ?? 0), 0);

        // =============================================
        // ⭐ 3) 최종 합산 결과 (toss + cash)
        // =============================================
        const tossRevenue = (totalStats._sum.finalPrice || 0) - (totalStats._sum.cancelAmount || 0);

        return {
            // 총 매출
            totalRevenue: tossRevenue + cashTotalRevenue,

            // 주문 수량 합산
            totalOrders: (totalStats._count.id || 0) + cashTotalOrders,

            // 상품별 매출
            courseRevenue:
                (typeStats.find((t) => t.productType === 'COURSE')?._sum.finalPrice || 0) -
                (typeStats.find((t) => t.productType === 'COURSE')?._sum.cancelAmount || 0) +
                cashCourseRevenue,

            ebookRevenue:
                (typeStats.find((t) => t.productType === 'EBOOK')?._sum.finalPrice || 0) -
                (typeStats.find((t) => t.productType === 'EBOOK')?._sum.cancelAmount || 0) +
                cashEbookRevenue,

            // 쿠폰
            couponUsageCount: couponStats._count.id || 0,
            totalDiscountAmount: couponStats._sum.couponAmount || 0,

            // 환불 금액
            totalRefundAmount: (totalStats._sum.cancelAmount || 0) + cashRefundAmount,
        };
    } catch (error) {
        console.error('[GET_PAYMENT_STATS_ERROR]', error);
        throw new Error('결제 통계를 불러오는데 실패했습니다.');
    }
}
