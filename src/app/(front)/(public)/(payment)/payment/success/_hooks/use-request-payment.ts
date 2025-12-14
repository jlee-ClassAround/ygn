import { trackPurchase } from "@/track-events/track-purchase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { confirmPayments } from "../_actions/confirm-payments";

export interface RequestPaymentProps {
  paymentType?: string;
  orderId: string;
  paymentKey: string;
  amount: number;

  productId: string;
  productOptionId?: string;
  userId: string;
  couponId?: string;
}

export function useRequestPayment(props: RequestPaymentProps) {
  const [isConfirm, setIsConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchConfirm() {
      const result = await confirmPayments({
        ...props,
      });

      if (!result.success) {
        return router.push(`/payment/fail?message=${result?.message}`);
      }

      // 결제 완료 이벤트 전송
      trackPurchase({
        amount: Number(props.amount),
        contentId: props.productId,
        contentType: "course",
      });

      setIsConfirm(true);
    }
    fetchConfirm();
    router.refresh();
  }, [router]);

  return {
    isConfirm,
  };
}
