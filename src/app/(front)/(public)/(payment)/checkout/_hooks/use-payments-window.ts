import { PaymentMethod } from "@/constants/payments/payment-method";
import { getClientKey } from "@/external-api/tosspayments/services/get-client-key";
import { formatPhoneNumber } from "@/utils/formats";
import { Coupon } from "@prisma/client";
import {
  loadTossPayments,
  TossPaymentsPayment,
} from "@tosspayments/tosspayments-sdk";
import { useRouter } from "next/navigation";
import queryString from "query-string";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { createPartialPayment } from "../_actions/create-partial-payment";
import { getIsPartialPayments } from "@/actions/payments/get-is-partial-payments";
import { useDirectDepositForm } from "./use-direct-deposit-form";
import { GetUserBillingInfo } from "@/utils/auth/get-user-billing-info";
import { createDirectDepositPayment } from "../_actions/create-direct-deposit-payment";

const clientKey = getClientKey();

interface Props {
  productPrice: number;
  productType: "COURSE" | "EBOOK";
  productId: string;
  productOptionId?: string;
  orderName: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  customerMobilePhone: string | null;
  billingInfo: GetUserBillingInfo;
  isTaxFree: boolean;
}

export function usePaymentsWindow({
  productPrice,
  productType,
  productId,
  productOptionId,
  orderName,
  userId,
  customerEmail,
  customerName,
  customerMobilePhone,
  billingInfo,
  isTaxFree,
}: Props) {
  const router = useRouter();
  const [payment, setPayment] = useState<TossPaymentsPayment | null>(null);
  const [amount, setAmount] = useState({
    currency: "KRW",
    value: productPrice,
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("CARD");
  const [isLoading, setIsLoading] = useState(false);
  const [couponState, setCouponState] = useState<Coupon | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);

  const tossOrderId = uuidv4();

  const qs = queryString.stringify(
    {
      productId,
      productOptionId,
      userId,
      couponId: couponState?.id,
    },
    { skipNull: true, skipEmptyString: true }
  );

  useEffect(() => {
    async function fetchPayment() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const payment = tossPayments.payment({
          customerKey: userId,
        });

        setPayment(payment);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "결제 준비 중 오류가 발생했습니다."
        );
        console.error("Error fetching payment:", e);
      }
    }

    fetchPayment();
  }, [clientKey, userId]);

  async function requestPayment() {
    if (!payment) return;

    if (customerMobilePhone) {
      customerMobilePhone = formatPhoneNumber(customerMobilePhone);
    }

    const commonPayload = {
      amount,
      taxFreeAmount: isTaxFree ? amount.value : 0,
      orderId: tossOrderId,
      orderName,
      successUrl: window.location.origin + `/payment/success?${qs}`,
      failUrl: window.location.origin + "/fail",
      customerEmail,
      customerName,
      customerMobilePhone,
      metadata: {
        productId,
        productOptionId,
        userId,
        couponId: couponState?.id,
      },
    };

    switch (selectedPaymentMethod) {
      case "CARD":
        await payment.requestPayment({
          method: "CARD",
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

  const form = useDirectDepositForm({
    defaultValues: billingInfo,
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const handlePurchase = async () => {
    try {
      if (!isAgreed) {
        toast.error("필수 약관에 모두 동의해주세요.");
        return;
      }

      setIsLoading(true);

      const isPartialPayment = await getIsPartialPayments({
        userId,
        courseId: productId,
      });
      if (isPartialPayment) {
        const { id: orderId } = isPartialPayment;
        if (
          !confirm(
            "해당 상품은 이미 분할결제 중입니다. 이어서 결제하시겠습니까?"
          )
        )
          return;
        router.push(`/checkout/partial?orderId=${orderId}`);
        return;
      }

      // if (selectedPaymentMethod === "DIRECT_DEPOSIT") {
      //   handleSubmit(async (values) => {
      //     const res = await createDirectDepositPayment({
      //       values,
      //       amount: amount.value,
      //       tossOrderId,
      //       productId,
      //       productOptionId,
      //       userId,
      //       couponId: couponState?.id,
      //     });

      //     if (res.success) {
      //       return router.push("/checkout/complete");
      //     }
      //   })();
      // }

      await requestPayment();
    } catch {
      toast.error("결제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartialPurchase = async () => {
    try {
      setIsLoading(true);

      if (!isAgreed) {
        toast.error("필수 약관에 모두 동의해주세요.");
        return;
      }
      if (amount.value <= 0) {
        toast.error("무료 상품은 분할 결제가 불가능합니다.");
        return;
      }

      // if (selectedPaymentMethod === "DIRECT_DEPOSIT") {
      //   toast.error("직접 계좌이체는 분할 결제를 지원하지 않습니다.");
      //   return;
      // }

      const res = await createPartialPayment({
        productType,
        productId,
        productOptionId,
        userId,
        couponId: couponState?.id,
        amount: amount.value,
      });

      if (!res.success) {
        if (res.status === "IN_PARTIAL_PROGRESS") {
          if (
            !confirm(
              "해당 상품은 이미 분할결제 중입니다. 이어서 결제하시겠습니까?"
            )
          )
            return;

          router.push(`/checkout/partial?orderId=${res.data.platformOrderId}`);
          return;
        }

        console.log(res);
        toast.error(res.message);
        return;
      }

      if (res.data?.platformOrderId) {
        router.push(`/checkout/partial?orderId=${res.data.platformOrderId}`);
      }
    } catch {
      toast.error("오류가 발생했습니다.");
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
    couponState,
    setCouponState,
    setIsAgreed,
    handlePartialPurchase,
    form,
    isSubmitting,
  };
}
