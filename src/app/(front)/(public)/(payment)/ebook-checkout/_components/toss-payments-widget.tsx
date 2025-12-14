"use client";

import {
  loadTossPayments,
  TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";

import { Separator } from "@/components/ui/separator";
import { Category, Coupon } from "@prisma/client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

import { normalizeKRPhoneNumber } from "@/utils/formats";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckoutInfo } from "./checkout-info";
import { CouponAction } from "./coupon-action";
import { PurchaseAction } from "./purchase-action";
import AgreementField from "./agreement-field";

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
const customerKey = uuidv4();

interface TossPaymentsWidgetsProps {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;

  ebookId: string;
  ebookTitle: string;
  ebookPrice: number;
  ebookThumbnail: string;
  isTaxFree: boolean;

  coupons: Coupon[];
  category: Category | null;
}

export function TossPaymentsWidget({
  userId,
  userName,
  userEmail,
  userPhone,

  ebookId,
  ebookTitle,
  ebookPrice,
  ebookThumbnail,
  isTaxFree,

  coupons,
  category,
}: TossPaymentsWidgetsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [amount, setAmount] = useState<{ currency: string; value: number }>({
    currency: "KRW",
    value: ebookPrice,
  });
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [couponState, setCouponState] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    async function fetchPaymentsWidgets() {
      const tosspayments = await loadTossPayments(clientKey);
      const widgets = tosspayments.widgets({ customerKey });

      setWidgets(widgets);
    }

    fetchPaymentsWidgets();
  }, []);

  useEffect(() => {
    async function renderPaymentsWidgets() {
      if (widgets == null) return;

      await widgets.setAmount(amount);

      await Promise.all([
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        // widgets.renderAgreement({
        //   selector: "#agreement",
        //   variantKey: "AGREEMENT",
        // }),
      ]);

      setIsReady(true);
    }
    renderPaymentsWidgets();
  }, [widgets]);

  useEffect(() => {
    if (widgets == null) return;
    widgets.setAmount(amount);
    if (amount.value < 0) {
      setAmount((c) => ({ ...c, value: 0 }));
    }
  }, [widgets, amount]);

  const onPurchase = async () => {
    try {
      setIsLoading(true);
      if (!widgets) return;

      if (!isAgreed) {
        toast.error("필수 약관에 모두 동의해주세요.");
        return;
      }

      if (amount.value === 0) {
        const res = await fetch(`/api/ebook-payment/free`, {
          method: "POST",
          body: JSON.stringify({
            userId,
            ebookId,
            amount: amount.value,
            couponId: couponState?.id || null,
          }),
        });
        const data = await res.text();
        if (!res.ok) throw new Error(`${data}`);
        toast.success("정상적으로 처리되었습니다.");
        router.push(`/mypage/ebooks`);
        return;
      } else {
        await widgets.requestPayment({
          orderId: uuidv4(),
          orderName: ebookTitle,
          successUrl:
            window.location.origin +
            `/ebook-payment/success?ebookId=${ebookId}` +
            `?${searchParams.toString()}`,
          failUrl: window.location.origin + "/ebook-payment/fail",
          customerEmail: userEmail,
          customerName: userName,
          customerMobilePhone: userPhone
            ? normalizeKRPhoneNumber(userPhone)
            : undefined,
          taxFreeAmount: isTaxFree ? amount.value : 0,
          metadata: {
            ebookId,
            userId,
            ...(couponState
              ? {
                  couponId: couponState.id,
                }
              : {}),
          },
        });
      }
    } catch (error: any) {
      console.log("[결제요청_에러]", error);
      toast.error(`${error?.message || "오류가 발생했어요."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-x-10 flex-col lg:flex-row">
      <div className="w-full py-5 md:py-7 space-y-4 md:space-y-10">
        <h1 className="text-xl md:text-3xl font-semibold">주문결제</h1>

        {/* 강의 정보 */}
        <CheckoutInfo
          title={ebookTitle}
          thumbnail={ebookThumbnail}
          price={ebookPrice}
          category={category}
        />

        <Separator />

        {/* 쿠폰 액션 */}
        <CouponAction
          coupons={coupons}
          setAmount={setAmount}
          price={ebookPrice}
          setCouponState={setCouponState}
        />

        {/* 결제 위젯 */}
        <div className="-mx-[30px]">
          <div id="payment-method" className="p-0 m-0" />
          {/* <div id="agreement" className="p-0" /> */}
        </div>

        <AgreementField onAgreementChange={setIsAgreed} />
      </div>

      <div className="w-full lg:w-[400px] shrink-0">
        <div className="lg:sticky lg:top-[150px] py-5 md:py-7">
          {/* 결제 액션 */}
          <PurchaseAction
            amount={amount}
            price={ebookPrice}
            isReady={isReady}
            onPurchase={onPurchase}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
