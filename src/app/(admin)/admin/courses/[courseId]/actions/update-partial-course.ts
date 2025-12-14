'use server';

import { db } from '@/lib/db';
import { partialCourseSchema } from '@/validations/schemas';

export async function updatePartialCourse(id: string, values: any) {
    const parsed = partialCourseSchema.safeParse(values);
    if (!parsed.success) {
        return { ok: false, error: parsed.error.errors };
    }

    try {
        const updated = await db.partialCourse.update({
            where: { id },
            data: parsed.data,
        });

        return { ok: true, data: updated };
    } catch (error) {
        console.error('[UPDATE_PARTIAL_COURSE_ERROR]', error);
        return { ok: false, error: 'Server error' };
    }
}
