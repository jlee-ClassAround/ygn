"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { completeLesson } from "../actions/complete-lesson";
import { cn } from "@/lib/utils";

interface Props {
  lessonId: string;
  nextLessonId: string | null;
  courseId: string;
  isCompleted: boolean;
}

export function NextButton({
  lessonId,
  nextLessonId,
  courseId,
  isCompleted,
}: Props) {
  const router = useRouter();

  const onNext = async () => {
    try {
      if (nextLessonId && isCompleted) {
        return router.push(`/courses/${courseId}/lessons/${nextLessonId}`);
      }
      if (nextLessonId && !isCompleted) {
        toast.success("축하해요! 수업을 완료했어요.");
        await completeLesson({ lessonId });
        return router.push(`/courses/${courseId}/lessons/${nextLessonId}`);
      }

      if (!nextLessonId && !isCompleted) {
        toast.success("축하해요! 수업을 완료했어요.");
        await completeLesson({ lessonId });
        router.refresh();
        return;
      }

      if (!nextLessonId && isCompleted) return;
    } catch {
      toast.error("오류가 발생했어요.");
    }
  };

  return (
    <Button
      onClick={onNext}
      className={cn(
        nextLessonId && !isCompleted && "bg-primary",
        nextLessonId && isCompleted && "bg-primary/70",
        !nextLessonId && !isCompleted && "bg-primary",
        !nextLessonId && isCompleted && "bg-primary/70"
      )}
    >
      {nextLessonId && !isCompleted ? (
        <>
          <span>완료하고 다음으로</span>
          <ArrowRightCircle />
        </>
      ) : nextLessonId && isCompleted ? (
        <>
          <span>다음으로</span>
          <ArrowRightCircle />
        </>
      ) : !nextLessonId && !isCompleted ? (
        <>
          <span>완료하기</span>
          <CheckCircle2 />
        </>
      ) : (
        <>
          <span>완료되었습니다.</span>
          <CheckCircle2 />
        </>
      )}
    </Button>
  );
}
