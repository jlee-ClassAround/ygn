'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

interface SignupActionInput {
    username: string;
    phone: string;
    email: string;

    password: string;
}

export async function signupAction(input: SignupActionInput) {
    const { username, phone, email, password } = input;

    const exists = await db.user.findFirst({
        where: {
            email,
        },
    });

    if (exists) {
        return { success: false, error: '이미 존재하는 아이디입니다.' };
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.user.create({
        data: {
            username,
            phone,
            email,
            password: hashed,
            roleId: '-',
        },
    });

    return { success: true };
}
