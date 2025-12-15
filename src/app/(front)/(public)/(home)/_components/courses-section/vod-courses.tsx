import { getVodCourses } from "@/actions/courses/get-vod-courses";
import { CoursesSwiper } from "@/components/common/courses-swiper";
import { CTAButton } from "@/components/common/cta-button";
import { SectionHeader } from "@/components/common/section-header";

export async function VodCourses() {
  const { courses, totalPages } = await getVodCourses({
    currentPage: 1,
    pageSize: 10,
  });

  if (!courses.length) return null;

  return (
    <section className="py-10 md:py-20 lg:py-24">
      <div className="space-y-4 md:space-y-10 lg:space-y-16 md:fit-container">
        <div className="flex items-center justify-between px-5 md:px-0">
          <SectionHeader title="VOD 강의" />
          <CTAButton
            label="VOD 강의 더보기"
            link="/courses?categoryId=a9d9af7b-f975-4ce4-a382-8ec80107d5a1"
            className="hidden md:flex"
          />
        </div>
        <div>
          <CoursesSwiper courses={courses} slidesPerView={3} />
        </div>
      </div>
    </section>
  );
}
