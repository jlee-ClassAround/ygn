"use server";

import { getUser } from "@/actions/users/get-user";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function removeUser() {
  const session = await getSession();
  if (!session.id) return;
  const user = await getUser(session.id);
  if (!user) return;

  await db.user.delete({
    where: {
      id: user.id,
    },
  });

  session.destroy();
}
