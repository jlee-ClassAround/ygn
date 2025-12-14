import { Card } from "@/components/ui/card";
import { CircleAlertIcon } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "결제 실패",
};

interface PaymentFailProps {
  searchParams: Promise<{
    code?: string;
    message?: string;
    orderId?: string;
  }>;
}

export default async function PaymentFail({ searchParams }: PaymentFailProps) {
  const { code, message } = await searchParams;

  return (
    <div className="flex flex-col items-center justify-center p-5 flex-grow">
      <Card className="flex flex-col gap-y-3 p-10 items-center max-w-[500px] w-full shadow-lg bg-foreground/5">
        <CircleAlertIcon className="fill-red-600 stroke-red-50 size-20" />
        <h2 className="text-2xl font-semibold mb-3">결제가 실패했어요!</h2>
        <p>에러 코드: {`${code || "알수 없음"}`}</p>
        <p>실패 사유: {`${message || "알수 없음"}`}</p>
      </Card>
    </div>
  );
}
