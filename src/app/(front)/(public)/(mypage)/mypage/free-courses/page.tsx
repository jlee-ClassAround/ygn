import { getAppliedFreeCourses } from "@/actions/free-courses/get-applied-free-courses";
import { FreeCourseCard } from "./_components/free-course-card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "무료 강의",
};

export default async function MyPageFreeCourses() {
  const appliedFreeCourses = await getAppliedFreeCourses();

  return (
    <>
      {appliedFreeCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8 mt-5">
          {appliedFreeCourses.map((course) => (
            <FreeCourseCard
              key={course.id}
              courseTitle={course.title}
              kakaoRoomLink={course.kakaoRoomLink ?? ""}
              kakaoRoomPassword={course.kakaoRoomPassword ?? ""}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-80 border border-dashed border-foreground/20 rounded-lg mt-5 bg-foreground/10">
          <p className="text-sm text-foreground/50">
            신청한 무료 강의가 없습니다.
          </p>
        </div>
      )}
    </>
  );
}
