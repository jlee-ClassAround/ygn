import { firstNavs } from '@/constants/header-menus';
import { getIsAdmin } from '@/utils/auth/is-admin';
import { getIsLoggedIn } from '@/utils/auth/is-logged-in';
import { HeaderRowSecond } from './header-row-second';
import { db } from '@/lib/db';
import { AdminButton } from './admin-button';

export async function MainHeader() {
    const isLoggedIn = await getIsLoggedIn();
    const isAdmin = await getIsAdmin();
    const nickname = isLoggedIn
        ? (
              await db.user.findUnique({
                  where: {
                      id: isLoggedIn.userId,
                  },
                  select: {
                      nickname: true,
                  },
              })
          )?.nickname
        : null;

    return (
        <>
            {isAdmin && <AdminButton />}
            <HeaderRowSecond
                firstNavs={firstNavs}
                isLoggedIn={isLoggedIn}
                nickname={nickname || null}
            />
        </>
    );
}
