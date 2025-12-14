import { PaymentMethod } from "@/constants/payments/payment-method";
import { formatPhoneNumber } from "@/utils/formats";
import {
  loadTossPayments,
  TossPaymentsPayment,
} from "@tosspayments/tosspayments-sdk";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getClientKey } from "@/external-api/tosspayments/services/get-client-key";
import { useRouter } from "next/navigation";
import { cancelPartialPayments } from "../_actions/cancel-partial-payments";

const clientKey = getClientKey();

interface Props {
  productPrice: number;
  platformOrderId: string;
  orderName: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  customerMobilePhone: string | null;
  isTaxFree: boolean;
  remainingAmount: number;
}

export function usePartialPaymentsWindow({
  productPrice,
  platformOrderId,
  orderName,
  userId,
  customerEmail,
  customerName,
  customerMobilePhone,
  isTaxFree,
  remainingAmount,
}: Props) {
  const [payment, setPayment] = useState<TossPaymentsPayment | null>(null);
  const [amount, setAmount] = useState<{
    currency: string;
    value: number;
  }>({
    currency: "KRW",
    value: 0,
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("CARD");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchPayment() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const payment = tossPayments.payment({
          customerKey: userId,
        });

        setPayment(payment);
      } catch (error) {
        toast.error("결제 준비 중 오류가 발생했습니다.");
        console.error("Error fetching payment:", error);
      }
    }

    fetchPayment();
  }, [clientKey, userId]);

  async function requestPayment() {
    if (!payment) return;

    if (customerMobilePhone) {
      customerMobilePhone = formatPhoneNumber(customerMobilePhone);
    } else {
      customerMobilePhone = null;
    }

    const tossPaymentId = uuidv4();

    const commonPayload = {
      amount,
      taxFreeAmount: isTaxFree ? amount.value : 0,
      orderId: tossPaymentId,
      orderName,
      successUrl:
        window.location.origin +
        `/payment/partial/success?platformOrderId=${platformOrderId}`,
      failUrl: window.location.origin + "/payment/partial/fail",
      customerEmail,
      customerName,
      customerMobilePhone,
    };

    switch (selectedPaymentMethod) {
      case "CARD":
        await payment.requestPayment({
          method: "CARD", // 카드 결제
          ...commonPayload,
          card: {
            useEscrow: false,
            flowMode: "DEFAULT",
            useCardPoint: false,
            useAppCardOnly: false,
          },
        });
      case "TRANSFER":
        await payment.requestPayment({
          method: "TRANSFER", // 계좌이체 결제
          ...commonPayload,
          transfer: {
            cashReceipt: {
              type: "소득공제",
            },
            useEscrow: false,
          },
        });
      case "VIRTUAL_ACCOUNT":
        await payment.requestPayment({
          method: "VIRTUAL_ACCOUNT", // 가상계좌 결제
          ...commonPayload,
          virtualAccount: {
            cashReceipt: {
              type: "소득공제",
            },
            useEscrow: false,
            validHours: 24,
          },
        });
        break;
    }
  }

  const handlePurchase = async () => {
    try {
      if (amount.value % 100 < 100 && amount.value % 100 > 0) {
        toast.error("결제 금액은 100원 단위로 입력해주세요.");
        return;
      }
      if (amount.value <= 500) {
        toast.error("결제 금액은 500원 이상 입력해주세요.");
        return;
      }
      if (
        remainingAmount - amount.value !== 0 &&
        remainingAmount - amount.value < 500
      ) {
        toast.error("남은 금액이 500원 미만일 수 없습니다.");
        return;
      }
      setIsLoading(true);

      await requestPayment();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "결제 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      if (!confirm("분할결제를 취소하시겠습니까?")) {
        return;
      }

      setIsLoading(true);
      const res = await cancelPartialPayments({
        userId,
        platformOrderId,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success("분할결제 취소 완료");

      router.push(
        `/checkout?courseId=${res.data?.courseId}${
          res.data?.productOptionId ? `&optId=${res.data?.productOptionId}` : ""
        }`
      );
      return;
    } catch {
      toast.error("분할결제 취소 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handlePurchase,
    isLoading,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    amount,
    setAmount,
    handleCancel,
  };
}
