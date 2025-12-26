'use client';

import { useRouter } from 'next/navigation';

import { useApplyCourseDialog } from '@/store/use-apply-course-dialog';

import { CheckLogin } from '../actions';
import { FreeCourse } from '@prisma/client';
import { useState } from 'react';

import { toast } from 'sonner';
import { sendGTMEvent } from '@next/third-parties/google';

import { sendSchedulingMessages } from '@/actions/alimtalk/send-scheduling-messages';
import { dateFormat, normalizeKRPhoneNumber } from '@/utils/formats';
import axios from 'axios';

interface Props {
    lecture: FreeCourse | null;
    isLoggedIn: boolean;
    isApplied: boolean;
}
export default function LectureRegisterButton({ lecture, isLoggedIn, isApplied }: Props) {
    const router = useRouter();
    const { onOpen } = useApplyCourseDialog();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        const res = await CheckLogin();
        try {
            setIsLoading(true);
            if (!isLoggedIn) {
                // 로컬스토리지에 신청 정보 저장
                localStorage.setItem('applyCourse', lecture?.id ?? '');

                router.push(`/login?redirect=/free-courses/${lecture?.id}`);
                return;
            }
            if (isApplied) {
                alert('이미 신청한 강의 입니다.');
                return;
            }

            await axios.post(`/api/free-courses/${lecture?.id}/apply`);
            // router.refresh();
            // 신청 완료 팝업
            sendGTMEvent({
                event: 'applyCourse',
            });

            // fbqTrack({
            //   eventName: "StartTrial",
            //   options: {
            //     value: 0.0,
            //     currency: "KRW",
            //   },
            // });

            onOpen();
            toast.success('신청이 완료되었습니다!');
        } catch {
            toast.error('신청에 실패했습니다.');
        } finally {
            setIsLoading(false);
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
