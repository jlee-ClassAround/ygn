import { Course } from '@prisma/client';

interface Props {
    lecture: Course | null;
}

export function LectureSidebar({ lecture }: Props) {
    if (!lecture) return null;
    const minusPrice = Number(lecture.originalPrice) - Number(lecture.discountedPrice);
    const monthlyPrice = Number(lecture.discountedPrice) / 12;
    return (
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
            {/* 뱃지 */}
            <div className="flex gap-2">
                <span className="px-3 py-1 text-xs rounded-full bg-red-500 text-white">LIVE</span>
                <span className="px-3 py-1 text-xs rounded-full bg-blue-500 text-white">
                    온라인
                </span>
            </div>

            {/* 제목 */}
            <h3 className="text-lg font-bold leading-snug">{lecture.title}</h3>

            {/* 가격 */}
            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                    <span>정가</span>
                    <del>{lecture.originalPrice?.toLocaleString()}원</del>
                </div>
                <div className="flex justify-between text-red-500">
                    <span>할인</span>
                    <span>-{minusPrice.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between font-semibold text-base">
                    <span>총 혜택가</span>
                    <span>{lecture.discountedPrice?.toLocaleString()}원</span>
                </div>
            </div>

            <hr />

            {/* 할부 */}
            <div className="text-center">
                <div className="text-2xl font-bold">월 {monthlyPrice?.toLocaleString()}원</div>
                <div className="text-xs text-muted-foreground">12개월 할부 시</div>
            </div>

            {/* 버튼 */}
            <a
                href={`/checkout?lectureId=${lecture.id}`}
                className="block w-full text-center rounded-lg bg-red-500 text-white py-3 font-semibold hover:bg-red-600 transition"
            >
                강의 구매하기
            </a>
        </div>
    );
}
