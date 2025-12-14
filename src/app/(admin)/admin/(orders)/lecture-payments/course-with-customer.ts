import { db } from '@/lib/db';

export async function getCoursesWithCustomer() {
    // 1) 강의 기본 정보 + 토스 결제금액 가져오기
    const courses = await db.course.findMany({
        include: {
            tossCustomers: {
                select: { finalPrice: true, paymentStatus: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    // 2) 전체 courseId
    const courseIds = courses.map((c) => c.id);

    // 3) 현금결제 전체 조회
    const cashPayments = await db.cashPayment.findMany({
        where: { courseId: { in: courseIds } },
        select: {
            courseId: true,
            price: true,
            paymentStatus: true,
        },
    });

    // 4) courseId → cash 총 매출
    const cashMap = new Map<string, number>();

    for (const c of cashPayments) {
        if (!c.courseId) continue;

        cashMap.set(c.courseId, (cashMap.get(c.courseId) || 0) + c.price);
    }

    const coursesWithTotal = courses.map((course) => {
        const tossTotal = course.tossCustomers.reduce((acc, cur) => acc + (cur.finalPrice || 0), 0);

        const cashTotal = cashMap.get(course.id) || 0;

        return {
            ...course,
            tossTotal,
            cashTotal,
            totalPrice: tossTotal + cashTotal,
        };
    });

    return coursesWithTotal;
}
