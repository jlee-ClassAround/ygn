import { getSession } from '@/lib/session';
import CountdownTimer from './count-down-timer';
import RevealImage from './reval-image';
import { useState } from 'react';
import LectureRegisterButton from './lecture-register-button';
import { ApplyCompleteDialog } from '@/components/apply-complete-dialog';
import { FreeCourse } from '@prisma/client';
interface Props {
    lecture: FreeCourse | null;
}
export default function StickyLectureCard({ lecture }: Props) {
    const kakaoRoomLink = 'https://m.site.naver.com/1zXVw';
    const kakaoRoomPassword = '없음';

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
                        <span className="text-primary">12월 14일 (일) 19시 30분</span> 오픈
                    </p>

                    {/* 카운트다운 */}
                    <CountdownTimer />

                    <LectureRegisterButton />
                    <ApplyCompleteDialog
                        kakaoRoomLink={kakaoRoomLink}
                        kakaoRoomPassword={kakaoRoomPassword}
                    />
                </div>
            </div>
        </div>
    );
}
