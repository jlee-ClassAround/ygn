import { dbMysql } from '@/lib/db-mysql';
import { db } from '@/lib/db';

/** -----------------------------------
 *  공통 금액 정규화 함수
 ----------------------------------- */
function getNormalizedPrice(p: any) {
    let price = p.finalPrice ?? p.price ?? 0;

    if (p.paymentStatus === 'REFUNDED') return 0;

    if (p.paymentStatus === 'PARTIAL_REFUNDED') {
        if (p.refundableAmount != null) {
            price = p.refundableAmount;
        }
    }

    return price;
}

interface Props {
    freeCourseId: string | null;
    courseId?: string | null; // ⭐ 필요할 수 있어 추가
    payments: any[];
}

export async function getTrackingMergedPayments({ freeCourseId, courseId, payments }: Props) {
    const defaultReturn = {
        payments,
        trackingStats: {},
        newUserStats: {},
        trackingSummary: {},
    };

    if (!freeCourseId) return defaultReturn;

    let cashPayments: any[] = [];
    if (courseId) {
        cashPayments = await db.cashPayment.findMany({
            where: { courseId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        phone: true,
                        createdAt: true,
                    },
                },
                admin: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        // tossCustomer 포맷으로 맞춰주기
        cashPayments = cashPayments.map((c) => ({
            id: c.id,
            paymentMethod: 'CASH',
            productType: 'COURSE',
            productTitle: c.productTitle,
            paymentStatus: c.paymentStatus,
            price: c.price,
            cancelAmount: c.cancelAmount,
            finalPrice: c.price, // cash는 finalPrice로 price 사용
            refundableAmount: c.price - (c.cancelAmount || 0),
            createdAt: c.createdAt,
            userId: c.user.id,
            user: c.user,
            admin: c.admin,
            completedAt: c.completedAt,
            canceledAt: c.canceledAt,
            cancelReason: c.cancelReason,
        }));
    }

    /** -----------------------------------------
     * ▶▶ payments + cashPayments 병합
     ----------------------------------------- */
    const mergedOriginalPayments = [...payments, ...cashPayments];

    /** -----------------------------------------
     * 1) lecture 조회
     ----------------------------------------- */
    const lecture = await dbMysql.lecture.findFirst({
        where: { landing_url: { endsWith: `free-courses/${freeCourseId}` } },
        select: { id: true },
    });
    if (!lecture) return defaultReturn;

    /** -----------------------------------------
     * 2) tracking_history 조회
     ----------------------------------------- */
    const trackings = await dbMysql.tracking_history.findMany({
        where: { lecture_id: lecture.id },
        select: {
            id: true,
            parameter_name: true,
            medium_id: true,
            member: {
                select: { billing_phone: true, created_at: true },
            },
        },
    });

    /** -----------------------------------------
     * 3) medium 이름 매핑
     ----------------------------------------- */
    const mediumIds = Array.from(
        new Set(
            trackings.map((t) => t.medium_id).filter((id): id is string => typeof id === 'string')
        )
    );

    const mediums = await dbMysql.medium.findMany({
        where: { id: { in: mediumIds } },
        select: { id: true, name: true },
    });

    const mediumMap = new Map<string, string>();
    mediums.forEach((m) => mediumMap.set(m.id, m.name));

    /** -----------------------------------------
     * 4) published_at 매핑
     ----------------------------------------- */
    const parameterNames = Array.from(
        new Set(
            trackings
                .map((t) => t.parameter_name)
                .filter((name): name is string => typeof name === 'string')
        )
    );

    const trackingMeta = await dbMysql.tracking.findMany({
        where: { parameter_name: { in: parameterNames } },
        select: { parameter_name: true, published_at: true },
    });

    const publishedAtMap = new Map<string, Date>();
    trackingMeta.forEach((t) => {
        if (t.parameter_name && t.published_at) {
            publishedAtMap.set(t.parameter_name, t.published_at);
        }
    });

    /** -----------------------------------------
     * 5) phone 기준 tracking 매핑
     ----------------------------------------- */
    const trackingByPhone = new Map();
    for (const t of trackings) {
        const phone = t.member?.billing_phone;
        if (!phone) continue;

        if (!trackingByPhone.has(phone)) {
            trackingByPhone.set(phone, {
                parameterName: t.parameter_name || '',
                mediumName: t.medium_id ? mediumMap.get(t.medium_id) ?? null : null,
                publishedAt: publishedAtMap.get(t.parameter_name || '') || null,
            });
        }
    }

    /** -----------------------------------------
     * 6) mergedOriginalPayments + tracking merge
     ----------------------------------------- */
    const merged = mergedOriginalPayments.map((p) => {
        const tracking = p.user?.phone ? trackingByPhone.get(p.user.phone) || null : null;

        return {
            ...p,
            normalizedPrice: getNormalizedPrice(p),
            trackingBy: tracking,
        };
    });

    /** -----------------------------------------
     * 7~11번 로직 그대로
     ----------------------------------------- */

    /** -----------------------------------------
     * 7) trackingStats (총 매출)
     ----------------------------------------- */
    const trackingRevenueMap = new Map<string, number>();

    for (const p of merged) {
        const medium = p.trackingBy?.mediumName ?? '기타';
        const price = p.normalizedPrice;
        trackingRevenueMap.set(medium, (trackingRevenueMap.get(medium) || 0) + price);
    }

    /** -----------------------------------------
     * 8) 신규유입 newUserStats
     ----------------------------------------- */
    const newUserStats = new Map();

    for (const p of merged) {
        const tracking = p.trackingBy;
        if (!tracking) continue;

        const medium = tracking.mediumName ?? '기타';
        const publishedAt = tracking.publishedAt;
        if (!publishedAt) continue;

        const userCreatedAt = p.user?.createdAt;
        if (!userCreatedAt) continue;

        const isNew = new Date(userCreatedAt) > new Date(publishedAt);
        if (!isNew) continue;

        if (!newUserStats.has(medium)) {
            newUserStats.set(medium, {
                newCount: 0,
                newPaymentCount: 0,
                newPaymentRevenue: 0,
            });
        }

        const stat = newUserStats.get(medium);
        stat.newCount++;

        if (['DONE', 'COMPLETED', 'SUCCESS'].includes(p.paymentStatus)) {
            stat.newPaymentCount++;
            stat.newPaymentRevenue += p.normalizedPrice;
        }
    }

    /** -----------------------------------------
     * 9-0) medium별 전체 유입 수
     ----------------------------------------- */
    const visitCountsByMedium = new Map<string, number>();

    for (const t of trackings) {
        const medium = t.medium_id ? mediumMap.get(t.medium_id) ?? '기타' : '기타';
        visitCountsByMedium.set(medium, (visitCountsByMedium.get(medium) || 0) + 1);
    }

    /** -----------------------------------------
     * 9) trackingSummary
     ----------------------------------------- */
    const trackingSummary = new Map();

    for (const [medium, visitCount] of visitCountsByMedium) {
        trackingSummary.set(medium, {
            visitCount,
            paymentCount: 0,
            totalRevenue: 0,
        });
    }

    if (!trackingSummary.has('기타')) {
        trackingSummary.set('기타', {
            visitCount: 0,
            paymentCount: 0,
            totalRevenue: 0,
        });
    }

    for (const p of merged) {
        const medium = p.trackingBy?.mediumName ?? '기타';

        const stat = trackingSummary.get(medium);
        if (!stat) continue;

        if (['DONE', 'COMPLETED', 'SUCCESS', 'PARTIAL_REFUNDED'].includes(p.paymentStatus)) {
            stat.paymentCount++;
            stat.totalRevenue += p.normalizedPrice;
        }

        trackingSummary.set(medium, stat);
    }

    /** -----------------------------------------
     * 10) summary + 환산
     ----------------------------------------- */
    const trackingSummaryObj: any = {};
    for (const [medium, s] of trackingSummary) {
        const conversionRate =
            s.visitCount > 0 ? ((s.paymentCount / s.visitCount) * 100).toFixed(1) : '0';
        trackingSummaryObj[medium] = { ...s, conversionRate };
    }

    /** -----------------------------------------
     * 11) 최종 return
     ----------------------------------------- */
    return {
        payments: merged,
        trackingStats: Object.fromEntries(trackingRevenueMap),
        newUserStats: Object.fromEntries(newUserStats),
        trackingSummary: trackingSummaryObj,
    };
}
