import { Separator } from '@/components/ui/separator';
import { MyPageHeader } from './_components/mypage-header';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getUser } from '@/actions/users/get-user';
import { MyPageSidebar } from './_components/mypage-sidebar';
import { getMypageCourses } from '@/actions/mypage/get-mypage-courses';
import { getUserCoupons } from '@/actions/coupons/get-user-coupons';

export const dynamic = 'force-dynamic';

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session.id) return redirect('/');
    const user = await getUser(session.id);
    if (!user) return redirect('/');
    const { completedCourses, inProgressCourses } = await getMypageCourses();
    const coupons = await getUserCoupons(user.id);

    return (
        <div className="fit-container">
            <MyPageHeader
                username={user.nickname}
                avatar={user.avatar}
                inProgressCount={inProgressCourses.length}
                completedCount={completedCourses.length}
                couponCount={coupons.length}
            />
            <Separator />
            <div className="py-4 md:py-10 flex gap-x-10 gap-y-5 flex-col-reverse lg:flex-row">
                <div className="w-full lg:w-[300px] flex-shrink-0">
                    <MyPageSidebar />
                </div>
                <div className="w-full">{children}</div>
            </div>
        </div>
    );
}
