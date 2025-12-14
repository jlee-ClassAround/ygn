import { getFirstLessonId } from "@/actions/lessons/get-first-lesson-id";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { courseId } = await params;
  const firstLessonId = await getFirstLessonId({ courseId });
  if (!firstLessonId) return redirect("/mypage");

  return redirect(`/courses/${courseId}/lessons/${firstLessonId}`);
}
