import { coursesWithProgress } from "@/actions/mypage/get-mypage-courses";
import { MyCourseCard } from "./my-course-card";

interface Props {
  currentCourses: coursesWithProgress[];
}

export function CurrentCourses({ currentCourses }: Props) {
  return (
    <>
      {currentCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8 mt-5">
          {currentCourses.map((course) => (
            <MyCourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-80 border border-dashed border-foreground/20 rounded-lg mt-5 bg-foreground/10">
          <p className="text-sm text-foreground/50">
            수강 중인 강의가 없습니다.
          </p>
        </div>
      )}
    </>
  );
}
