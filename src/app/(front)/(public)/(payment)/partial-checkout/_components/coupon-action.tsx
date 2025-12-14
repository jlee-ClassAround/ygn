"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/utils/formats";
import { Coupon } from "@prisma/client";
import { SetStateAction } from "react";
import { EnrollCouponForm } from "../../../(mypage)/mypage/coupon/_components/enroll-coupon-form";

interface Props {
  coupons: Coupon[];
  setAmount: (
    value: SetStateAction<{
      currency: string;
      value: number;
    }>
  ) => void;
  productPrice: number;
  setCouponState: (value: SetStateAction<Coupon | null>) => void;
}

export function CouponAction({
  coupons,
  setAmount,
  productPrice,
  setCouponState,
}: Props) {
  return (
    <div className="space-y-3 md:space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold md:text-xl">쿠폰</span>

        <EnrollCouponForm />
      </div>
      <Select
        disabled={coupons.length === 0}
        onValueChange={(val) => {
          const selectedCoupon = coupons.find((coupon) => coupon.id === val);
          if (selectedCoupon) {
            setAmount((c) => ({
              ...c,
              value:
                selectedCoupon.discountType === "percentage"
                  ? productPrice * ((100 - selectedCoupon.discountAmount) / 100)
                  : Math.max(productPrice - selectedCoupon.discountAmount, 0),
            }));
            setCouponState(selectedCoupon);
          }
        }}
      >
        <SelectTrigger className="bg-foreground/5 h-12! w-full rounded">
          <SelectValue
            placeholder={
              coupons.length === 0
                ? "사용가능한 쿠폰 없음"
                : "쿠폰을 선택해주세요."
            }
          />
        </SelectTrigger>
        <SelectContent>
          {coupons.map((coupon) => (
            <SelectItem
              key={coupon.id}
              value={coupon.id}
              className="focus:bg-foreground/10 focus:text-foreground h-12 cursor-pointer"
            >
              <div className="flex items-center gap-x-2">
                <span className="font-medium">{coupon.name}</span>
                <span className="font-semibold">
                  {coupon.discountType === "percentage" ? (
                    <>
                      <span className="text-primary">
                        {coupon.discountAmount}%
                      </span>{" "}
                      할인
                    </>
                  ) : (
                    <>
                      <span className="text-primary">
                        {formatPrice(coupon.discountAmount)}원
                      </span>{" "}
                      할인
                    </>
                  )}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
