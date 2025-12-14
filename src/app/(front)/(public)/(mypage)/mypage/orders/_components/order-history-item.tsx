"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { dateTimeFormat, formatPrice } from "@/utils/formats";
import { getBankNameByCode } from "@/utils/payments/get-bank-info";
import { PaymentCancel, SiteSetting, VirtualAccount } from "@prisma/client";
import { Copy, RotateCcw } from "lucide-react";
import Link from "next/link";
import { MyPageOrder } from "../_queries/get-mypage-orders";
import {
  copyAccountNumber,
  getOrderStatusInfo,
  getPaymentMethodInfo,
  getPaymentStatusInfo,
  getRefundStatusInfo,
  parseUsedCouponData,
} from "../_utils/order-item-utils";

interface Props {
  order: MyPageOrder;
  siteSetting: SiteSetting | null;
}

export function OrderHistoryItem({ order, siteSetting }: Props) {
  const isPartialPayment = order.type === "SPLIT_PAYMENT";

  return (
    <div className="bg-background w-full space-y-4 border p-4">
      <OrderStatusPill order={order} />

      <div className="flex flex-col flex-wrap justify-between gap-6 md:flex-row">
        <div className="min-w-[220px] flex-1 space-y-4">
          <OrderBasicInfo order={order} />

          {isPartialPayment ? (
            <PartialPaymentHistory order={order} />
          ) : (
            <SinglePaymentInfo order={order} siteSetting={siteSetting} />
          )}

          <PartialPaymentAction order={order} />
        </div>

        <PaymentSummary order={order} />
      </div>
    </div>
  );
}

// 주문 상태 표시 컴포넌트
function OrderStatusPill({ order }: { order: MyPageOrder }) {
  const orderStatus = getOrderStatusInfo(order.status);
  const isPartialPayment = order.type === "SPLIT_PAYMENT";

  return (
    <div className="mb-2 flex items-center gap-x-2">
      <span
        className={cn(
          "inline-flex items-center gap-x-1 rounded-full border px-3 py-1 text-sm font-semibold",
          orderStatus.pill
        )}
      >
        <orderStatus.icon className="size-4" />
        {orderStatus.label}
      </span>
      {isPartialPayment && (
        <span className="inline-flex items-center gap-x-1 rounded-full border border-orange-200 bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
          분할결제 ({order.payments.length}회)
        </span>
      )}
    </div>
  );
}

