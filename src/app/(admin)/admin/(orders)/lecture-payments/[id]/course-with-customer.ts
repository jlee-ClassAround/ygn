import { db } from '@/lib/db';

export async function getCoursesWithCustomer() {
    const courses = await db.course.findMany({
        include: {
            tossCustomers: {
                select: { finalPrice: true },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    // tossCustomers 합계 계산
    const coursesWithTotal = courses.map((course) => ({
        ...course,
        totalPrice: course.tossCustomers.reduce((acc, cur) => acc + (cur.finalPrice ?? 0), 0),
    }));

    return coursesWithTotal;
}
