'use server';

import { db } from '@/lib/db';

export async function getAllUsers() {
    try {
        const users = await db.user.findMany({
            select: {
                id: true,
                username: true,
                phone: true,
                email: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return { success: true, data: users };
    } catch (e) {
        console.error('[GET_ALL_USERS_ERROR]', e);
        return { success: false, data: [] };
    }
}
