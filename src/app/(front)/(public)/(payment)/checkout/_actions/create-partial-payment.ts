"use server";

import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { checkPaymentValidation } from "@/utils/payments/check-payment-validation";
import { generateOrderNumber } from "@/utils/payments/generate-order-number";

interface Props {
  productType: "COURSE" | "EBOOK";
  productId: string;
  productOptionId?: string;
  userId: string;
  couponId?: string;
  amount: number;
}

export async function createPartialPayment({
  productType,
  productId,
  productOptionId,
  userId,
  couponId,
  amount,
}: Props) {
  try {
    // 🔒 서버에서 사용자 ID 검증
    const session = await getSession();
    const serverUserId = session?.id;
    if (!serverUserId || serverUserId !== userId) {
      throw new Error("인증되지 않은 사용자입니다.");
    }

    // 🔒 입력값 검증
    if (!productId || !amount || amount <= 0 || amount > 10000000) {
      throw new Error("잘못된 입력값입니다.");
    }

    const checkOrder = await db.order.findFirst({
      where: {
        userId,
        status: "IN_PARTIAL_PROGRESS",
        orderItems: {
          some: {
            productId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (checkOrder) {
      return {
        success: false,
        message: "이미 분할결제 중입니다.",
        status: "IN_PARTIAL_PROGRESS",
        data: {
          platformOrderId: checkOrder.id,
        },
      };
    }

    const {
      success,
      message,
      data: { originalPrice, discountedPrice } = {},
    } = await checkPaymentValidation({
      productType,
      productId,
      productOptionId,
      userId,
      couponId,
      amount,
    });

    if (!success) throw new Error(message);

    const data = await db.$transaction(async (tx) => {
      const courseData = await tx.course.findUnique({
        where: {
          id: productId,
        },
        select: {
          title: true,
          originalPrice: true,
          discountedPrice: true,
          isTaxFree: true,
          options: {
            where: {
              id: productOptionId,
            },
            select: {
              name: true,
            },
          },
        },
      });

      if (!courseData) {
        throw new Error("강의를 찾을 수 없습니다.");
      }

      let couponData = null;
      if (couponId) {
        couponData = await tx.coupon.findUnique({
          where: {
            id: couponId,
          },
          select: {
            id: true,
            discountType: true,
            discountAmount: true,
          },
        });
      }

      const orderName = `${courseData.title}${
        courseData.options.length > 0 ? ` - ${courseData.options[0].name}` : ""
      }`;

      const createdOrder = await tx.order.create({
        data: {
          type: "SPLIT_PAYMENT",
          status: "IN_PARTIAL_PROGRESS",
          orderName,
          orderNumber: generateOrderNumber(),
          userId,
          amount,
          remainingAmount: amount,
          paidAmount: 0,
          originalPrice: originalPrice || 0,
          discountedPrice: discountedPrice || 0,

          usedCoupon: couponData
            ? {
                id: couponData.id,
                type: couponData.discountType,
                amount: couponData.discountAmount,
              }
            : undefined,
        },
        select: {
          id: true,
        },
      });

      await tx.orderItem.create({
        data: {
          orderId: createdOrder.id,
          courseId: productId,
          productId,
          productTitle: courseData.title,
          productCategory: "COURSE",
          ...(productOptionId
            ? {
                productOptionId,
              }
            : {}),
          originalPrice: originalPrice || 0,
          discountedPrice: discountedPrice || 0,
        },
        select: {
          id: true,
        },
      });

      return {
        platformOrderId: createdOrder.id,
      };
    });

    return {
      success: true,
      message: "완료",
      data,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "오류가 발생했습니다.",
    };
  }
}
