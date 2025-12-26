import { HeroSection } from '../../../../../../components/common/hero-section/hero-section';
import LectureIntroSection from './_components/lecture-intro-section';

import { getFreeCourseDetail } from './actions';
interface Props {
    params: Promise<{ freeCourseId: string }>;
}
export default async function FreeCourseHome({ params }: Props) {
    const { freeCourseId } = await params;
    const data = await getFreeCourseDetail(freeCourseId);
    return (
        <main>
            <HeroSection />
            <LectureIntroSection detailImages={data.detailImages} lectureInfo={data.lectureInfo} />
        </main>
    );
}
