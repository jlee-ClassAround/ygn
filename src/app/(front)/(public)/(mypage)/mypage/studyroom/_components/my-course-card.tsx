import Image from "next/image";
import Link from "next/link";

import { CheckCircle2, Clock3 } from "lucide-react";

import { cn } from "@/lib/utils";
import { coursesWithProgress } from "@/actions/mypage/get-mypage-courses";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { dateWithoutWeekFormat } from "@/utils/formats";
import { getRemainingDays } from "@/utils/date-utils";
import { getFirstLessonId } from "@/actions/lessons/get-first-lesson-id";

interface Props {
  course: coursesWithProgress;
}

export async function MyCourseCard({ course }: Props) {
  const remainingDays = course.expiredAt
    ? getRemainingDays(course.expiredAt)
    : null;

  const dDayDisplay =
    remainingDays === null
      ? "D-999"
      : remainingDays > 0
      ? `D-${remainingDays}`
      : `만료`;

  const firstLessonId = await getFirstLessonId({ courseId: course.id });

  return (
    <div key={course.id} className="flex flex-col">
      {/* 썸네일 */}
      <div className="relative aspect-video mb-3">
        <Image
          fill
          src={course.thumbnail || ""}
          alt="Course thumbnail"
          className="object-cover rounded-lg select-none"
          draggable={false}
        />
      </div>

      {/* 콘텐츠 */}
      <div className="flex flex-col gap-y-2 justify-between flex-1">
        {/* 콘텐츠 헤더 */}
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            {course.isCompleted ? (
              <>
                <CheckCircle2 className="fill-green-500 text-background size-5 mr-1" />
                <span className="text-sm font-medium">완료</span>
              </>
            ) : (
              <>
                <Clock3 className="fill-primary text-background size-5 mr-1" />
                <span className="text-sm font-medium text-foreground/50">
                  진행 중
                </span>
              </>
            )}
          </div>
          {course.category?.name && (
            <div className="flex items-center">
              <div className="text-xs py-1 px-2 rounded-md bg-foreground/10 text-primary font-medium">
                {course.category.name}
              </div>
            </div>
          )}
          <div className="flex items-center gap-x-2">
            {course.teachers.map((teacher) => (
              <span key={teacher.id} className="text-sm text-foreground/50">
                {teacher.name}
              </span>
            ))}
          </div>
        </div>
        {/* 컨텐츠 푸터 */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{course.title}</h3>
          <Progress
            value={course.progress}
            className="h-1"
            indicatorClassName={cn(course.isCompleted && "bg-green-500")}
          />
          <div className="flex items-start gap-x-2">
            <div className="flex flex-col gap-y-1 flex-1">
              <div className="flex items-center gap-x-2">
                <span className="text-xs text-foreground/50">
                  남은 수강기간
                </span>
                <span className="text-primary font-semibold text-lg">
                  {dDayDisplay}
                </span>
              </div>
              <span className="text-sm text-foreground/50">
                {course.expiredAt
                  ? `${dateWithoutWeekFormat(course.expiredAt)} 까지`
                  : "무제한"}
              </span>
            </div>
            <div className="flex items-center gap-x-1 flex-1">
              <span className="text-xs text-foreground/50">진도율 </span>
              <span
                className={cn(
                  "text-primary font-semibold text-lg",
                  course.isCompleted && "text-green-500"
                )}
              >
                {course.progress || 0}%
              </span>
            </div>
          </div>
          <Button
            type="button"
            size="lg"
            disabled={!firstLessonId}
            className={cn(
              "w-full font-semibold h-12",
              course.isCompleted && "bg-green-500",
              !course.isActive && "bg-primary/80"
            )}
            asChild={firstLessonId ? true : false}
          >
            {!firstLessonId ? (
              "준비 중..."
            ) : course.isActive ? (
              <Link href={`/courses/${course.id}/lessons`}>
                {course.isCompleted ? "복습하러 가기" : "수강하러 가기"}
              </Link>
            ) : (
              <Link href={`/checkout?courseId=${course.id}`}>
                연장하러 가기
              </Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
