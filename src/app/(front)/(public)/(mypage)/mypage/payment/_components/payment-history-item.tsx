import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { dateTimeFormat, formatPrice } from "@/utils/formats";
import { TossCustomer } from "@prisma/client";

interface Props {
  payment: TossCustomer;
}

export function PaymentHistoryItem({ payment }: Props) {
  const paymentStatus =
    payment.paymentStatus === "COMPLETED"
      ? "결제완료"
      : payment.paymentStatus === "REFUNDED"
      ? "환불됨"
      : payment.paymentStatus === "CANCELLED"
      ? "결제취소"
      : payment.paymentStatus === "PARTIAL_REFUNDED"
      ? "부분환불"
      : "결제대기";

  const refundAmount = payment.cancelAmount
    ? formatPrice(payment.cancelAmount)
    : undefined;

  return (
    <div key={payment.id} className="border-b pb-5 last:border-none space-y-3">
      <div
        className={cn(
          "text-lg font-semibold",
          payment.paymentStatus === "COMPLETED"
            ? "text-green-500"
            : payment.paymentStatus === "REFUNDED"
            ? "text-red-500"
            : "text-gray-500"
        )}
      >
        {paymentStatus}
      </div>
      <h2 className="text-lg font-semibold">{payment.orderName}</h2>
      <div className="flex items-center gap-x-3 flex-wrap">
        <span>결제번호</span>
        <span>{payment.orderId}</span>
        <Separator orientation="vertical" className="h-3" />
        <span>결제날짜</span>
        <span>{dateTimeFormat(payment.createdAt)}</span>
      </div>

      <div className="space-y-1 max-w-[300px] *:flex *:items-center *:justify-between">
        <div>
          <span>상품 원가</span>
          <span>{formatPrice(payment.originalPrice)}원</span>
        </div>
        <div>
          <span>상품 할인가</span>
          <span>
            {payment.discountPrice || payment.discountPrice === 0
              ? formatPrice(payment.discountPrice) + "원"
              : "없음"}
          </span>
        </div>
        <div>
          <span>쿠폰</span>
          <span>
            {payment.couponType === "percentage"
              ? `${payment.couponAmount}%`
              : `${formatPrice(payment.couponAmount || 0)}원`}
          </span>
        </div>
        <div className="font-semibold">
          <span>최종 결제 금액</span>
          <span>{formatPrice(payment.finalPrice)}원</span>
        </div>
        {refundAmount && (
          <div className="font-semibold">
            <span>환불 금액</span>
            <span className="text-red-500">{refundAmount}원</span>
          </div>
        )}
        {payment.canceledAt && (
          <div className="text-sm text-foreground/50">
            환불일자: {dateTimeFormat(payment.canceledAt)}
          </div>
        )}
      </div>

      {payment.receiptUrl && (
        <Button variant="secondary" asChild>
          <a href={`${payment.receiptUrl}`} target="_blank">
            영수증 보기
          </a>
        </Button>
      )}
    </div>
  );
}
