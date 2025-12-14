import { getCachedAllCoursesWithFreeCourses } from "@/actions/courses/get-all-courses-with-free-courses";
import { getSearchedCourses } from "@/actions/search/get-searched-courses";
import { CourseCard } from "@/components/loop-items/course-card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "검색",
};

interface Props {
  searchParams: Promise<{ search: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { search } = await searchParams;
  const { courses } = await getCachedAllCoursesWithFreeCourses({
    currentPage: 1,
    pageSize: 20,
    title: search,
  });

  return (
    <>
      <div className="fit-container">
        <div className="bg-foreground/20 py-4 md:py-8 px-5 rounded-xl text-center">
          {search ? (
            <>
              <span className="text-primary md:text-lg font-semibold">
                {search}
              </span>
              <span className="md:text-lg font-semibold">
                {" "}
                에 대한 검색결과
              </span>
            </>
          ) : (
            <>
              <span className="md:text-lg font-semibold">
                검색어를 입력해주세요.
              </span>
            </>
          )}
        </div>
      </div>
      <div className="fit-container">
        <div className="flex gap-x-5 justify-center border-b">
          <button className="py-3 shadow-[inset_0px_-2px_0px_0px_#000]">
            <span className="font-medium">클래스 </span>
            <span className="font-medium text-neutral-500">
              {courses.length}
            </span>
          </button>
        </div>
      </div>
      <div className="fit-container py-8">
        {courses.length > 0 && search ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="w-full h-[200px] border rounded-lg flex items-center justify-center text-foreground/50 font-medium bg-foreground/5">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </>
  );
}
