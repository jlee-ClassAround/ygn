import { HeroSection } from '@/components/common/hero-section/hero-section';

import { LectureContent } from './_components/lecture-content';
import { LectureTabs } from './_components/lecture-tab';
import getLectureDetail from './actions';
import { LectureLayout } from './_components/lecture-layout';

export default async function LecturePage() {
    const lecture = await getLectureDetail();

    return (
        <main>
            <HeroSection />

            <LectureTabs />

            <LectureLayout
                left={
                    <LectureContent
                        detailImages={props.detailImages}
                        lectureInfo={props.lecture}
                        siteSetting={props.siteSetting}
                    />
                }
                right={<LectureSidebar lecture={props.lecture} />}
            />
        </main>
    );
}
