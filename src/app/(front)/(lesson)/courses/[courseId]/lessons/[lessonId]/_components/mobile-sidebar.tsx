import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LessonSidebar, LessonSidebarProps } from "./lesson-sidebar";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle } from "lucide-react";

export function MobileSidebar({
  chapters,
  courseId,
  progressPercentage,
  courseTitle,
}: LessonSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-full border"
        >
          <span>열기</span>
          <ArrowRightCircle />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 w-[280px] dark bg-background text-foreground"
      >
        <LessonSidebar
          courseTitle={courseTitle}
          chapters={chapters}
          courseId={courseId}
          progressPercentage={progressPercentage}
        />
      </SheetContent>
    </Sheet>
  );
}
