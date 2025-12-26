'use client';

import { FreeCourse } from '@prisma/client';
import { useEffect, useState } from 'react';
interface Props {
    lecture: FreeCourse | null;
}
export default function CountdownTimer({ lecture }: Props) {
    const target = lecture?.endDate?.getTime() ?? null;
    const [time, setTime] = useState(getTimeLeft());

    function getTimeLeft() {
        if (target === null) {
            return { days: 0, hours: 0, minutes: 0 };
        }

        const now = Date.now();
        const diff = Math.max(target - now, 0);

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(getTimeLeft());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="mb-6 flex items-end gap-1 text-sm font-bold">
            <TimeBox value={time.days} label="일" />
            <TimeBox value={time.hours} label="시간" />
            <TimeBox value={time.minutes} label="분 후 오픈" />
        </div>
    );
}

function TimeBox({ value, label }: { value: number; label: string }) {
    return (
        <>
            <div className="flex items-center gap-1">
                <span className="rounded bg-neutral-800 px-2 py-1 text-white">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="mx-1 text-neutral-700">{label}</span>
        </>
    );
}
