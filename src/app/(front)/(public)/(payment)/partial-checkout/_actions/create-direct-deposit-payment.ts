"use server";

import { DirectDepositFormSchema } from "../_hooks/use-direct-deposit-form";
import { db } from "@/lib/db";
import { getLoggedInUserId } from "@/utils/auth/get-logged-in-user-id";
import { generateOrderNumber } from "@/utils/payments/generate-order-number";

interface Props {
  tossOrderId: string;
  productId: string;
  productOptionId?: string;
  userId: string;
  couponId?: string;
  values: DirectDepositFormSchema;
  amount: number;
}

export async function createDirectDepositPayment({
  tossOrderId,
  productId,
  productOptionId,
  userId,
  couponId,
  values,
  amount,
}: Props) {
  const LoggedInUserId = await getLoggedInUserId();
  if (!LoggedInUserId || userId !== LoggedInUserId)
    return {
      success: false,
      message: "로그인이 필요합니다.",
    };

  // 유저 입력 정보 저장
  await db.userBillingInfo.upsert({
    where: {
      userId: userId,
    },
    update: {
      ...values,
    },
    create: {
      ...values,
      userId: userId,
    },
  });

  let courseId = productId;
  let optionId = productOptionId;

  // 코스 정보가 있는지 검사
  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      title: true,
      productType: true,
      originalPrice: true,
      discountedPrice: true,
      accessDuration: true,
      isTaxFree: true,
      kakaoRoomLink: true,
      kakaoRoomPassword: true,
    },
  });
  if (!course)
    return {
      success: false,
      message: "Not Found Course",
    };

  // 이미 강의가 등록되었는지 검사
  const checkEnrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: userId,
        courseId: courseId,
      },
    },
    select: {
      userId: true,
      endDate: true,
    },
  });
  if (checkEnrollment && !checkEnrollment.endDate)
    return {
      success: false,
      message: "Already Enrolled Course",
    };

  // 사용자가 쿠폰을 사용했을 때 검증 로직
  let couponData = null;
  let userCouponData = null;
  if (couponId) {
    // 쿠폰이 존재하는지 검증
    const couponResult = await db.coupon.findUnique({
      where: {
        id: couponId,
      },
      select: {
        id: true,
        discountType: true,
        discountAmount: true,
        usageLimit: true,
        usedCount: true,
        expiryDate: true,
        courses: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!couponResult)
      return {
        success: false,
        message: "존재하지 않는 쿠폰입니다.",
      };
    if (
      couponResult.usageLimit &&
      couponResult.usedCount >= couponResult.usageLimit
    )
      return {
        success: false,
        message: "쿠폰 사용 제한 초과",
      };
    if (couponResult.expiryDate < new Date())
      return {
        success: false,
        message: "만료된 쿠폰입니다.",
      };
    if (!couponResult.courses.some((course) => course.id === courseId))
      return {
        success: false,
        message: "쿠폰 사용 불가능한 코스입니다.",
      };

    // 유저에게 쿠폰이 등록되어 있는지 검증
    const userCouponResult = await db.userCoupon.findUnique({
      where: {
        userId_couponId: {
          userId: userId,
          couponId: couponResult.id,
        },
      },
    });
    if (!userCouponResult)
      return {
        success: false,
        message: "등록되지 않은 쿠폰입니다.",
      };

    couponData = couponResult;
    userCouponData = userCouponResult;
  }

  // 상품 타입에 따른 가격 계산
  let salePrice;

  // 옵션 상품일 때 검증
  let courseOption = null;
  if (course.productType === "OPTION") {
    if (!optionId) {
      return {
        success: false,
        message: "Not Found.",
      };
    } else {
      const courseOptionResult = await db.courseOption.findUnique({
        where: {
          id: optionId,
        },
        select: {
          id: true,
          name: true,
          originalPrice: true,
          discountedPrice: true,
          isTaxFree: true,
          maxPurchaseCount: true,
        },
      });
      if (!courseOptionResult)
        return {
          success: false,
          message: "Not Found.",
        };
      const enrolledCountAtOption = await db.enrollment.count({
        where: {
          courseOptionId: courseOptionResult.id,
          userId: userId,
        },
      });
      if (
        courseOptionResult.maxPurchaseCount &&
        enrolledCountAtOption >= courseOptionResult.maxPurchaseCount
      )
        return {
          success: false,
          message: "옵션 상품 구매 제한 초과",
        };

      courseOption = courseOptionResult;

      salePrice =
        courseOptionResult?.discountedPrice ||
        courseOptionResult?.originalPrice ||
        0;
    }
  } else {
    salePrice = course.discountedPrice
      ? course.discountedPrice
      : course.originalPrice!;
  }

  // 쿠폰 적용 최종 결제 가격 계산
  let finalPrice = salePrice;
  if (couponData) {
    if (couponData.discountType === "PERCENTAGE") {
      finalPrice = salePrice * ((100 - couponData.discountAmount) / 100);
    } else {
      finalPrice = salePrice - couponData.discountAmount;
    }
  }

  // 요청한 가격과 실제 상품 가격이 매칭되는지 검증
  if (amount !== finalPrice)
    return {
      success: false,
      message: "Amount Error",
    };

  // 검증 완료 후 처리 로직
  await db.$transaction(async (tx) => {
    const billingSnapshotResult = await tx.billingSnapshot.create({
      data: {
        ...values,
      },
      select: {
        id: true,
      },
    });

    const createdOrder = await tx.order.create({
      data: {
        userId,
        orderNumber: generateOrderNumber(),
        status: "PENDING",
        type: "BULK_PAYMENT",
        orderName: course.title,
        amount: finalPrice,
        remainingAmount: finalPrice,
        paidAmount: 0,
        originalPrice: course.originalPrice || 0,
        discountedPrice: course.discountedPrice,
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
        productCategory: "COURSE",
        productId: course.id,
        productTitle: course.title,
        productOptionId: optionId,
        productOption: courseOption || undefined,
        quantity: 1,
        originalPrice: course.originalPrice || 0,
        discountedPrice: course.discountedPrice,
        courseId: course.id,
      },
    });

    const createdPayment = await tx.payment.create({
      data: {
        id: tossOrderId,
        orderId: createdOrder.id,
        amount: finalPrice,
        fee: 0, // 직접입금은 수수료 없음
        isTaxFree: courseOption ? courseOption.isTaxFree : course.isTaxFree,
        paymentMethod: "DIRECT_DEPOSIT",
        paymentStatus: "WAITING_FOR_DIRECT_DEPOSIT",
        billingSnapshotId: billingSnapshotResult.id,
      },
      select: {
        id: true,
      },
    });

    await tx.transaction.create({
      data: {
        orderId: createdOrder.id,
        method: "DIRECT_DEPOSIT",
        status: "WAITING_FOR_DIRECT_DEPOSIT",
        customerKey: userId,
        userId: userId,
        paymentId: createdPayment.id,
        amount: finalPrice,
      },
    });
  });

  return {
    success: true,
    message: "결제 요청 완료",
  };
}
