import { trackPurchase } from "@/track-events/track-purchase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { confirmPartialPayments } from "../_actions/confirm-partial-payments";

export interface RequestPartialPaymentProps {
  paymentType?: string;
  orderId: string;
  paymentKey: string;
  amount: number;
  platformOrderId: string;
}

export function useRequestPartialPayment(props: RequestPartialPaymentProps) {
  const [isConfirm, setIsConfirm] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState(props.amount);
  const [isVirtualAccount, setIsVirtualAccount] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchConfirm() {
      const result = await confirmPartialPayments({
        ...props,
      });

      if (!result.success) {
        return router.push(`/payment/partial/fail?message=${result?.message}`);
      }

      // 결제 완료 이벤트 전송
      trackPurchase({
        amount: Number(props.amount),
        contentId: result.data?.courseId || "",
        contentType: "course",
      });

      setRemainingAmount(result.data?.remainingAmount || props.amount);
      setIsVirtualAccount(result.data?.isVirtualAccount || false);
      setIsConfirm(true);
    }
    fetchConfirm();
  }, [router]);

  return {
    isConfirm,
    remainingAmount,
    isVirtualAccount,
  };
}
