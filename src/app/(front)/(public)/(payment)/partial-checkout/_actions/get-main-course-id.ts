'use server';

import { db } from '@/lib/db';

export async function getMainIdByPartialCourseId(partialCourseId: string) {
    try {
        const partial = await db.partialCourse.findUnique({
            where: { id: partialCourseId },
            select: { mainId: true },
        });

        if (!partial) return null;

        return partial.mainId;
    } catch (error) {
        console.error('[GET_MAIN_ID_BY_PARTIAL_COURSE_ID]', error);
        throw new Error('mainId 조회 중 오류가 발생했습니다.');
    }
}
