import { getSession } from '@/lib/session';
import CountdownTimer from './count-down-timer';
import RevealImage from './reval-image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function StickyLectureCard() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleClick = async () => {
        const session = await getSession();
        if (!session.id) {
            router.push('login');
            return;
        }
    };
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

                    <button
                        onClick={handleClick}
                        className="mt-6 flex w-full items-center justify-center rounded-lg bg-primary py-3 text-sm font-bold text-white transition hover:brightness-110"
                    >
                        무료강의 신청하기
                    </button>
                </div>
            </div>
        </div>
    );
}
