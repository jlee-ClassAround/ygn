import { getSession } from '@/lib/session';
import CountdownTimer from './count-down-timer';
import RevealImage from './reval-image';
import { useState } from 'react';
import LectureRegisterButton from './lecture-register-button';
import { ApplyCompleteDialog } from '@/components/apply-complete-dialog';
import { FreeCourse } from '@prisma/client';
import { getAppliedFreeCourse } from '@/actions/free-courses/get-applied-free-course';
interface Props {
    lecture: FreeCourse | null;
}
type DateLike = Date | null | undefined;

export function formatKoreanSchedule(endDate: DateLike): string {
    if (!endDate) return '';

    const days = ['일', '월', '화', '수', '목', '금', '토'] as const;

    const month = endDate.getMonth() + 1; // 1~12
    const date = endDate.getDate(); // 1~31
    const day = days[endDate.getDay()]; // 요일
    const hour = endDate.getHours(); // 0~23
    const minute = String(endDate.getMinutes()).padStart(2, '0');

    return `${month}월 ${date}일 (${day}) ${hour}시 ${minute}분`;
}
export default async function StickyLectureCard({ lecture }: Props) {
    const session = await getSession();
    const applyCourse = session?.id
        ? await getAppliedFreeCourse(session.id, lecture?.id ?? '')
        : null;

    return (
        <div className="relative">
            <div className="md:sticky md:top-[80px]">
                <div className="rounded-2xl bg-white p-6 shadow-xl">
                    {/* 배지 */}
                    <div className="mb-4 flex gap-2">
                        <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                            LIVE
                        </span>
                        <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white">
                            온라인
                        </span>
                    </div>

                    {/* 타이틀 */}
                    <h3 className="mb-3 text-xl font-extrabold leading-tight text-neutral-900">
                        월급쟁이 <br />
                        건물주로 은퇴하라!
                    </h3>

                    {/* 날짜 */}
                    <p className="mb-4 text-sm font-semibold">
                        <span className="text-primary">
                            {formatKoreanSchedule(lecture?.endDate)}
                        </span>{' '}
                        오픈
                    </p>

                    {/* 카운트다운 */}
                    <CountdownTimer lecture={lecture} />

                    <LectureRegisterButton
                        lecture={lecture}
                        isLoggedIn={!!session?.id}
                        isApplied={!!applyCourse}
                    />
                    <ApplyCompleteDialog
                        kakaoRoomLink={lecture?.kakaoRoomLink ?? 'https://m.site.naver.com/1zXVw'}
                        kakaoRoomPassword={lecture?.kakaoRoomPassword ?? '없음'}
                    />
                </div>
            </div>
        </div>
    );
}
