"use client";

import { paymentMethodsList } from "@/constants/payments/payment-method";
import { Category, Coupon, Teacher } from "@prisma/client";
import { usePaymentsWindow } from "../_hooks/use-payments-window";
import { CouponAction } from "./coupon-action";
import { CourseCheckoutInfo } from "./course-checkout-info";
import { PaymentMethodWrapper } from "./payment-method-wrapper";
import { PurchaseAction } from "./purchase-action";
import { DirectDepositForm } from "./direct-deposit-form";
import { GetUserBillingInfo } from "@/utils/auth/get-user-billing-info";

interface Props {
  userId: string;
  productType: "COURSE" | "EBOOK";
  productId: string;
  productOptionId?: string;
  productPrice: number;
  orderName: string;
  customerEmail: string;
  customerName: string;
  customerMobilePhone: string | null;
  billingInfo: GetUserBillingInfo;
  isTaxFree: boolean;
  productTitle: string;
  productThumbnail: string;
  productCategory: Category | null;
  teachers: Teacher[];
  coupons: Coupon[];
  optionId: string;
}

export function TossPaymentsWindow({
  userId,
  productType,
  productId,
  productOptionId,
  productPrice,
  orderName,
  customerEmail,
  customerName,
  customerMobilePhone,
  billingInfo,
  isTaxFree,
  productTitle,
  productThumbnail,
  productCategory,
  teachers,
  coupons,
  optionId,
}: Props) {
  const {
    handlePurchase,
    handlePartialPurchase,
    isLoading,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    amount,
    setAmount,
    couponState,
    setCouponState,
    setIsAgreed,
    form,
    isSubmitting,
  } = usePaymentsWindow({
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
  });

  return (
    <div className="flex flex-col gap-x-10 lg:flex-row">
      <div className="w-full space-y-3 md:space-y-5">
        <h2 className="text-2xl font-bold">결제하기</h2>
        <CourseCheckoutInfo
          productTitle={productTitle}
          productThumbnail={productThumbnail}
          productPrice={productPrice}
          teachers={teachers}
          category={productCategory}
        />
        <CouponAction
          coupons={coupons}
          setAmount={setAmount}
          productPrice={productPrice}
          setCouponState={setCouponState}
        />
        <PaymentMethodWrapper
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          list={paymentMethodsList}
        />

        {/* {selectedPaymentMethod === "DIRECT_DEPOSIT" && (
          <DirectDepositForm form={form} disabled={isSubmitting} />
        )} */}
      </div>

      <div className="w-full shrink-0 lg:w-[400px]">
        <div className="py-5 md:py-7 lg:sticky lg:top-[120px]">
          {/* 결제 액션 */}
          <PurchaseAction
            amount={amount}
            productPrice={productPrice}
            onPurchase={handlePurchase}
            onPartialPurchase={handlePartialPurchase}
            isLoading={isLoading}
            setIsAgreed={setIsAgreed}
            couponState={couponState}
          />
        </div>
      </div>
    </div>
  );
}
