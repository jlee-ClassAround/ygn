import { getMypageCourses } from "@/actions/mypage/get-mypage-courses";
import { TabButtons } from "./_components/tab-buttons";
import { CurrentCourses } from "./_components/current-courses";
import { Suspense } from "react";
import { CurrentCoursesSkeleton } from "@/components/skeletons/mypage-courses-skeleton";
import { Metadata } from "next";

interface Props {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export const metadata: Metadata = {
  title: "내 강의실",
};

export default async function MyPageStudyroom({ searchParams }: Props) {
  const { tab } = await searchParams;
  const { completedCourses, inProgressCourses } = await getMypageCourses();
  const courses = [...inProgressCourses, ...completedCourses];

  const currentCourses =
    tab === "progress"
      ? inProgressCourses
      : tab === "complete"
      ? completedCourses
      : courses;

  return (
    <div>
      <TabButtons />
      <Suspense fallback={<CurrentCoursesSkeleton />}>
        <CurrentCourses currentCourses={currentCourses} />
      </Suspense>
    </div>
  );
}
