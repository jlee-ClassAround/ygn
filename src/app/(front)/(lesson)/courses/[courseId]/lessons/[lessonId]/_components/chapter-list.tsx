"use client";

import { ChapterListItem } from "./chapter-list-item";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ChapterWithLessons } from "../actions/get-chapters-with-lessons";

interface Props {
  chapters: ChapterWithLessons[];
  courseId: string;
}

export function ChapterList({ chapters, courseId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const lessonId = pathname.split("/").pop();

  useEffect(() => {
    if (!containerRef.current) return;

    const activeLesson = containerRef.current.querySelector(
      `[data-lesson-id="${lessonId}"]`
    );
    if (activeLesson) {
      const containerTop = containerRef.current.offsetTop;
      const lessonTop = (activeLesson as HTMLElement).offsetTop;

      containerRef.current.scrollTop = lessonTop - containerTop - 100;
    }
  }, [lessonId]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col px-7 py-7 gap-y-5 h-full overflow-y-auto"
    >
      {chapters.map((chapter, index) => (
        <ChapterListItem
          key={chapter.id}
          chapterTitle={chapter.title}
          lessons={chapter.lessons}
          courseId={courseId}
          chapterIndex={index + 1}
        />
      ))}
    </div>
  );
}
