"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  RequestPaymentProps,
  useRequestPayment,
} from "../_hooks/use-request-payment";
import { formatPrice } from "@/utils/formats";
import { getBankNameByCode } from "@/utils/payments/get-bank-info";
import { VirtualAccount } from "@prisma/client";
import { CircleCheck, Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  data: RequestPaymentProps;
  virtualAccount: VirtualAccount | null;
  orderNumber: string;
  orderName: string;
}

export function PaymentSuccess({
  data,
  virtualAccount,
  orderNumber,
  orderName,
}: Props) {
  const { isConfirm } = useRequestPayment(data);

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] grow flex-col items-center justify-center p-5">
      <Card className="flex w-full max-w-[600px] flex-col items-center gap-y-6 p-8 shadow-lg">
        {isConfirm ? (
          <PaymentSuccessContent
            amount={formatPrice(data.amount)}
            orderId={orderNumber}
            virtualAccount={virtualAccount}
            orderName={orderName}
          />
        ) : (
          <PaymentProcessingContent />
        )}
      </Card>
    </div>
  );
}

function PaymentSuccessContent({
  amount,
  orderId,
  virtualAccount,
  orderName,
}: {
  amount: string;
  orderId: string;
  virtualAccount: VirtualAccount | null;
  orderName: string;
}) {
  const router = useRouter();
  return (
    <>
      {/* 성공 아이콘 및 제목 */}
      <div className="flex flex-col items-center gap-y-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CircleCheck className="size-12 text-green-500" />
        </div>
        <div className="text-center">
          <h2 className="text-foreground mb-2 text-2xl font-bold">
            주문이 완료되었습니다
          </h2>
          <p className="text-muted-foreground">안전하게 주문이 처리되었어요</p>
        </div>
      </div>

      <div className="w-full space-y-4">
        {/* 결제 정보 */}
        <div className="bg-foreground/5 space-y-3 rounded-lg p-4">
          <h3 className="text-foreground text-sm font-semibold">결제 정보</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm text-nowrap">
                주문명
              </span>
              <span className="text-foreground font-semibold">{orderName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm text-nowrap">
                결제 금액
              </span>
              <span className="text-foreground font-semibold">{amount}원</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm text-nowrap">
                주문번호
              </span>
              <div className="flex items-center gap-x-2">
                <span className="text-foreground bg-foreground/5 rounded-md px-2 py-1 font-mono text-sm select-none">
                  {orderId}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(orderId);
                    toast.success("주문번호가 복사되었습니다.");
                  }}
                  className="hover:bg-foreground/10 cursor-pointer rounded p-1 transition-colors"
                >
                  <Copy className="text-muted-foreground size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 가상계좌 정보 */}
        {virtualAccount && (
          <>
            <div className="bg-foreground/5 space-y-3 rounded-lg p-4">
              <h3 className="text-foreground text-sm font-semibold">
                입금 정보
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm text-nowrap">
                    은행
                  </span>
                  <span className="text-foreground font-semibold">
                    {getBankNameByCode(virtualAccount.bankCode)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm text-nowrap">
                    계좌번호
                  </span>
                  <div className="flex items-center gap-x-2">
                    <span className="text-foreground bg-foreground/5 rounded-md px-2 py-1 font-mono text-sm select-none">
                      {virtualAccount.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          virtualAccount.accountNumber
                        );
                        toast.success("계좌번호가 복사되었습니다.");
                      }}
                      className="hover:bg-foreground/10 cursor-pointer rounded p-1 transition-colors"
                    >
                      <Copy className="text-muted-foreground size-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm text-nowrap">
                    입금 기한
                  </span>
                  <span className="text-foreground font-semibold">
                    {virtualAccount.dueDate.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-muted-foreground text-center text-sm">
              가상계좌의 경우 입금이 완료되면 강의를 시청할 수 있어요
            </div>
          </>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="w-full pt-4">
        <Button
          type="button"
          size="lg"
          className="bg-primary hover:bg-primary/90 h-12 w-full rounded-lg text-base font-semibold"
          onClick={() => router.push("/mypage/studyroom")}
        >
          강의 보러가기
        </Button>
      </div>
    </>
  );
}

function PaymentProcessingContent() {
  return (
    <div className="flex flex-col items-center gap-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
        <Loader2 className="size-12 animate-spin text-blue-500" />
      </div>
      <div className="text-center">
        <h2 className="text-foreground mb-2 text-2xl font-bold">
          결제 승인 요청중
        </h2>
        <p className="text-muted-foreground">안전하게 결제를 처리하고 있어요</p>
      </div>
    </div>
  );
}
