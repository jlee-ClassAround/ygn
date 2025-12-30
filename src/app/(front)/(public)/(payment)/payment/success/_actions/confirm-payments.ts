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
import { normalizeKRPhoneNumber } from '@/utils/formats';

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
    productId,
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

        // 사용자가 쿠폰을 사용했을 때 검증 로직
        let coupon = null;
        let userCoupon = null;
        if (couponId) {
            // 쿠폰이 존재하는지 검증
            coupon = await db.coupon.findUnique({
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
            if (!coupon)
                return {
                    success: false,
                    message: '존재하지 않는 쿠폰입니다.',
                };
            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
                return {
                    success: false,
                    message: '쿠폰 사용 제한 초과',
                };
            if (coupon.expiryDate < new Date())
                return {
                    success: false,
                    message: '만료된 쿠폰입니다.',
                };

            // 유저에게 쿠폰이 등록되어 있는지 검증
            userCoupon = await db.userCoupon.findUnique({
                where: {
                    userId_couponId: {
                        userId: session.id,
                        couponId: coupon.id,
                    },
                },
                select: {
                    id: true,
                },
            });
            if (!userCoupon)
                return {
                    success: false,
                    message: '등록되지 않은 쿠폰입니다.',
                };
        }

        // 상품 타입에 따른 가격 계산
        let salePrice: number;
        let originalPrice: number;
        let discountedPrice: number;

        // 옵션 상품일 때 검증
        let courseOption = null;
        if (course.productType === 'OPTION') {
            if (!productOptionId) {
                return {
                    success: false,
                    message: 'Not Found.',
                };
            } else {
                courseOption = await db.courseOption.findUnique({
                    where: {
                        id: productOptionId,
                    },
                    select: {
                        id: true,
                        name: true,
                        originalPrice: true,
                        discountedPrice: true,
                        isTaxFree: true,
                        maxPurchaseCount: true,
                        _count: {
                            select: {
                                enrollments: true,
                            },
                        },
                    },
                });
                salePrice = courseOption?.discountedPrice || courseOption?.originalPrice || 0;
                originalPrice = courseOption?.originalPrice || 0;
                discountedPrice = courseOption?.discountedPrice || 0;
            }
        } else {
            salePrice = course.discountedPrice ? course.discountedPrice : course.originalPrice!;
            originalPrice = course.originalPrice || 0;
            discountedPrice = course.discountedPrice || 0;
        }

        // 쿠폰 적용 최종 결제 가격 계산
        let finalPrice = salePrice;
        if (coupon) {
            if (coupon.discountType === 'percentage') {
                finalPrice = salePrice * ((100 - coupon.discountAmount) / 100);
            } else {
                finalPrice = salePrice - coupon.discountAmount;
            }
        }

        // 요청한 가격과 실제 상품 가격이 매칭되는지 검증
        if (Number(amount) !== finalPrice)
            return {
                success: false,
                message: 'Amount Error',
            };

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

                        ...(courseOption
                            ? {
                                  originalPrice: courseOption.originalPrice,
                                  discountPrice: courseOption.discountedPrice,
                                  isTaxFree: courseOption.isTaxFree,
                              }
                            : {
                                  originalPrice: course.originalPrice || 0,
                                  discountPrice: course.discountedPrice,
                                  isTaxFree: course.isTaxFree,
                              }),

                        couponType: coupon ? coupon.discountType : null,
                        couponAmount: coupon ? coupon.discountAmount : null,
                        finalPrice,
                        receiptUrl: tossPaymentResult.receipt?.url,

                        productType: 'COURSE',
                        productId: course.id,
                        productTitle: course.title,
                        productOptionId: productOptionId,
                        productOption: courseOption || undefined,
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
                        amount: finalPrice,
                        remainingAmount: 0,
                        paidAmount: finalPrice,
                        originalPrice,
                        discountedPrice,
                        usedCoupon: coupon
                            ? {
                                  id: coupon.id,
                                  type: coupon.discountType,
                                  amount: coupon.discountAmount,
                              }
                            : undefined,
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
                        originalPrice,
                        discountedPrice,
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
                        amount: finalPrice,
                        isTaxFree: courseOption ? courseOption.isTaxFree : course.isTaxFree,
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
                        amount: finalPrice,
                    },
                });

                // 쿠폰 사용 처리
                let updatedCoupon = null;
                if (coupon) {
                    updatedCoupon = await tx.userCoupon.update({
                        where: {
                            userId_couponId: {
                                userId: user.id,
                                couponId: coupon.id,
                            },
                        },
                        data: {
                            isUsed: true,
                            usedAt: new Date(),
                        },
                    });

                    await tx.coupon.update({
                        where: {
                            id: coupon.id,
                        },
                        data: {
                            usedCount: coupon.usedCount + 1,
                        },
                    });
                }

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
                    ...(updatedCoupon ? { updatedCoupon } : {}),
                };
            });
            const formattedPhone = normalizeKRPhoneNumber(user.phone ?? '');

            // 결제 완료 알림톡
            await sendAlimtalk({
                phone: formattedPhone,
                username: user.username || '고객',
                courseName: tossPaymentResult.orderName,
                roomLink: 'https://www.buildingschool.co.kr/mypage/studyroom',
                roomCode: '없음',
            });

            revalidateTag(`course-${productId}`);

            return {
                success: true,
                message: 'Payment Success',
                data: {
                    orderId: result.tossCustomer.orderId,
                    paymentKey: result.tossCustomer.paymentKey,
                    courseId: course.id,
                    finalPrice,
                },
            };
        }

        // 가상계좌 요청 완료시 처리
        if (tossPaymentResult.status === 'WAITING_FOR_DEPOSIT') {
            await db.$transaction(async (tx) => {
                // 토스 고객 생성 (추후 삭제 예정)
                const createdTossCustomer = await tx.tossCustomer.create({
                    data: {
                        userId: user.id,
                        paymentKey: tossPaymentResult.paymentKey,
                        orderId: tossPaymentResult.orderId,
                        orderName: tossPaymentResult.orderName,
                        tossSecretKey: tossPaymentResult.secret,
                        mId: tossPaymentResult.mId,
                        ...(courseOption
                            ? {
                                  originalPrice: courseOption.originalPrice,
                                  discountPrice: courseOption.discountedPrice,
                                  isTaxFree: courseOption.isTaxFree,
                              }
                            : {
                                  originalPrice: course.originalPrice || 0,
                                  discountPrice: course.discountedPrice,
                                  isTaxFree: course.isTaxFree,
                              }),

                        couponType: coupon ? coupon.discountType : null,
                        couponAmount: coupon ? coupon.discountAmount : null,
                        finalPrice,
                        receiptUrl: tossPaymentResult.receipt?.url,

                        productType: 'COURSE',
                        productId: course.id,
                        productTitle: course.title,
                        productOptionId: productOptionId,
                        productOption: courseOption || undefined,
                        paymentStatus: 'WAITING_FOR_DEPOSIT',
                        paymentMethod,
                        courseId: productId,
                    },
                    select: {
                        id: true,
                    },
                });

                // 주문 생성
                const createdOrder = await tx.order.create({
                    data: {
                        orderName: tossPaymentResult.orderName,
                        orderNumber: generateOrderNumber(),
                        userId,
                        type: 'BULK_PAYMENT',
                        status: 'PENDING',
                        amount: finalPrice,
                        remainingAmount: finalPrice,
                        paidAmount: 0,
                        originalPrice,
                        discountedPrice,
                        usedCoupon: coupon
                            ? {
                                  id: coupon.id,
                                  type: coupon.discountType,
                                  amount: coupon.discountAmount,
                              }
                            : undefined,
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
                        originalPrice,
                        discountedPrice,
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
                        paymentMethod: 'VIRTUAL_ACCOUNT',
                        paymentStatus: 'WAITING_FOR_DEPOSIT',
                        amount: finalPrice,
                        isTaxFree: courseOption ? courseOption.isTaxFree : course.isTaxFree,
                        receiptUrl: tossPaymentResult.receipt?.url,
                        fee: calculateFee(
                            finalPrice,
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
                        orderId: createdOrder.id,
                        paymentId: createdPayment.id,
                        method: 'VIRTUAL_ACCOUNT',
                        status: 'WAITING_FOR_DEPOSIT',
                        customerKey: user.id,
                        userId: user.id,
                        amount: finalPrice,
                    },
                    select: {
                        id: true,
                    },
                });

                if (tossPaymentResult.virtualAccount) {
                    // 가상계좌 정보 저장
                    await tx.virtualAccount.create({
                        data: {
                            paymentId: createdPayment.id,
                            accountNumber: tossPaymentResult.virtualAccount.accountNumber,
                            bankCode: tossPaymentResult.virtualAccount.bankCode,
                            customerName: tossPaymentResult.virtualAccount.customerName,
                            dueDate: tossPaymentResult.virtualAccount.dueDate,
                            tossCustomerId: createdTossCustomer.id,
                        },
                        select: {
                            id: true,
                        },
                    });
                }

                // 쿠폰 사용 처리
                let updatedCoupon = null;
                if (coupon) {
                    updatedCoupon = await tx.userCoupon.update({
                        where: {
                            userId_couponId: {
                                userId: user.id,
                                couponId: coupon.id,
                            },
                        },
                        data: {
                            isUsed: true,
                            usedAt: new Date(),
                        },
                    });

                    await tx.coupon.update({
                        where: {
                            id: coupon.id,
                        },
                        data: {
                            usedCount: coupon.usedCount + 1,
                        },
                    });
                }
            });

            console.log('[PAYMENT_CONFIRM_WAITING_FOR_DEPOSIT]');

            return {
                success: true,
                message: 'Payment Success',
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
