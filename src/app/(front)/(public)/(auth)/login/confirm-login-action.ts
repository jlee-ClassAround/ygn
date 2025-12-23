'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

interface LoginPayload {
    email: string;
    password: string;
}
export async function loginAction({ email, password }: LoginPayload) {
    const user = await db.user.findFirst({
        where: { email },
    });

    if (!user) {
        return { success: false, error: '존재하지 않는 사용자입니다.' };
    }

    const isValid = await bcrypt.compare(password, user.password ?? '');
    if (!isValid) {
        return { success: false, error: '비밀번호가 일치하지 않습니다.' };
    }

    const session = await getSession();
    session.id = user.id;
    await session.save();

    return { success: true };
}
