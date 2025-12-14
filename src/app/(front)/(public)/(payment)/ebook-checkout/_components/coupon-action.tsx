"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/utils/formats";
import { Coupon } from "@prisma/client";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { SetStateAction } from "react";
import { EnrollCouponForm } from "@/app/(front)/(public)/(mypage)/mypage/coupon/_components/enroll-coupon-form";
interface Props {
  coupons: Coupon[];
  setAmount: (
    value: SetStateAction<{
      currency: string;
      value: number;
    }>
  ) => void;
  price: number;
  setCouponState: (value: SetStateAction<Coupon | null>) => void;
}

export function CouponAction({
  coupons,
  setAmount,
  price,
  setCouponState,
}: Props) {
  const router = useRouter();

  return (
    <div className="space-y-3 md:space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-base md:text-xl font-semibold">쿠폰</span>
        <EnrollCouponForm />
        {/* <Button
          variant="ghost"
          type="button"
          className="text-sm md:text-base font-semibold"
          onClick={() => router.push("/mypage/coupon")}
        >
          쿠폰 코드가 있으신가요?
          <ChevronRight />
        </Button> */}
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
                  ? price * ((100 - selectedCoupon.discountAmount) / 100)
                  : price - selectedCoupon.discountAmount,
            }));
            setCouponState(selectedCoupon);
          }
        }}
      >
        <SelectTrigger className="h-12">
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
            <SelectItem key={coupon.id} value={coupon.id} className="h-12">
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
