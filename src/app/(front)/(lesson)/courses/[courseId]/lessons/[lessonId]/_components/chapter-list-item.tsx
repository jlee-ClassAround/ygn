"use client";

import { LessonWithProgressWithAttachments } from "../actions/get-chapters-with-lessons";
import { LessonListItem } from "./lesson-list-item";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  chapterTitle: string;
  lessons: LessonWithProgressWithAttachments[];
  courseId: string;
  chapterIndex: number;
}

export function ChapterListItem({
  chapterTitle,
  lessons,
  courseId,
  chapterIndex,
}: Props) {
  return (
    <Accordion
      type="multiple"
      defaultValue={[`chapter-${chapterIndex}`]}
      className="w-full"
    >
      <AccordionItem value={`chapter-${chapterIndex}`}>
        <AccordionTrigger
          className="hover:no-underline [&[data-state=open]>svg]:rotate-180 [&>svg]:text-foreground [&>svg]:transition-transform [&>svg]:duration-200"
          isArrow
        >
          <div className="flex items-center gap-x-2">
            <span className="bg-foreground/20 rounded-md aspect-square shrink-0 size-6 flex items-center justify-center text-foreground leading-snug font-semibold p-[2px] pt-1">
              {chapterIndex}
            </span>
            <span className="font-semibold text-xl">{chapterTitle}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-y-2 pl-8 pt-2">
            {lessons.map((lesson) => (
              <LessonListItem
                key={lesson.id}
                courseId={courseId}
                lessonTitle={lesson.title}
                lessonId={lesson.id}
                hasVideo={Boolean(lesson.videoUrl)}
                hasAttachments={Boolean(lesson.attachments.length)}
                isCompleted={lesson.userProgresses?.[0]?.isCompleted || false}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
