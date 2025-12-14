"use server";

import { PaymentMethod } from "@/constants/payments/payment-method";
import { db } from "@/lib/db";
import {
  confirmPayment,
  isTossPaymentFailure,
} from "@/external-api/tosspayments/services/confirm-payment";
import { getSession } from "@/lib/session";
import { calculateEndDate } from "@/utils/date-utils";
import { revalidateTag } from "next/cache";
import {
  calculateFee,
  EasyPayType,
} from "@/external-api/tosspayments/utils/calcurate-fee";

interface Props {
  paymentType?: string;
  orderId: string;
  paymentKey: string;
  amount: number;
  platformOrderId: string;
}

export async function confirmPartialPayments({
  paymentType,
  orderId: tossPaymentId,
  paymentKey,
  amount,
  platformOrderId,
}: Props) {
  try {
    // 요청 바디 검증

    if (!tossPaymentId || !paymentKey || !amount) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    const session = await getSession();
    const userId = session?.id;
    // 로그인 유저 검증
    if (!userId) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    // 금액 검증
    if (amount < 100 || amount > 10000000) {
      // 최소 100원, 최대 1000만원
      return {
        success: false,
        message: "허용되지 않는 결제 금액입니다.",
      };
    }

    const orderData = await db.order.findUnique({
      where: {
        id: platformOrderId,
        userId: userId, // 🔒 사용자 권한 검증
      },
      include: {
        orderItems: {
          select: {
            productOptionId: true,
            course: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!orderData) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    if (orderData.status !== "IN_PARTIAL_PROGRESS") {
      return {
        success: false,
        message: "분할결제 주문이 아니거나 이미 처리된 주문입니다.",
      };
    }

    // 🔒 서버에서 계산한 금액과 클라이언트 금액 비교
    if (amount > orderData.amount) {
      return {
        success: false,
        message: "분할결제 금액이 총 결제 금액보다 큽니다.",
      };
    }

    if (amount > orderData.remainingAmount) {
      return {
        success: false,
        message: "분할결제 금액이 남은 결제 금액보다 큽니다.",
      };
    }

    // 🔒 이미 완료된 결제인지 확인
    if (orderData.remainingAmount <= 0) {
      return {
        success: false,
        message: "이미 완료된 주문입니다.",
      };
    }

    // 옵션상품 체크
    const courseOption = orderData.orderItems[0].productOptionId
      ? await db.courseOption.findUnique({
          where: { id: orderData.orderItems[0].productOptionId },
        })
      : null;

    // 토스 결제 완료 요청
    const tossPaymentResult = await confirmPayment({
      orderId: tossPaymentId,
      amount,
      paymentKey,
    });

    if (isTossPaymentFailure(tossPaymentResult)) {
      return {
        success: false,
        message: tossPaymentResult.message,
      };
    }

    // 결제 방법 매칭
    let paymentMethod: PaymentMethod;
    switch (tossPaymentResult.method) {
      case "카드":
        paymentMethod = "CARD";
        break;
      case "가상계좌":
        paymentMethod = "VIRTUAL_ACCOUNT";
        break;
      case "계좌이체":
        paymentMethod = "TRANSFER";
        break;
      case "간편결제":
        paymentMethod = "EASY_PAY";
        break;
      default:
        paymentMethod = "CARD";
        break;
    }

    // 남은 결제 금액 계산
    const remainingAmount = orderData.remainingAmount - amount;
    const isCompleted = remainingAmount === 0;
    const isTaxFree = courseOption
      ? courseOption.isTaxFree
      : orderData.orderItems[0].course?.isTaxFree;

    // 토스 결제 완료시 처리
    if (tossPaymentResult.status === "DONE") {
      await db.$transaction(async (tx) => {
        // 남은 결제 금액 업데이트
        await tx.order.update({
          where: {
            id: platformOrderId,
          },
          data: {
            remainingAmount,
            // 남은 결제 금액이 0이면 주문 상태 업데이트
            ...(isCompleted && { status: "PAID" }),
            paidAmount: orderData.paidAmount + amount,
          },
        });

        // 결제 데이터 생성
        const newPayment = await tx.payment.create({
          data: {
            id: tossPaymentId,
            mId: tossPaymentResult.mId,
            orderId: platformOrderId,
            paymentMethod,
            paymentStatus: "DONE",
            tossPaymentKey: tossPaymentResult.paymentKey,
            tossSecretKey: tossPaymentResult.secret,
            amount,
            isTaxFree,
            receiptUrl: tossPaymentResult.receipt?.url,
            fee: calculateFee(
              amount,
              paymentMethod,
              tossPaymentResult.easyPay?.provider as EasyPayType | undefined
            ),
            isPartialCancelable: tossPaymentResult.isPartialCancelable,
          },
          select: {
            id: true,
          },
        });

        // 거래 이력 생성
        await tx.transaction.create({
          data: {
            orderId: platformOrderId,
            method: paymentMethod,
            status: "DONE",
            customerKey: userId,
            amount,
            userId,
            paymentId: newPayment.id,
          },
        });
      });

      // 모든 분할 결제 완료시 처리
      if (isCompleted) {
        // 강의 등록 처리
        if (orderData.orderItems[0].course) {
          await db.enrollment.upsert({
            where: {
              userId_courseId: {
                userId: userId,
                courseId: orderData.orderItems[0].course.id,
              },
            },
            update: {
              courseOptionId: orderData.orderItems[0].productOptionId || null,
              startDate: new Date(),
              endDate: orderData.orderItems[0].course.accessDuration
                ? calculateEndDate(
                    null,
                    orderData.orderItems[0].course.accessDuration
                  )
                : null,
              isActive: true,
              enrollCount: {
                increment: 1,
              },
            },
            create: {
              userId: userId,
              courseId: orderData.orderItems[0].course.id,
              courseOptionId: orderData.orderItems[0].productOptionId || null,
              startDate: new Date(),
              endDate: orderData.orderItems[0].course.accessDuration
                ? calculateEndDate(
                    null,
                    orderData.orderItems[0].course.accessDuration
                  )
                : null,
            },
          });
        }

        revalidateTag(`course-${orderData.orderItems[0].course?.id}`);
      }

      return {
        success: true,
        message: "Payment Success",
        data: {
          isCompleted,
          remainingAmount,
          courseId: orderData.orderItems[0].course?.id,
        },
      };
    }

    // 가상계좌 요청 완료시 처리
    if (tossPaymentResult.status === "WAITING_FOR_DEPOSIT") {
      await db.$transaction(async (tx) => {
        // 결제 데이터 생성
        const newPayment = await tx.payment.create({
          data: {
            id: tossPaymentId,
            mId: tossPaymentResult.mId,
            orderId: platformOrderId,
            paymentMethod,
            paymentStatus: "WAITING_FOR_DEPOSIT",
            tossPaymentKey: tossPaymentResult.paymentKey,
            tossSecretKey: tossPaymentResult.secret,
            amount,
            isTaxFree,
            receiptUrl: tossPaymentResult.receipt?.url,
            fee: calculateFee(
              amount,
              paymentMethod,
              tossPaymentResult.easyPay?.provider as EasyPayType | undefined
            ),
            isPartialCancelable: tossPaymentResult.isPartialCancelable,
          },
          select: {
            id: true,
          },
        });

        // 거래 이력 생성
        await tx.transaction.create({
          data: {
            orderId: platformOrderId,
            method: paymentMethod,
            status: "WAITING_FOR_DEPOSIT",
            customerKey: userId,
            amount,
            userId,
            paymentId: newPayment.id,
          },
          select: {
            id: true,
          },
        });

        if (tossPaymentResult.virtualAccount) {
          // 가상계좌 정보 저장
          await tx.virtualAccount.create({
            data: {
              paymentId: newPayment.id,
              accountNumber: tossPaymentResult.virtualAccount.accountNumber,
              bankCode: tossPaymentResult.virtualAccount.bankCode,
              customerName: tossPaymentResult.virtualAccount.customerName,
              dueDate: tossPaymentResult.virtualAccount.dueDate,
            },
            select: {
              id: true,
            },
          });
        }
      });

      console.log("[PAYMENT_CONFIRM_WAITING_FOR_DEPOSIT]");

      return {
        success: true,
        message: "Payment Success",
        data: {
          isVirtualAccount: true,
        },
      };
    }

    return {
      success: false,
      message: "Payment Failed",
    };
  } catch (e) {
    console.error("[PAYMENT_CONFIRM_ERROR]", e);
    return {
      success: false,
      message: "Internal Error",
    };
  }
}
