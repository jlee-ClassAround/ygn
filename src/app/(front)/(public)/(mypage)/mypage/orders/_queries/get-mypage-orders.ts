import { db } from "@/lib/db";
import { Order, Payment, PaymentCancel, VirtualAccount } from "@prisma/client";

interface Props {
  userId?: string | null;
  currentPage?: number;
  pageSize?: number;
}

export interface MyPageOrder extends Order {
  payments: (Payment & {
    virtualAccount: VirtualAccount | null;
    paymentCancels: PaymentCancel[];
  })[];
}

export async function getMypageOrders({
  userId,
  currentPage = 1,
  pageSize = 6,
}: Props): Promise<{ orders: MyPageOrder[]; totalPages: number }> {
  try {
    if (!userId) return { orders: [], totalPages: 0 };
    const orders = await db.order.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      include: {
        payments: {
          include: {
            virtualAccount: true,
            paymentCancels: true,
          },
        },
      },
    });

    const totalCount = await db.order.count({
      where: {
        userId,
      },
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return { orders, totalPages };
  } catch (error) {
    console.error(error);
    return { orders: [], totalPages: 0 };
  }
}
