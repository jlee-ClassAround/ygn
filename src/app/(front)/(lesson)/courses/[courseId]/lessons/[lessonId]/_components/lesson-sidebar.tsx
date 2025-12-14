import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChapterList } from "./chapter-list";
import { LessonSidebarHeader } from "./lesson-sidebar-header";
import { ChapterWithLessons } from "../actions/get-chapters-with-lessons";

export interface LessonSidebarProps {
  courseId: string;
  chapters: ChapterWithLessons[];
  progressPercentage: number;
  courseTitle: string;
}

export function LessonSidebar({
  courseId,
  chapters,
  progressPercentage,
  courseTitle,
}: LessonSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="chapters" className="h-full">
        <TabsList className="p-8 bg-background border-b w-full">
          <TabsTrigger value="chapters" className="p-4 text-lg md:text-xl">
            강의목차
          </TabsTrigger>
          {/* <TabsTrigger value="attachments" className="p-4 md:text-xl">
            강의자료
          </TabsTrigger> */}
        </TabsList>
        <TabsContent value="chapters" className="h-full pb-16">
          <ChapterList chapters={chapters} courseId={courseId} />
        </TabsContent>
        {/* <TabsContent value="attachments"></TabsContent> */}
      </Tabs>

      {/* <LessonSidebarHeader
        progressPercentage={progressPercentage}
        courseTitle={courseTitle}
      /> */}
    </div>
  );
}
