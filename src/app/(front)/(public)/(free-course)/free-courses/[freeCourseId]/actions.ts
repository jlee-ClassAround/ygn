'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function getFreeCourseDetail(courseId: string) {
    const lectureInfo = await db.freeCourse.findFirst({
        where: {
            id: courseId,
        },
    });

    const detailImages = await db.detailImage.findMany({
        where: {
            freeCourseId: courseId,
        },
        orderBy: {
            position: 'asc',
        },
    });

    return {
        lectureInfo: lectureInfo,
        detailImages: detailImages,
    };
}

export async function CheckLogin() {
    const session = await getSession();
    if (!session.id) {
        return {
            loggedIn: false,
        };
    } else {
        return {
            loggedIn: true,
        };
    }
}
