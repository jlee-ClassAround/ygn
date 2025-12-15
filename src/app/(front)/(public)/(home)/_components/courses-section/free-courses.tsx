import { getCachedAllCoursesWithFreeCourses } from '@/actions/courses/get-all-courses-with-free-courses';
import { CoursesSwiper } from '@/components/common/courses-swiper';
import { CTAButton } from '@/components/common/cta-button';
import { SectionHeader } from '@/components/common/section-header';

export async function FreeCourses() {
    const { courses: freeCourses } = await getCachedAllCoursesWithFreeCourses({
        currentPage: 1,
        pageSize: 10,
        courseType: 'FREE',
    });
    if (!freeCourses.length) return null;

    return (
        <div className="space-y-4 md:space-y-10 lg:space-y-16 md:fit-container">
            <div className="flex items-center justify-between px-5 md:px-0">
                <SectionHeader title="무료강의" description="0원으로 모집 중인 라이브 강의" />
                {/* <CTAButton
                    label="무료강의 더보기"
                    link="/courses?courseType=FREE"
                    className="hidden md:flex"
                /> */}
            </div>
            <div>
                <CoursesSwiper courses={freeCourses} slidesPerView={3} />
            </div>
        </div>
    );
}