// 주문 기본 정보 컴포넌트
function OrderBasicInfo({ order }: { order: MyPageOrder }) {
  return (
    <div className="min-w-[220px] flex-1 space-y-4">
      <h2 className="text-foreground line-clamp-2 text-base font-semibold">
        {order.orderName}
      </h2>
      <div className="text-muted-foreground space-y-1 text-sm">
        <div className="flex flex-wrap items-center gap-x-2">
          <span>주문번호</span>
          <span className="text-foreground bg-foreground/5 rounded px-2 py-0.5 font-mono text-xs select-none">
            {order.orderNumber}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2">
          <span>주문날짜</span>
          <span>{dateTimeFormat(order.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

// 가상계좌 정보 컴포넌트
function VirtualAccountInfo({
  virtualAccount,
}: {
  virtualAccount: VirtualAccount;
}) {
  return (
    <div className="border-foreground/10 space-y-1 border-t pt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">은행</span>
        <span className="font-medium">
          {getBankNameByCode(virtualAccount.bankCode)}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">계좌번호</span>
        <div className="flex items-center gap-x-1">
          <span className="bg-foreground/10 rounded px-1 font-mono text-xs">
            {virtualAccount.accountNumber}
          </span>
          <button
            type="button"
            onClick={() => copyAccountNumber(virtualAccount.accountNumber)}
            className="hover:bg-foreground/10 rounded p-0.5"
          >
            <Copy className="text-muted-foreground size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 환불 내역 컴포넌트
function RefundHistory({
  paymentCancels,
}: {
  paymentCancels: PaymentCancel[];
}) {
  if (paymentCancels.length === 0) return null;

  return (
    <div className="border-foreground/10 space-y-2 border-t pt-2">
      <div className="flex items-center gap-x-1">
        <RotateCcw className="size-3 text-red-500" />
        <span className="text-xs font-medium text-red-500">
          환불 내역 ({paymentCancels.length}건)
        </span>
      </div>
      {paymentCancels.map((cancel, cancelIndex) => {
        const refundStatusInfo = getRefundStatusInfo(cancel.cancelStatus);
        return (
          <div
            key={cancel.id}
            className="space-y-1 rounded border border-red-200 bg-red-50 p-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-1">
                <span className="text-foreground text-xs font-medium">
                  {paymentCancels.length > 1
                    ? `${cancelIndex + 1}차 환불`
                    : "환불"}
                </span>
              </div>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-1 py-0.5 text-xs font-medium",
                  refundStatusInfo.style
                )}
              >
                {refundStatusInfo.label}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-foreground text-xs font-medium">
                  환불 금액
                </span>
                <span className="text-foreground text-xs font-semibold">
                  {formatPrice(cancel.cancelAmount)}원
                </span>
              </div>
              {cancel.cancelReason && (
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>환불 사유</span>
                  <span className="max-w-[120px] text-right font-medium">
                    {cancel.cancelReason}
                  </span>
                </div>
              )}
            </div>
            <div className="text-muted-foreground border-t border-red-100 pt-1 text-right text-xs">
              {dateTimeFormat(cancel.canceledAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 단일 결제 환불 정보 컴포넌트
function SinglePaymentRefundInfo({
  paymentCancels,
}: {
  paymentCancels: PaymentCancel[];
}) {
  if (paymentCancels.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-x-2">
        <RotateCcw className="size-4 text-red-500" />
        <span className="text-sm font-semibold text-red-500">환불 내역</span>
      </div>
      {paymentCancels.map((cancel) => {
        const refundStatusInfo = getRefundStatusInfo(cancel.cancelStatus);
        return (
          <div
            key={cancel.id}
            className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-foreground text-sm font-semibold">
                환불 금액
              </span>
              <span className="text-foreground text-sm font-bold">
                {formatPrice(cancel.cancelAmount)}원
              </span>
            </div>
            {cancel.cancelReason && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">환불 사유</span>
                <span className="text-foreground max-w-[200px] text-right font-medium">
                  {cancel.cancelReason}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">환불 상태</span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                  refundStatusInfo.style
                )}
              >
                {refundStatusInfo.label}
              </span>
            </div>
            <div className="text-muted-foreground border-t border-red-100 pt-1 text-right text-xs">
              환불일자: {dateTimeFormat(cancel.canceledAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 분할 결제 내역 컴포넌트
function PartialPaymentHistory({ order }: { order: MyPageOrder }) {
  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-foreground text-sm font-semibold">결제 내역</h3>
      {order.payments.map((payment, index) => {
        const paymentStatusInfo = getPaymentStatusInfo(payment.paymentStatus);
        const paymentMethodInfo = getPaymentMethodInfo(payment.paymentMethod);

        return (
          <div
            key={payment.id}
            className="bg-foreground/5 space-y-2 rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <span className="text-muted-foreground text-xs font-medium">
                  {index + 1}차 결제
                </span>
                <paymentMethodInfo.icon className="text-muted-foreground size-4" />
                <span className="text-xs font-medium">
                  {paymentMethodInfo.label}
                </span>
              </div>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                  paymentStatusInfo.style
                )}
              >
                {paymentStatusInfo.label}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">결제금액</span>
                <span className="text-foreground font-semibold">
                  {formatPrice(payment.amount)}원
                </span>
              </div>

              {payment.paymentCancels.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">환불 금액</span>
                  <span className="font-medium text-red-600">
                    {formatPrice(
                      payment.paymentCancels.reduce(
                        (acc, cancel) => acc + cancel.cancelAmount,
                        0
                      )
                    )}
                    원
                  </span>
                </div>
              )}
            </div>

            {payment.virtualAccount && (
              <VirtualAccountInfo virtualAccount={payment.virtualAccount} />
            )}

            <RefundHistory paymentCancels={payment.paymentCancels} />

            {payment.receiptUrl && (
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-foreground/70 hover:text-foreground h-6 border px-2 text-xs"
                  asChild
                >
                  <a href={payment.receiptUrl} target="_blank">
                    영수증 보기
                  </a>
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// 단일 결제 정보 컴포넌트
function SinglePaymentInfo({
  order,
  siteSetting,
}: {
  order: MyPageOrder;
  siteSetting: SiteSetting | null;
}) {
  const payment = order.payments[0];
  const { label: paymentMethodLabel } = getPaymentMethodInfo(
    payment.paymentMethod
  );

  return (
    <>
      <div className="text-muted-foreground space-y-1 text-sm">
        <div className="flex flex-wrap items-center gap-x-2">
          <span>결제방법</span>
          <span className="text-foreground/80 font-medium">
            {paymentMethodLabel}
          </span>
        </div>
      </div>

      {payment.paymentMethod === "VIRTUAL_ACCOUNT" &&
        payment.virtualAccount && (
          <div className="bg-foreground/5 mt-2 space-y-2 rounded-lg p-3">
            <h3 className="text-foreground mb-1 text-xs font-semibold">
              입금 정보
            </h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-nowrap">은행</span>
                <span className="text-foreground font-semibold">
                  {getBankNameByCode(payment.virtualAccount.bankCode)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-nowrap">
                  계좌번호
                </span>
                <div className="flex items-center gap-x-2">
                  <span className="text-foreground bg-foreground/10 rounded px-2 py-0.5 font-mono text-xs select-none">
                    {payment.virtualAccount.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyAccountNumber(
                        payment.virtualAccount?.accountNumber || ""
                      )
                    }
                    className="hover:bg-foreground/10 cursor-pointer rounded p-1 transition-colors"
                  >
                    <Copy className="text-muted-foreground size-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-nowrap">
                  입금 기한
                </span>
                <span className="text-foreground font-semibold">
                  {payment.virtualAccount.dueDate.toLocaleDateString("ko-KR", {
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
        )}

      {payment.paymentMethod === "DIRECT_DEPOSIT" && (
        <>
          <div className="bg-foreground/5 mt-2 space-y-2 rounded-lg p-3">
            <h3 className="text-foreground mb-1 text-xs font-semibold">
              입금 정보
            </h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-nowrap">은행</span>
                <span className="text-foreground font-semibold">
                  {getBankNameByCode(siteSetting?.bankCode || "")}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-nowrap">
                  계좌번호
                </span>
                <div className="flex items-center gap-x-2">
                  {siteSetting?.bankAccountNumber && (
                    <>
                      <span className="text-foreground bg-foreground/10 rounded px-2 py-0.5 font-mono text-xs select-none">
                        {siteSetting?.bankAccountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyAccountNumber(
                            siteSetting?.bankAccountNumber || ""
                          )
                        }
                        className="hover:bg-foreground/10 cursor-pointer rounded p-1 transition-colors"
                      >
                        <Copy className="text-muted-foreground size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-nowrap">
                  예금주
                </span>
                <span className="text-foreground font-semibold">
                  {siteSetting?.bankHolderName}
                </span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            직접 계좌이체의 경우 입금 확인까지 시간이 조금 소요될 수 있으니 양해
            부탁드립니다
          </p>
        </>
      )}

      <SinglePaymentRefundInfo paymentCancels={payment.paymentCancels} />

      {payment.receiptUrl && (
        <Button
          variant="secondary"
          className="text-foreground/70 mt-2 text-xs font-semibold"
          asChild
        >
          <a href={`${payment.receiptUrl}`} target="_blank">
            영수증 보기
          </a>
        </Button>
      )}
    </>
  );
}

// 결제 금액 요약 컴포넌트
function PaymentSummary({ order }: { order: MyPageOrder }) {
  const usedCouponData = parseUsedCouponData(order.usedCoupon);
  const isRefunded =
    order.status === "REFUNDED" || order.status === "PARTIAL_REFUNDED";
  const totalRefundAmount = order.payments.reduce((acc, payment) => {
    return (
      acc +
      payment.paymentCancels.reduce((acc, cancel) => {
        return acc + cancel.cancelAmount;
      }, 0)
    );
  }, 0);

  return (
    <div className="w-full space-y-2 text-sm md:max-w-[260px]">
      <div className="text-muted-foreground flex items-center justify-between">
        <span>상품 원가</span>
        <span>{formatPrice(order.originalPrice)}원</span>
      </div>
      <div className="text-muted-foreground flex items-center justify-between">
        <span>상품 할인가</span>
        <span>
          {order.discountedPrice || order.discountedPrice === 0
            ? formatPrice(order.discountedPrice) + "원"
            : "없음"}
        </span>
      </div>

      <div className="text-muted-foreground flex items-center justify-between">
        <span>쿠폰</span>
        <span className="font-medium text-green-600">
          {usedCouponData
            ? usedCouponData.type === "percentage"
              ? `${usedCouponData.amount}%`
              : `${formatPrice(usedCouponData.amount)}원`
            : "0원"}
        </span>
      </div>

      <Separator className="my-2" />

      <div className="space-y-2">
        <div className="flex items-center justify-between text-base font-medium">
          <span>최종 결제 금액</span>
          <span>{formatPrice(order.amount)}원</span>
        </div>

        {isRefunded && (
          <div className="flex items-center justify-between text-sm text-red-500">
            <span>총 환불 금액</span>
            <span>{formatPrice(totalRefundAmount)}원</span>
          </div>
        )}

        <div className="text-primary flex items-center justify-between text-base font-bold">
          <span>결제된 금액</span>
          <span>{formatPrice(order.paidAmount)}원</span>
        </div>
      </div>
    </div>
  );
}

// 분할 결제 진행 중 액션 컴포넌트
function PartialPaymentAction({ order }: { order: MyPageOrder }) {
  if (order.status !== "IN_PARTIAL_PROGRESS") return null;

  return (
    <Button
      variant="secondary"
      className="text-foreground/70 mt-2 text-xs font-semibold"
      asChild
    >
      <Link href={`/checkout/partial?orderId=${order.id}`}>
        분할 결제하러가기
      </Link>
    </Button>
  );
}
