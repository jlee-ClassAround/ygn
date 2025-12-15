import { HeroSection } from '@/components/common/hero-section/hero-section';

import getLectureDetail from './[courseId]/actions';
import { LectureIntroSection } from './[courseId]/_components/lecture-intro-section';

export default async function LecturePage() {
    const lecture = await getLectureDetail();

    return (
        <>
            <HeroSection />
            <LectureIntroSection
                detailImages={lecture.detailImages}
                refundPolicy={lecture.refundPolicy?.content ?? ''}
                usePolicy={lecture.usePolicy?.content ?? ''}
                lectureInfo={lecture.lectureInfo}
            />
        </>
    );
}
