import MainPoster from './main-poster';
import RevealImage from './reval-image';
import RightStickyColumn from './right-sticky-column';
import StickyLectureCard from './sticky-lecture-card';

export function LectureIntroSection() {
    return (
        <section className="relative bg-white py-20">
            <div className="mx-auto max-w-[1440px] px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-14">
                    {/* LEFT – 메인 콘텐츠 */}
                    <div className="space-y-24">
                        <MainPoster />
                        {/* 이후 섹션들 */}
                    </div>

                    {/* RIGHT – 스티키 영역 */}
                    <div className="hidden lg:block">
                        <div className="sticky top-[80px] space-y-10">
                            <StickyLectureCard />
                            <RevealImage />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
