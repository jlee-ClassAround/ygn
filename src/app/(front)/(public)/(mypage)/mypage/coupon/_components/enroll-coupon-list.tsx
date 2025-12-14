import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { dateWithoutWeekFormat, formatPrice } from "@/utils/formats";
import { Coupon } from "@prisma/client";
import { Tickets } from "lucide-react";

interface Props {
  coupons: (Coupon & {
    isUsed: boolean;
  })[];
}

export function EnrollCouponList({ coupons }: Props) {
  return (
    <div className="flex flex-col gap-y-2">
      {coupons.length > 0 ? (
        coupons.map((coupon) => {
          const isCouponValid =
            !coupon.isUsed &&
            coupon.expiryDate > new Date() &&
            (coupon.usageLimit ? coupon.usedCount < coupon.usageLimit : true);

          return (
            <div
              key={coupon.id}
              className="border rounded-lg p-5 flex items-center justify-between gap-x-5"
            >
              <div
                className={cn(
                  "flex gap-x-3",
                  !isCouponValid && "text-foreground/50"
                )}
              >
                <Tickets className="size-6 text-muted-foreground" />
                <div className="flex flex-col gap-y-1">
                  <div className="text-lg font-semibold">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountAmount}%`
                      : `${formatPrice(coupon.discountAmount)}원`}{" "}
                    할인 쿠폰
                  </div>
                  <div className="flex items-center gap-x-3 flex-wrap">
                    <div className="font-medium">{coupon.name}</div>
                    <Separator orientation="vertical" className="h-3" />
                    <div className="text-sm">
                      {dateWithoutWeekFormat(coupon.expiryDate)}까지 사용가능
                    </div>
                  </div>
                  {coupon.description && <div>{coupon.description}</div>}
                </div>
              </div>
              <div
                className={cn(
                  "ml-auto text-sm font-medium text-nowrap",
                  !isCouponValid ? "text-foreground/50" : "text-primary"
                )}
              >
                {!isCouponValid ? "사용불가" : "사용가능"}
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex justify-center items-center h-80 border border-dashed border-foreground/20 rounded-lg bg-foreground/10">
          <p className="text-sm text-foreground/50">쿠폰이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
