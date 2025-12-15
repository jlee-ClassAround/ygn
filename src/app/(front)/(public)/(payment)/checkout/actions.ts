'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function getCheckoutData(lectureId: string) {
    const session = await getSession();
    if (!session?.id) {
        throw new Error('UNAUTHORIZED');
    }

    const user = await db.user.findUnique({
        where: { id: session.id },
    });

    const lecture = await db.course.findUnique({
        where: { id: lectureId },
    });

    if (!lecture) throw new Error('LECTURE_NOT_FOUND');

    return { user, lecture };
}
