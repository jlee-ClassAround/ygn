import { HeroSection } from '@/components/common/hero-section/hero-section';

import { LectureContent } from './_components/lecture-content';
import { LectureTabs } from './_components/lecture-tab';

export default async function LecturePage() {
    // const lecture = await getLectureDetail();

    return (
        <main>
            <HeroSection />

            <LectureTabs />
            {/* 
            <LectureContent detailImages={lecture.detailImages} siteSetting={lecture.siteSetting} /> */}
        </main>
    );
}
