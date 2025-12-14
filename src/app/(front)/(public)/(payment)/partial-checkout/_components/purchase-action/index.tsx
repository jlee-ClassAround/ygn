'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/utils/formats';
import { Loader2 } from 'lucide-react';
import AgreementField from './agreement-field';
import { Coupon } from '@prisma/client';
import { SplitPaymentsModal } from './split-payments-modal';

interface Props {
    productPrice: number;
    amount: {
        currency: string;
        value: number;
    };
    onPurchase: () => void;
    onPartialPurchase: () => void;
    isLoading: boolean;
    setIsAgreed: (isAgreed: boolean) => void;
    couponState: Coupon | null;
}

export function PurchaseAction({
    productPrice,
    amount,
    onPurchase,
    onPartialPurchase,
    isLoading,
    setIsAgreed,
    couponState,
}: Props) {
    return (
        <div className="flex flex-col gap-y-4">
            <h2 className="text-xl font-semibold">결제 금액</h2>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span>강의 금액</span>
                    <span className="font-medium">{formatPrice(productPrice)}원</span>
                </div>
                {/* <div className="flex items-center justify-between">
          <span>쿠폰 사용</span>
          <span className="font-medium">
            {couponState?.discountType === "percentage"
              ? `${couponState?.discountAmount}%`
              : formatPrice(couponState?.discountAmount ?? 0)}
            원
          </span>
        </div> */}
            </div>
            <Separator />
            <div className="flex justify-between">
                <h2 className="text-xl font-semibold">총 결제 금액</h2>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-2xl font-bold">{formatPrice(amount.value)}원</span>
                    <span className="text-foreground/50 text-sm">
                        12개월 할부 시 월 {formatPrice(Math.round(amount.value / 12))}원
                    </span>
                </div>
            </div>
            <div className="mt-5">
                <AgreementField onAgreementChange={setIsAgreed} />
            </div>
            <div className="grid grid-cols-1 gap-3">
                <Button
                    size="lg"
                    type="button"
                    disabled={isLoading}
                    className="h-14 w-full p-4 text-lg font-semibold"
                    onClick={onPurchase}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="!size-6 animate-spin stroke-[3px]" />
                        </>
                    ) : (
                        '결제하기'
                    )}
                </Button>
            </div>
            {/* <div className="flex justify-end">
        <SplitPaymentsModal
          onSplitPayments={onPartialPurchase}
          isLoading={isLoading}
          setIsAgreed={setIsAgreed}
        />
      </div> */}
        </div>
    );
}
