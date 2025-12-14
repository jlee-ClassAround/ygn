import { getUser } from "@//actions/users/get-user";
import { db } from "@//lib/db";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import PartialCheckoutContainer from "./_components/partial-checkout-container";
import PaymentEndMessage from "./_components/payment-end-message";
import WaitingForDepositMessage from "./_components/waiting-for-deposit-message";
import { getSession } from "@/lib/session";
import { getCachedSiteSetting } from "@/queries/global/site-setting";

export const metadata: Metadata = {
  title: "분할결제",
};

interface Props {
  searchParams: Promise<{
    orderId: string | undefined;
  }>;
}

export default async function CheckoutPartial({ searchParams }: Props) {
  const { orderId } = await searchParams;
  if (!orderId) return notFound();

  const session = await getSession();

  const user = await getUser(session?.id);
  if (!user) return notFound();

  const order = await db.order.findUnique({
    where: {
      id: orderId,
      userId: session?.id,
    },
    include: {
      orderItems: {
        select: {
          productOptionId: true,
          course: true,
        },
      },
      payments: {
        include: {
          virtualAccount: true,
        },
      },
    },
  });

  if (!order) return notFound();
  if (order.status === "PAID") {
    return <PaymentEndMessage />;
  }
  if (order.status !== "IN_PARTIAL_PROGRESS") {
    return notFound();
  }

  const paymentInProgress = order.payments.find(
    (p) => p.paymentStatus === "WAITING_FOR_DEPOSIT"
  );
  const isWaitingForDeposit = !!paymentInProgress;
  if (isWaitingForDeposit) {
    return (
      <WaitingForDepositMessage
        virtualAccount={paymentInProgress.virtualAccount || null}
        amount={paymentInProgress.amount}
      />
    );
  }

  // 옵션상품 세금 체크
  let isTaxFree = Boolean(order.orderItems[0].course?.isTaxFree);
  if (order.orderItems[0].productOptionId) {
    const option = await db.courseOption.findUnique({
      where: { id: order.orderItems[0].productOptionId },
    });
    isTaxFree = Boolean(option?.isTaxFree);
  }

  const siteSetting = await getCachedSiteSetting();

  return (
    <section className="py-10">
      <div className="mx-auto max-w-[800px] px-5">
        <PartialCheckoutContainer
          platformOrderId={order.id}
          orderName={order.orderName}
          productPrice={order.amount}
          remainingAmount={order.remainingAmount}
          userId={user.id}
          userEmail={user.email ?? ""}
          userName={user.username ?? ""}
          userPhone={user.phone}
          isTaxFree={isTaxFree}
          contactLink={siteSetting?.contactLink || null}
        />
      </div>
    </section>
  );
}
