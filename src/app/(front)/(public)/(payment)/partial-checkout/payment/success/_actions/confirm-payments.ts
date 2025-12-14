'use server';

import { PaymentMethod } from '@/constants/payments/payment-method';
import {
    confirmPayment,
    isTossPaymentFailure,
} from '@/external-api/tosspayments/services/confirm-payment';
import { calculateFee, EasyPayType } from '@/external-api/tosspayments/utils/calcurate-fee';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { calculateEndDate } from '@/utils/date-utils';
import { generateOrderNumber } from '@/utils/payments/generate-order-number';
import { revalidateTag } from 'next/cache';
import { sendAlimtalk } from '@/actions/alimtalk/send-alimtalk';

interface Props {
    paymentType?: string;
    orderId: string;
    paymentKey: string;
    amount: number;

    productId: string;
    productOptionId?: string;
    userId: string;
    couponId?: string;
}

export async function confirmPayments({
    orderId,
    paymentKey,
    amount,
    productId, //main course ID값
    productOptionId,
    userId,
    couponId,
}: Props) {
    try {
        // 로그인 했는지 검사
        const session = await getSession();
        if (!session.id)
            return {
                success: false,
                message: 'Unauthorized',
            };

        // 유저 정보 있는지 검사
        const user = await db.user.findUnique({
            where: {
                id: session.id,
            },
            select: {
                id: true,
                phone: true,
                username: true,
            },
        });
        if (!user)
            return {
                success: false,
                message: 'Unauthorized',
            };

        // 요청한 유저와 로그인한 유저가 동일한 유저인지 검증
        if (session.id !== userId)
            return {
                success: false,
                message: 'Unauthorized',
            };

        // 코스 정보가 있는지 검사
        const course = await db.course.findUnique({
            where: {
                id: productId,
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
                message: 'Not Found Course',
            };

        // 이미 강의가 등록되었는지 검사
        const checkEnrollment = await db.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.id,
                    courseId: productId,
                },
            },
            select: {
                id: true,
                endDate: true,
            },
        });
        if (checkEnrollment && !checkEnrollment.endDate)
            return {
                success: false,
                message: 'Already Enrolled Course',
            };

        // 분할결제 쿠폰 사용X

        // 토스페이먼츠 최종 승인 요청
        const tossPaymentResult = await confirmPayment({
            orderId,
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
            case '카드':
                paymentMethod = 'CARD';
                break;
            case '가상계좌':
                paymentMethod = 'VIRTUAL_ACCOUNT';
                break;
            case '계좌이체':
                paymentMethod = 'TRANSFER';
                break;
            case '간편결제':
                paymentMethod = 'EASY_PAY';
                break;
            default:
                paymentMethod = 'CARD';
                break;
        }

        // 승인 완료 후 처리 로직
        if (tossPaymentResult.status === 'DONE') {
            const result = await db.$transaction(async (tx) => {
                // 토스 고객 생성 (추후 삭제 예정)
                const tossCustomer = await tx.tossCustomer.create({
                    data: {
                        userId: user.id,
                        paymentKey: tossPaymentResult.paymentKey,
                        orderId: tossPaymentResult.orderId,
                        orderName: tossPaymentResult.orderName,
                        tossSecretKey: tossPaymentResult.secret,
                        mId: tossPaymentResult.mId,
                        originalPrice: course.originalPrice || 0,
                        discountPrice: course.discountedPrice,
                        isTaxFree: course.isTaxFree,
                        couponType: null,
                        couponAmount: null,
                        finalPrice: amount,
                        receiptUrl: tossPaymentResult.receipt?.url,

                        productType: 'COURSE',
                        productId: course.id,
                        productTitle: course.title,
                        productOptionId: productOptionId,
                        productOption: undefined,
                        paymentStatus: 'COMPLETED',
                        paymentMethod,
                        courseId: productId,
                    },
                    select: {
                        orderId: true,
                        paymentKey: true,
                    },
                });

                // 주문내역 생성
                const createdOrder = await tx.order.create({
                    data: {
                        orderName: tossPaymentResult.orderName,
                        orderNumber: generateOrderNumber(),
                        userId,
                        type: 'BULK_PAYMENT',
                        status: 'PAID',
                        amount: amount,
                        remainingAmount: 0,
                        paidAmount: amount,
                        originalPrice: course.originalPrice ?? 0,
                        discountedPrice: course.discountedPrice,
                        usedCoupon: undefined,
                    },
                    select: {
                        id: true,
                    },
                });

                // 주문 상품 생성
                await tx.orderItem.create({
                    data: {
                        orderId: createdOrder.id,
                        courseId: course.id,
                        productId: course.id,
                        productTitle: course.title,
                        productCategory: 'COURSE',
                        originalPrice: course.originalPrice ?? 0,
                        discountedPrice: course.discountedPrice,
                    },
                    select: {
                        id: true,
                    },
                });

                // 결제내역 생성
                const createdPayment = await tx.payment.create({
                    data: {
                        id: tossPaymentResult.orderId,
                        mId: tossPaymentResult.mId,
                        orderId: createdOrder.id,
                        tossPaymentKey: tossPaymentResult.paymentKey,
                        tossSecretKey: tossPaymentResult.secret,
                        paymentMethod,
                        paymentStatus: 'DONE',
                        amount,
                        isTaxFree: course.isTaxFree,
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

                // 거래내역 생성
                await tx.transaction.create({
                    data: {
                        orderId: createdOrder.id,
                        paymentId: createdPayment.id,
                        method: paymentMethod,
                        status: 'DONE',
                        customerKey: user.id,
                        userId: user.id,
                        amount: amount,
                    },
                });

                // 수강 등록
                await tx.enrollment.upsert({
                    where: {
                        userId_courseId: {
                            userId: user.id,
                            courseId: productId,
                        },
                    },
                    update: {
                        courseOptionId: productOptionId || null,
                        startDate: new Date(),
                        endDate: course.accessDuration
                            ? calculateEndDate(
                                  checkEnrollment?.endDate || null,
                                  course.accessDuration
                              )
                            : null,
                        isActive: true,
                        enrollCount: {
                            increment: 1,
                        },
                    },
                    create: {
                        userId: user.id,
                        courseId: course.id,
                        courseOptionId: productOptionId || null,
                        endDate: course.accessDuration
                            ? calculateEndDate(
                                  checkEnrollment?.endDate || null,
                                  course.accessDuration
                              )
                            : null,
                    },
                    select: {
                        id: true,
                    },
                });

                return {
                    tossCustomer,
                };
            });

            // 결제 완료 알림톡
            await sendAlimtalk({
                sendType: 'payment-confirm',
                phone: user.phone || '',
                username: user.username || '고객',
                courseName: tossPaymentResult.orderName,
                roomLink: course.kakaoRoomLink || '',
                roomCode: course.kakaoRoomPassword || '',
            });

            revalidateTag(`course-${productId}`);

            return {
                success: true,
                message: 'Payment Success',
                data: {
                    orderId: result.tossCustomer.orderId,
                    paymentKey: result.tossCustomer.paymentKey,
                    courseId: course.id,
                    amount,
                },
            };
        }

        return {
            success: false,
            message: 'Payment Failed',
        };
    } catch (e) {
        console.log('[PAYMENT_CONFIRM_ERROR]', e);
        return {
            success: false,
            message: e instanceof Error ? e.message : 'Internal Error',
        };
    }
}
