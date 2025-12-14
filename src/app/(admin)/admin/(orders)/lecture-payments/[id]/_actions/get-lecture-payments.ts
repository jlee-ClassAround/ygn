import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { DateRange } from 'react-day-picker';

// ---------------------------------------
//   🔥 finalPrice 정규화 함수
// ---------------------------------------
function getNormalizedPrice(p: any) {
    let price = p.finalPrice ?? 0;

    if (p.paymentStatus === 'REFUNDED') {
        return 0;
    }

    if (p.paymentStatus === 'PARTIAL_REFUNDED') {
        if (p.refundableAmount != null) {
            const adjusted = price - p.refundableAmount;
            return adjusted > 0 ? adjusted : 0;
        }
    }

    return price;
}

// ---------------------------------------
//   🔥 main
// ---------------------------------------
export async function getLecturePayments({
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
    try {
        let whereClause: Prisma.TossCustomerWhereInput = {};

        // 날짜 필터
        if (dateRange?.from) {
            whereClause.createdAt = {
                gte: dateRange.from,
                lte: dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59)) : undefined,
            };
        }

        // 상태 필터
        if (status && status !== 'ALL') {
            whereClause.paymentStatus = status;
        }

        // 상품 타입
        if (type && type !== 'ALL') {
            whereClause.productType = type;
        }

        // courseId + 검색
        if (courseId) {
            if (search) {
                whereClause.AND = [
                    { courseId },
                    {
                        OR: [
                            {
                                user: {
                                    OR: [
                                        { username: { contains: search } },
                                        { email: { contains: search } },
                                        { phone: { contains: search } },
                                    ],
                                },
                            },
                            { course: { title: { contains: search } } },
                            { orderId: { contains: search } },
                            { orderName: { contains: search } },
                        ],
                    },
                ];
            } else {
                whereClause.courseId = courseId;
            }
        } else if (search) {
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
                { course: { title: { contains: search } } },
                { orderId: { contains: search } },
                { orderName: { contains: search } },
            ];
        }

        // ------------------------
        // 1) DB 조회
        // ------------------------
        const paymentsRaw = await db.tossCustomer.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        username: true,
                        email: true,
                        phone: true,
                        createdAt: true,
                    },
                },
                course: { select: { title: true } },
                ebook: { select: { title: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // ------------------------
        // 2) 금액 정규화만 적용하고 그대로 반환
        // ------------------------
        const normalizedPayments = paymentsRaw.map((p) => ({
            ...p,
            normalizedPrice: getNormalizedPrice(p),
        }));

        return normalizedPayments;
    } catch (error) {
        console.error('[GET_PAYMENTS_ERROR]', error);
        throw new Error('결제 내역을 불러오는데 실패했습니다.');
    }
}
