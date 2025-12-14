"use server";

import { db } from "@/lib/db";

export async function increaseEbookDownloadCount(
  ebookId: string,
  userId: string
) {
  await db.ebookPurchase.update({
    where: { userId_ebookId: { userId, ebookId } },
    data: { downloadCount: { increment: 1 } },
    select: { id: true },
  });
}
