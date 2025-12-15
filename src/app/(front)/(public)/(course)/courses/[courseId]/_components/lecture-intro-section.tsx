import { Course, DetailImage } from '@prisma/client';
import MainPoster from './main-poster';
import RevealImage from './sticky/reval-image';
import { StickyLectureCard } from './sticky/sticky-lecture-card';
import { MobilePurchaseButton } from './sticky/mobile-purchase-button';

interface Props {
    detailImages: DetailImage[];
    refundPolicy: string | null;
    usePolicy: string | null;
    lectureInfo: Course | null;
}

export function LectureIntroSection({ detailImages, refundPolicy, usePolicy, lectureInfo }: Props) {
    return (
        <>
            <section className="relative bg-white py-20">
                <div className="mx-auto max-w-[1440px] px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-14">
                        {/* LEFT – 메인 콘텐츠 */}
                        <div className="space-y-24">
                            <MainPoster
                                detailImages={detailImages}
                                refundPolicy={refundPolicy}
                                usePolicy={usePolicy}
                            />
                            {/* 이후 섹션들 */}
                        </div>

                        {/* RIGHT – 스티키 영역 (데스크톱만) */}
                        <div className="hidden lg:block">
                            <div className="sticky top-[80px] space-y-10">
                                <StickyLectureCard lecture={lectureInfo} />
                                <RevealImage />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 모바일: 하단 고정 구매 버튼 */}
            {lectureInfo && <MobilePurchaseButton lecture={lectureInfo} />}
        </>
    );
}
