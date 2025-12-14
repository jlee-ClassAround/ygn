"use server";

import { db } from "@/lib/db";

interface Props {
  userId: string;
  currentPage?: number;
  pageSize?: number;
}

export async function getMypagePayments({
  userId,
  currentPage = 1,
  pageSize = 6,
}: Props) {
  try {
    const payments = await db.tossCustomer.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      include: {
        virtualAccount: true,
      },
    });

    const totalCount = await db.tossCustomer.count({
      where: {
        userId,
      },
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      payments,
      totalPages,
    };
  } catch (error) {
    console.log(error);
    return {
      payments: [],
      totalPages: 0,
    };
  }
}
