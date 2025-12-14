"use client";

import { cn } from "@/lib/utils";
import { Check, File, PlayCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  lessonId: string;
  courseId: string;
  lessonTitle: string;
  hasVideo: boolean;
  hasAttachments: boolean;
  isCompleted: boolean;
}

export function LessonListItem({
  lessonId,
  lessonTitle,
  courseId,
  hasVideo,
  hasAttachments,
  isCompleted,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname.includes(lessonId);

  return (
    <button
      data-lesson-id={lessonId}
      className={cn(
        "flex items-center text-foreground/70 hover:text-primary transition",
        isActive && "text-primary/80 hover:text-primary/100 font-semibold",
        !isActive && isCompleted && "text-foreground/30"
      )}
      onClick={() => router.push(`/courses/${courseId}/lessons/${lessonId}`)}
    >
      <span className="text-left truncate">{lessonTitle}</span>
      {hasVideo && !isCompleted && <PlayCircle className="size-4 ml-2" />}
      {isCompleted && <Check className="size-4 ml-2" />}
      {hasAttachments && <File className="size-4 ml-2" />}
    </button>
  );
}
