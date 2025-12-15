import { Course } from '@prisma/client';

interface Props {
    lecture: Course | null;
}

export function StickyLectureCard({ lecture }: Props) {
    if (!lecture) return null;

    const minusPrice = Number(lecture.originalPrice) - Number(lecture.discountedPrice);
    const monthlyPrice = Math.floor(Number(lecture.discountedPrice) / 12);

    return (
        <div className="rounded-3xl border bg-white p-8 shadow-lg space-y-8">
            {/* 뱃지 */}
            <div className="flex gap-2">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500 text-white">
                    LIVE
                </span>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500 text-white">
                    온라인
                </span>
            </div>

            {/* 제목 */}
            <h3 className="text-3xl font-extrabold leading-snug text-neutral-900">
                {lecture.title}
            </h3>

            {/* 가격 정보 */}
            <div className="space-y-3 text-sm">
                <div className="flex text-[23px] font-extrabold justify-between text-neutral-400">
                    <span>정가</span>
                    <del>{lecture.originalPrice?.toLocaleString()}원</del>
                </div>

                <div className="flex text-[23px] font-extrabold justify-between text-red-500 ">
                    <span>할인</span>
                    <span>-{minusPrice.toLocaleString()}원</span>
                </div>

                <div className="flex justify-between text-[23px] font-extrabold">
                    <span>총 혜택가</span>
                    <span>{lecture.discountedPrice?.toLocaleString()}원</span>
                </div>
            </div>

            <hr className="border-neutral-200" />

            {/* 할부 */}
            <div className="text-right space-y-1">
                <div className="text-3xl font-extrabold text-neutral-900">
                    월 {monthlyPrice.toLocaleString()}원
                </div>
                <div className="text-[16px] text-neutral-400">12개월 할부 시</div>
            </div>

            {/* 버튼 */}
            <a
                href={`/checkout?lectureId=${lecture.id}`}
                className="block w-full rounded-xl bg-red-500 py-4 text-center text-white font-bold text-lg hover:bg-red-600 transition"
            >
                강의 구매하기
            </a>
        </div>
    );
}
