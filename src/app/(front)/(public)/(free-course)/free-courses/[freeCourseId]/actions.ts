'use server';

import { getSession } from '@/lib/session';

export default async function CheckLogin() {
    const session = await getSession();
    if (!session.id) {
        return {
            loggedIn: false,
        };
    }

    return {
        loggedIn: true,
    };
}
