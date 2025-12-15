'use client';

import { cn } from '@/lib/utils';

export function LectureTabs() {
    return (
        <div className={cn('sticky top-60 z-40', 'bg-white border-b border-border')}>
            <div className="mx-auto max-w-[1180px] px-6">
                <nav className="flex gap-10 h-[64px] items-center">
                    <a
                        href="#lecture-images"
                        className="text-lg font-semibold text-foreground hover:text-primary transition"
                    >
                        강의소개
                    </a>
                    <a
                        href="#refund-policy"
                        className="text-lg font-semibold text-foreground hover:text-primary transition"
                    >
                        환불정책
                    </a>
                </nav>
            </div>
        </div>
    );
}
