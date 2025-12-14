import { getIsLessonCompleted } from "@/actions/lessons/get-is-lesson-completed";
import { getNextLessonId } from "@/actions/lessons/get-next-lesson-id";
import { TiptapViewer } from "@/components/tiptap/tiptap-viewer";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { VideoPlayer } from "./_components/video-player";
import { LessonAttachments } from "./_components/lesson-attachments";

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { courseId, lessonId } = await params;
  const lesson = await db.lesson.findUnique({
    where: {
      id: lessonId,
    },
    include: {
      attachments: true,
    },
  });
  if (!lesson) return redirect(`/courses/${courseId}`);

  const nextLessonId = await getNextLessonId({ lessonId });
  const isCompleted = await getIsLessonCompleted({ lessonId });

  return (
    <div className="px-5 lg:px-8 py-8 h-full flex flex-col flex-grow gap-y-4">
      <h1 className="text-lg font-semibold">{lesson.title}</h1>
      {lesson.videoUrl && (
        <VideoPlayer
          videoType={lesson.videoType}
          videoUrl={lesson.videoUrl}
          nextLessonId={nextLessonId}
          isCompleted={isCompleted}
          lessonId={lessonId}
          courseId={courseId}
        />
      )}
      {/* <h2 className="font-semibold mt-6">수업 내용</h2>
      <Separator className="my-2" /> */}
      <TiptapViewer content={lesson.description || ""} />
      {lesson.attachments.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-semibold">수업 자료</h2>
          <Separator className="my-2" />
          <LessonAttachments attachments={lesson.attachments} />
        </div>
      )}
    </div>
  );
}
