'use client';

import { FreeCourse } from '@prisma/client';
import { useApplyCourseDialog } from '@/store/use-apply-course-dialog';
import CountdownTimer from './count-down-timer';
import { CheckLogin } from '../actions';
import { useRouter } from 'next/navigation';

interface Props {
    lecture: FreeCourse;
}

export function MobileApplyButton({ lecture }: Props) {
    const { onOpen } = useApplyCourseDialog();
    const router = useRouter();
    const handleClick = async () => {
        const res = await CheckLogin();
        if (!res.loggedIn) {
            router.push('/login');
        }
        // 데스크톱 신청 버튼 트리거
        const applyButton = document.querySelector<HTMLButtonElement>('[data-apply-button]');
        if (applyButton) {
            applyButton.click();
        } else {
            // 데스크톱 버튼이 없으면 직접 다이얼로그 열기
            onOpen();
        }
    };

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50">
            {/* 카운트다운 */}
            <div className="px-4 pt-3">
                <CountdownTimer />
            </div>

            {/* 하단 영역 */}
            <div className="p-4 pt-2 space-y-2">
                {/* 강의 정보 */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                            {lecture.title}
                        </p>
                        <p className="text-xs text-gray-500">무료 온라인 강의</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white leading-none">
                            LIVE
                        </span>
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-500 px-2.5 py-1 text-[10px] font-bold text-white leading-none">
                            온라인
                        </span>
                    </div>
                </div>

                {/* 신청 버튼 */}
                <button
                    onClick={handleClick}
                    className="w-full rounded-xl bg-red-500 py-3.5 text-center text-white font-bold text-base hover:bg-red-600 transition active:scale-98"
                >
                    무료 신청하기
                </button>
            </div>
        </div>
    );
}
