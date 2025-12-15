import { HeroSection } from '@/components/common/hero-section/hero-section';

import getLectureDetail from './actions';
import { LectureIntroSection } from './_components/lecture-intro-section';
interface Props {
    params: Promise<{ courseId: string }>;
}

export default async function LecturePage({ params }: Props) {
    const { courseId } = await params;
    const lecture = await getLectureDetail(courseId);

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
