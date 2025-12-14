import RevealImage from './reval-image';
import StickyLectureCard from './sticky-lecture-card';

export default function RightStickyColumn() {
    return (
        <div className="hidden lg:block">
            <div className="sticky top-[80px] space-y-10">
                <StickyLectureCard />
                <RevealImage />
            </div>
        </div>
    );
}
