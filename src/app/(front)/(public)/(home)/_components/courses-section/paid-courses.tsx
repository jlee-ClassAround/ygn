import { getCachedAllCoursesWithFreeCourses } from '@/actions/courses/get-all-courses-with-free-courses';
import { CoursesSwiper } from '@/components/common/courses-swiper';
import { CTAButton } from '@/components/common/cta-button';
import { SectionHeader } from '@/components/common/section-header';

export async function PaidCourses() {
    const { courses } = await getCachedAllCoursesWithFreeCourses({
        currentPage: 1,
        pageSize: 10,
        courseType: 'PAID',
    });
    if (!courses.length) return null;

    return (
        <div className="space-y-4 md:space-y-10 lg:space-y-16 md:fit-container">
            <div className="flex items-center justify-between px-5 md:px-0">
                <SectionHeader title="유료강의" description="" />
                {/* <CTAButton label="할인강의 더보기" link="/courses" className="hidden md:flex" /> */}
            </div>
            <div>
                <CoursesSwiper courses={courses} slidesPerView={2} />
            </div>
        </div>
    );
}
