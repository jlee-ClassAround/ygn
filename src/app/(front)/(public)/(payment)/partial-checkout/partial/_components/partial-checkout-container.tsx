"use client";

import { Button } from "@/components/ui/button";
import { paymentMethodsList } from "@/constants/payments/payment-method";
import { usePartialPaymentsWindow } from "../_hooks/use-partial-payments-window";
import { PaymentMethodWrapper } from "../../_components/payment-method-wrapper";
import AmountInfo from "./amount-info";
import { PartialAmountModal } from "./partial-amount-modal";
import PartialPaymentsAlert from "./partial-payments-alert";

interface Props {
  platformOrderId: string;
  orderName: string;
  productPrice: number;
  remainingAmount: number;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string | null;
  isTaxFree: boolean;
  contactLink: string | null;
}

export default function PartialCheckoutContainer({
  platformOrderId,
  orderName,
  productPrice,
  remainingAmount,
  userId,
  userEmail,
  userName,
  userPhone,
  isTaxFree,
  contactLink,
}: Props) {
  const {
    handlePurchase,
    isLoading,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    amount,
    setAmount,
    handleCancel,
  } = usePartialPaymentsWindow({
    productPrice,
    platformOrderId,
    orderName,
    userId,
    customerEmail: userEmail,
    customerName: userName,
    customerMobilePhone: userPhone,
    isTaxFree,
    remainingAmount,
  });

  return (
    <div className="w-full space-y-4 md:space-y-6">
      <PartialPaymentsAlert />

      <h2 className="text-xl font-semibold md:text-2xl">{orderName}</h2>

      <AmountInfo
        productPrice={productPrice}
        amount={amount.value}
        remainingAmount={remainingAmount}
      />

      <div className="flex flex-col gap-1">
        <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <div className="text-foreground/75 flex items-center gap-1 md:text-lg">
              <span>남은</span>
              <div className="font-semibold">
                {remainingAmount.toLocaleString()}원
              </div>
              <span>중</span>
            </div>
            <div className="text-xl font-semibold md:text-2xl">
              <span className="text-primary">
                {amount.value.toLocaleString()}원
              </span>
              을 결제할게요
            </div>
          </div>
          <PartialAmountModal
            remainingAmount={remainingAmount}
            currentAmount={amount.value}
            setCurrentAmount={(amount) =>
              setAmount({ currency: "KRW", value: amount })
            }
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">결제 방법</h2>
        <PaymentMethodWrapper
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          list={paymentMethodsList.slice(0, 3)}
        />
      </div>

      <div className="mt-10">
        <Button
          size="lg"
          className="h-14 w-full text-base font-semibold"
          onClick={handlePurchase}
          disabled={isLoading}
        >
          결제하기
        </Button>
      </div>

      {remainingAmount === productPrice ? (
        <div className="flex justify-end">
          <button
            className="text-foreground/25 cursor-pointer text-sm font-medium underline-offset-4 hover:underline"
            onClick={handleCancel}
          >
            분할결제 취소하기
          </button>
        </div>
      ) : (
        <div className="flex justify-end">
          <div className="text-foreground/25 text-sm font-medium">
            이미 결제가 진행되었으며 취소할 수 없습니다. 취소하시려면{" "}
            {contactLink ? (
              <a
                href={contactLink}
                target="_blank"
                className="hover:text-foreground cursor-pointer font-semibold underline underline-offset-3 transition-colors"
              >
                고객센터에 문의
              </a>
            ) : (
              <span>고객센터에 문의</span>
            )}
            해주세요.
          </div>
        </div>
      )}
    </div>
  );
}
