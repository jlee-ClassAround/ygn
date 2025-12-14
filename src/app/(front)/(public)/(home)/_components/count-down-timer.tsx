'use client';

import { useEffect, useState } from 'react';

export default function CountdownTimer() {
    const target = new Date('2025-12-14T19:30:00+09:00').getTime();
    const [time, setTime] = useState(getTimeLeft());

    function getTimeLeft() {
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
