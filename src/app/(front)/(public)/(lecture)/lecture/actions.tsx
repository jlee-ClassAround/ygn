'use server';

import { db } from '@/lib/db';

export default async function getLectureDetail() {
    const lecture = await db.course.findFirst();

    const detailImages = await db.detailImage.findMany({
        where: {
            courseId: lecture?.id,
        },
        orderBy: {
            position: 'asc',
        },
    });
    const refundPolicy = await db.terms.findUnique({
        where: {
            id: 3,
        },
    });
    const usePolicy = await db.terms.findUnique({
        where: {
            id: 4,
        },
    });

    return {
        lectureInfo: lecture,
        detailImages: detailImages,
        refundPolicy: refundPolicy,
        usePolicy: usePolicy,
    };
}
