import Link from "next/link";
import { LessonSidebarProps } from "./lesson-sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { NextButton } from "./next-button";
import { ArrowUpRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  lessonId: string;
  nextLessonId: string | null;
  courseId: string;
  isCompleted: boolean;
  courseTitle: string;
}
export function LessonNavbar({
  lessonId,
  nextLessonId,
  courseId,
  isCompleted,
  chapters,
  progressPercentage,
  courseTitle,
}: Props & LessonSidebarProps) {
  return (
    <div className="flex items-center justify-between px-5 p-2 h-full gap-x-2 overflow-x-auto">
      <div className="flex items-center gap-x-2">
        <MobileSidebar
          chapters={chapters}
          courseId={courseId}
          courseTitle={courseTitle}
          progressPercentage={progressPercentage}
        />
        <Button asChild variant="secondary" size="sm" className="border">
          <Link href="/mypage">
            <span>내 강의실로</span>
            <ArrowUpRightIcon />
          </Link>
        </Button>
      </div>
      <NextButton
        lessonId={lessonId}
        nextLessonId={nextLessonId}
        courseId={courseId}
        isCompleted={isCompleted}
      />
    </div>
  );
}
