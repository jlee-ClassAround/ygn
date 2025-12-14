import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LessonNavbar } from "./_components/lesson-navbar";
import { LessonSidebar } from "./_components/lesson-sidebar";
import { getNextLessonId } from "@/actions/lessons/get-next-lesson-id";
import { getUserProgress } from "@/actions/lessons/get-user-progress";
import { getIsLessonCompleted } from "@/actions/lessons/get-is-lesson-completed";
import { getChaptersWithLessons } from "./actions/get-chapters-with-lessons";

interface Props {
  children: React.ReactNode;
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function LessonLayout({ children, params }: Props) {
  const session = await getSession();
  if (!session.id) return redirect("/");

  const { courseId, lessonId } = await params;

  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      title: true,
    },
  });
  if (!course) return redirect("/");

  const chapters = await getChaptersWithLessons({
    courseId,
    userId: session.id,
  });

  const nextLessonId = await getNextLessonId({ lessonId });
  const isCompleted = await getIsLessonCompleted({ lessonId });
  const progressPercentage = await getUserProgress({
    courseId,
    userId: session.id,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 h-16 bg-background border-b z-10">
        <LessonNavbar
          courseId={courseId}
          courseTitle={course.title}
          chapters={chapters}
          lessonId={lessonId}
          nextLessonId={nextLessonId}
          isCompleted={isCompleted}
          progressPercentage={progressPercentage}
        />
      </div>
      <div className="hidden md:block fixed top-0 right-0 w-[320px] pt-16 bg-background h-full border-l">
        <LessonSidebar
          chapters={chapters}
          courseId={courseId}
          courseTitle={course.title}
          progressPercentage={progressPercentage}
        />
      </div>
      <div className="h-full flex flex-col flex-grow w-full md:pr-[320px]">
        {children}
      </div>
    </div>
  );
}
