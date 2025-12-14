import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { PaymentHistoryItem } from "./_components/payment-history-item";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "구매내역",
};

export default async function MyPagePayment() {
  const session = await getSession();
  const paymentHistories = await db.tossCustomer.findMany({
    where: {
      userId: session.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">구매 내역</h1>
        <div></div>
      </div>
      <Separator />
      <div className="flex flex-col gap-y-5">
        {paymentHistories.length > 0 ? (
          paymentHistories.map((payment) => (
            <PaymentHistoryItem key={payment.id} payment={payment} />
          ))
        ) : (
          <div className="h-[300px] flex items-center justify-center rounded-lg border border-dashed bg-foreground/10">
            <p className="text-sm text-foreground/50">구매 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
