"use client";

import { Progress } from "@/components/ui/progress";

interface Props {
  progressPercentage: number;
  courseTitle: string;
}

export function LessonSidebarHeader({
  progressPercentage,
  courseTitle,
}: Props) {
  return (
    <div className="flex flex-col items-center p-4 border-b">
      <div className="font-semibold mb-3">{courseTitle}</div>
      <Progress value={progressPercentage} />
      <div className="text-xs font-medium mt-2">
        {progressPercentage}% 완료되었습니다!
      </div>
    </div>
  );
}
