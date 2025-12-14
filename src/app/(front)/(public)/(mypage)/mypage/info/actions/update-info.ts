"use server";

import { db } from "@/lib/db";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { UserInfoSchema } from "@/validations/schemas";

interface Props {
  userId: string;
  values: UserInfoSchema;
}

export async function updateInfo({ userId, values }: Props) {
  try {
    const isAdmin = await getIsAdmin();

    const { username, ...rest } = values;

    const updatedUser = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        ...rest,
        ...(isAdmin ? { username } : {}),
      },
    });

    return updatedUser;
  } catch (e) {
    console.log("[UPDATE_INFO_ERROR]", e);
    return null;
  }
}
