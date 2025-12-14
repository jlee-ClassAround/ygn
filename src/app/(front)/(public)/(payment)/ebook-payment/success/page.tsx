import { Metadata } from "next";
import { PaymentSuccess } from "./_components/payment-success";

export const metadata: Metadata = {
  title: "결제 인증",
};

export default function EbookPaymentSuccessPage() {
  return <PaymentSuccess />;
}
