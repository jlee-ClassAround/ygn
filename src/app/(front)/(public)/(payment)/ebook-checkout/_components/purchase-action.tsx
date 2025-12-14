"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/utils/formats";
import { Loader2 } from "lucide-react";

interface Props {
  price: number;
  amount: {
    currency: string;
    value: number;
  };
  isReady: boolean;
  onPurchase: () => Promise<void>;
  isLoading: boolean;
}

export function PurchaseAction({
  price,
  amount,
  isReady,
  onPurchase,
  isLoading,
}: Props) {
  return (
    <div className="flex flex-col gap-y-4">
      <h2 className="text-xl font-semibold">결제 금액</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span>전자책 금액</span>
          <span className="font-medium">{formatPrice(price)}원</span>
        </div>
        <div className="flex items-center justify-between">
          <span>쿠폰 사용</span>
          <span className="font-medium">
            {formatPrice(price - amount.value)}원
          </span>
        </div>
      </div>
      <Separator />
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">총 결제 금액</h2>
        <div className="flex flex-col items-end gap-1">
          <span className="text-2xl font-bold">
            {formatPrice(amount.value)}원
          </span>
          <span className="text-gray-400">
            12개월 할부 시 월 {formatPrice(Math.round(amount.value / 12))}원
          </span>
        </div>
      </div>
      <Button
        size="lg"
        type="button"
        disabled={!isReady || isLoading}
        className="w-full h-14 p-4 text-lg rounded-lg"
        onClick={onPurchase}
      >
        {isLoading ? (
          <>
            <Loader2 className="!size-6 stroke-[3px] animate-spin" />
          </>
        ) : (
          "결제하기"
        )}
      </Button>
    </div>
  );
}
