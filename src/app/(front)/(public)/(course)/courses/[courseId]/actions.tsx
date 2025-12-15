'use server';

import { db } from '@/lib/db';

export default async function getLectureDetail(courseId: string) {
    const lectureInfo = await db.course.findFirst({
        where: {
            id: courseId,
        },
    });

    const detailImages = await db.detailImage.findMany({
        where: {
            courseId: courseId,
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
        lectureInfo: lectureInfo,
        detailImages: detailImages,
        refundPolicy: refundPolicy,
        usePolicy: usePolicy,
    };
}
