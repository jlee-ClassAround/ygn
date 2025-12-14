'use client';

export function LectureTabs() {
    return (
        <div className="sticky top-0 z-20 bg-white border-b">
            <div className="mx-auto max-w-[1180px] flex gap-10 px-6 py-4 text-sm font-semibold">
                <a href="#lecture-images" className="hover:text-primary">
                    강의소개
                </a>
                <a href="#refund-policy" className="hover:text-primary">
                    환불정책
                </a>
            </div>
        </div>
    );
}
