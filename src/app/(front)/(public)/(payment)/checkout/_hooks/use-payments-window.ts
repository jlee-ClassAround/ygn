'use client';

import { PaymentMethod } from '@/constants/payments/payment-method';
import { getClientKey } from '@/external-api/tosspayments/services/get-client-key';
import { formatPhoneNumber } from '@/utils/formats';
import { Coupon } from '@prisma/client';
import { loadTossPayments, TossPaymentsPayment } from '@tosspayments/tosspayments-sdk';
import { useRouter } from 'next/navigation';
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

import { getIsPartialPayments } from '@/actions/payments/get-is-partial-payments';
import { useDirectDepositForm } from './use-direct-deposit-form';
import { GetUserBillingInfo } from '@/utils/auth/get-user-billing-info';

const clientKey = getClientKey();

interface Props {
    productPrice: number;
    productType: 'COURSE' | 'EBOOK';
    productId: string;
    productOptionId?: string;
    orderName: string;
    userId: string;
    customerEmail: string;
    customerName: string;
    customerMobilePhone: string | null;
    billingInfo: GetUserBillingInfo;
    isTaxFree: boolean;
}

export function usePaymentsWindow({
    productPrice,
    productType,
    productId,
    productOptionId,
    orderName,
    userId,
    customerEmail,
    customerName,
    customerMobilePhone,
    billingInfo,
    isTaxFree,
}: Props) {
    const router = useRouter();
    const [payment, setPayment] = useState<TossPaymentsPayment | null>(null);
    const [amount, setAmount] = useState({
        currency: 'KRW',
        value: productPrice,
    });
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CARD');
    const [isLoading, setIsLoading] = useState(false);
    const [couponState, setCouponState] = useState<Coupon | null>(null);
    const [isAgreed, setIsAgreed] = useState(false);

    const tossOrderId = uuidv4();

    const qs = queryString.stringify(
        {
            productId,
            productOptionId,
            userId,
            couponId: couponState?.id,
        },
        { skipNull: true, skipEmptyString: true }
    );

    useEffect(() => {
        async function fetchPayment() {
            try {
                const tossPayments = await loadTossPayments(clientKey);
                const payment = tossPayments.payment({
                    customerKey: userId,
                });

                setPayment(payment);
            } catch (e) {
                toast.error(e instanceof Error ? e.message : '결제 준비 중 오류가 발생했습니다.');
                console.error('Error fetching payment:', e);
            }
        }

        fetchPayment();
    }, [clientKey, userId]);

    async function requestPayment() {
        if (!payment) return;

        if (customerMobilePhone) {
            customerMobilePhone = formatPhoneNumber(customerMobilePhone);
        }

        const commonPayload = {
            amount,
            taxFreeAmount: isTaxFree ? amount.value : 0,
            orderId: tossOrderId,
            orderName,
            successUrl: window.location.origin + `/payment/success?${qs}`,
            failUrl: window.location.origin + '/fail',
            customerEmail,
            customerName,
            customerMobilePhone,
            metadata: {
                productId,
                productOptionId,
                userId,
                couponId: couponState?.id,
            },
        };

        await payment.requestPayment({
            method: 'CARD',
            ...commonPayload,
            card: {
                useEscrow: false,
                flowMode: 'DEFAULT',
                useCardPoint: false,
                useAppCardOnly: false,
            },
        });
    }

    const form = useDirectDepositForm({
        defaultValues: billingInfo,
    });
    const {
        handleSubmit,
        formState: { isSubmitting },
    } = form;

    const handlePurchase = async () => {
        try {
            setIsLoading(true);

            await requestPayment();
        } catch {
            toast.error('결제 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePartialPurchase = async () => {
        try {
            setIsLoading(true);

            if (!isAgreed) {
                toast.error('필수 약관에 모두 동의해주세요.');
                return;
            }
            if (amount.value <= 0) {
                toast.error('무료 상품은 분할 결제가 불가능합니다.');
                return;
            }
        } catch {
            toast.error('오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handlePurchase,
        isLoading,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        amount,
        setAmount,
        couponState,
        setCouponState,
        setIsAgreed,
        handlePartialPurchase,
        form,
        isSubmitting,
    };
}
