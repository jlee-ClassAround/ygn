"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

interface Props {
  lessonId: string;
}

export async function completeLesson({ lessonId }: Props) {
  try {
    const session = await getSession();
    if (!session.id) return false;

    await db.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.id,
          lessonId,
        },
      },
      create: {
        userId: session.id,
        lessonId,
        isCompleted: true,
      },
      update: {
        isCompleted: true,
      },
      select: {
        id: true,
      },
    });

    return true;
  } catch (e) {
    console.log("[COMPLETE_LESSON_ERROR]", e);
    return false;
  }
}
