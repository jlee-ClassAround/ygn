"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  RequestPartialPaymentProps,
  useRequestPartialPayment,
} from "../_hooks/use-request-partial-payment";
import { formatPrice } from "@/utils/formats";
import { CircleCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface Props {
  data: RequestPartialPaymentProps;
}

export function PaymentSuccess({ data }: Props) {
  const router = useRouter();
  const { isConfirm, remainingAmount, isVirtualAccount } =
    useRequestPartialPayment(data);

  useEffect(() => {
    if (!isConfirm) return;
    if (remainingAmount === 0) {
      toast.success("모든 결제가 완료되었습니다.");
      return;
    } else if (isVirtualAccount) {
      toast.success(
        "가상계좌 요청이 완료되었습니다. 입금 후 결제가 완료됩니다."
      );
      router.push(`/checkout/partial?orderId=${data.platformOrderId}`);
      return;
    } else {
      toast.success("분할 결제가 완료되었습니다.");
      router.push(`/checkout/partial?orderId=${data.platformOrderId}`);
      return;
    }
  }, [router, isConfirm]);

  return (
    <div className="flex flex-grow flex-col items-center justify-center p-5 pt-24 md:pt-32">
      <Card className="bg-foreground/5 flex w-full max-w-[500px] flex-col items-center gap-y-3 p-10 shadow-lg">
        {isConfirm ? (
          <>
            <CircleCheck className="text-background size-20 fill-green-500" />
            <h2 className="text-2xl font-semibold">
              <span className="text-primary">{formatPrice(data.amount)}원</span>{" "}
              결제완료
            </h2>
            <div className="text-muted-foreground text-sm">
              남은 금액 {formatPrice(remainingAmount)}원
            </div>
            {remainingAmount === 0 ? (
              <>
                <div className="text-muted-foreground text-sm">
                  모든 결제가 완료되었습니다.
                </div>
                <Button
                  type="button"
                  size="lg"
                  className="h-12 rounded-full text-base font-semibold"
                  onClick={() => router.push("/mypage/studyroom")}
                >
                  강의 보러가기
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                남은 금액을 결제하면 강의를 볼 수 있어요.
              </p>
            )}
          </>
        ) : (
          <>
            <Loader2 className="text-primary mb-5 size-20 animate-spin" />
            <h2 className="mb-3 text-2xl font-semibold">결제 승인 요청중...</h2>
            <p>승인 요청 중이에요. 조금만 기다려주세요!</p>
          </>
        )}
      </Card>
    </div>
  );
}
