"use server";

import { db } from "@/lib/db";
import { Attachment, Chapter, Lesson } from "@prisma/client";

interface Props {
  courseId: string;
  userId: string;
}

export interface LessonWithProgressWithAttachments extends Lesson {
  userProgresses: { isCompleted: boolean }[];
  attachments: Attachment[];
}

export interface ChapterWithLessons extends Chapter {
  lessons: LessonWithProgressWithAttachments[];
}

export async function getChaptersWithLessons({
  courseId,
  userId,
}: Props): Promise<ChapterWithLessons[]> {
  const chapters = await db.chapter.findMany({
    where: {
      courseId,
      isPublished: true,
    },
    include: {
      lessons: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
        include: {
          userProgresses: {
            where: {
              userId,
            },
            select: {
              isCompleted: true,
            },
          },
          attachments: true,
        },
      },
    },
    orderBy: {
      position: "asc",
    },
  });

  return chapters;
}
