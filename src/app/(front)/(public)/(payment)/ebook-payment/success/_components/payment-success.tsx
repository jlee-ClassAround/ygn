"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fbqTrack } from "@/track-events/meta-pixel/meta-pixel-event";
import { formatPrice } from "@/utils/formats";
import { CircleCheck, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function PaymentSuccess() {
  const [isConfirm, setIsConfirm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestData = {
    paymentType: searchParams.get("paymentType"),
    orderId: searchParams.get("orderId"),
    paymentKey: searchParams.get("paymentKey"),
    amount: searchParams.get("amount"),
    ebookId: searchParams.get("ebookId"),
    trk: searchParams.get("trk"),
  };

  useEffect(() => {
    async function fetchConfirm() {
      const response = await fetch("/api/ebook-payment/confirm", {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("Content-Type");

      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = {
          message: await response.text(),
        };
      }

      if (!response.ok) {
        console.log("Confirm Error", data);
        return router.push(
          `/payment/fail?code=${data?.code || "알 수 없음"}&message=${
            data?.message
          }`
        );
      }

      fbqTrack({
        eventName: "Purchase",
        options: {
          value: Number(requestData.amount),
          currency: "KRW",
          content_ids: [data.ebookId],
          content_type: "ebook",
        },
      });

      setIsConfirm(true);
    }
    fetchConfirm();
  }, [router]);

  // useEffect(() => {
  //   if (!isConfirm) return;
  //   const timer = setTimeout(() => router.push("/"), 5000);
  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [isConfirm]);

  return (
    <div className="flex flex-col items-center justify-center p-5 flex-grow">
      <Card className="flex flex-col gap-y-3 p-10 items-center max-w-[500px] w-full shadow-lg bg-foreground/5">
        {isConfirm ? (
          <>
            <CircleCheck className="fill-green-500 stroke-green-50 size-20" />
            <h2 className="text-2xl font-semibold mb-4">승인 완료!</h2>
            <div className="space-y-2 mb-4">
              <p>가격: {formatPrice(Number(requestData.amount))}원</p>
              <p>주문번호: {requestData.orderId}</p>
            </div>
            <Button
              type="button"
              size="lg"
              className="rounded-full font-semibold h-12 text-base"
              onClick={() => router.push("/mypage/ebooks")}
            >
              전자책 보러가기
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="size-20 animate-spin text-primary mb-5" />
            <h2 className="text-2xl font-semibold mb-3">결제 승인 요청중...</h2>
            <p>승인 요청 중이에요. 조금만 기다려주세요!</p>
          </>
        )}
      </Card>
    </div>
  );
}
