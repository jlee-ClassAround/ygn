'use client';

import { useRouter } from 'next/navigation';

import { useApplyCourseDialog } from '@/store/use-apply-course-dialog';
import { getSession } from '@/lib/session';
import { CheckLogin } from '../actions';

export default function LectureRegisterButton() {
    const router = useRouter();
    const { onOpen } = useApplyCourseDialog();

    const handleClick = async () => {
        const res = await CheckLogin();
        if (!res.loggedIn) {
            router.push('/login');
        }

        onOpen();
    };

    return (
        <button
            onClick={handleClick}
            className="mt-6 flex w-full items-center justify-center rounded-lg bg-primary py-3 text-sm font-bold text-white transition hover:brightness-110"
        >
            무료강의 신청하기
        </button>
    );
}
