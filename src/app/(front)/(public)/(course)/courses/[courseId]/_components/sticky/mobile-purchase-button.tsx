'use client';

import { Course } from '@prisma/client';

interface Props {
    lecture: Course;
}

export function MobilePurchaseButton({ lecture }: Props) {
    const minusPrice = Number(lecture.originalPrice) - Number(lecture.discountedPrice);
    const monthlyPrice = Math.floor(Number(lecture.discountedPrice) / 12);

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50">
            {/* 할부 정보 */}
            <div className="px-4 pt-3 pb-2 border-b">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">12개월 할부 시</span>
                    <div className="text-right">
                        <p className="text-lg font-extrabold text-neutral-900">
                            월 {monthlyPrice.toLocaleString()}원
                        </p>
                    </div>
                </div>
            </div>

            {/* 하단 영역 */}
            <div className="p-4 space-y-2">
                {/* 가격 정보 */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 line-through">
                            정가 {lecture.originalPrice?.toLocaleString()}원
                        </p>
                        <p className="text-sm font-semibold text-gray-800 truncate">
                            {lecture.title}
                        </p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-xs text-red-500 font-semibold">
                            -{minusPrice.toLocaleString()}원
                        </span>
                        <span className="text-lg font-extrabold text-red-500">
                            {lecture.discountedPrice?.toLocaleString()}원
                        </span>
                    </div>
                </div>

                {/* 구매 버튼 */}
                <a
                    href={`/checkout?lectureId=${lecture.id}`}
                    className="block w-full rounded-xl bg-red-500 py-3.5 text-center text-white font-bold text-base hover:bg-red-600 transition active:scale-98"
                >
                    강의 구매하기
                </a>
            </div>
        </div>
    );
}
