"use server";

import { db } from "@/lib/db";

interface Props {
  userId: string;
  platformOrderId: string;
}

export async function cancelPartialPayments({
  userId,
  platformOrderId,
}: Props) {
  const existingOrder = await db.order.findUnique({
    where: { id: platformOrderId, userId, status: "IN_PARTIAL_PROGRESS" },
    select: {
      payments: {
        where: {
          paymentStatus: "DONE",
        },
      },
    },
  });

  if (!existingOrder) {
    return {
      success: false,
      message: "not found",
    };
  }

  if (existingOrder.payments.length !== 0) {
    return {
      success: false,
      message: "결제가 진행된 주문은 취소할 수 없습니다.",
    };
  }

  const updatedOrder = await db.order.update({
    where: { id: platformOrderId, userId },
    data: { status: "CANCELED" },
    select: {
      id: true,
      orderItems: {
        select: {
          productId: true,
          productOptionId: true,
        },
      },
    },
  });

  return {
    success: true,
    message: "분할결제 취소 완료",
    data: {
      courseId: updatedOrder.orderItems[0].productId,
      productOptionId: updatedOrder.orderItems[0].productOptionId,
    },
  };
}
