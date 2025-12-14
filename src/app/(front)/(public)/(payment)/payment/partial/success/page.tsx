import { Metadata } from "next";
import { PaymentSuccess } from "./_components/payment-success";
import { z } from "zod";
import { notFound } from "next/navigation";
import { RequestPartialPaymentProps } from "@/app/(front)/(public)/(payment)/payment/partial/success/_hooks/use-request-partial-payment";

export const metadata: Metadata = {
  title: "분할 결제 인증",
};

const paymentSchema = z.object({
  paymentType: z.string().optional(),
  orderId: z.string().uuid(),
  paymentKey: z.string(),
  amount: z.coerce.number(),
  platformOrderId: z.string().uuid(),
});

interface Props {
  searchParams: Promise<RequestPartialPaymentProps>;
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const searchParamsData = await searchParams;
  const { success, data, error } = paymentSchema.safeParse(searchParamsData);
  if (!success) {
    console.log("[PAYMENT_SUCCESS_PAGE_ERROR]", error.flatten());
    return notFound();
  }

  return <PaymentSuccess data={data} />;
}
