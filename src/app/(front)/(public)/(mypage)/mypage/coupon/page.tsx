import { db } from "@/lib/db";
import { EnrollCouponForm } from "./_components/enroll-coupon-form";
import { getSession } from "@/lib/session";
import { EnrollCouponList } from "./_components/enroll-coupon-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "쿠폰목록",
};

export default async function CouponPage() {
  const session = await getSession();

  const userCoupons = await db.userCoupon.findMany({
    where: {
      userId: session.id,
    },
    select: {
      coupon: true,
      isUsed: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const coupons = userCoupons.map((item) => ({
    ...item.coupon,
    isUsed: item.isUsed,
  }));

  return (
    <div className="space-y-4">
      <h1 className="font-semibold text-lg">쿠폰</h1>
      <EnrollCouponForm />
      <EnrollCouponList coupons={coupons} />
    </div>
  );
}
