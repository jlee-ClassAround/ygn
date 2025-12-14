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
    <div className="flex flex-grow flex-col items-center justify-center p-5 pt-24 md:pt-32">
      <Card className="bg-foreground/5 flex w-full max-w-[500px] flex-col items-center gap-y-3 p-10 shadow-lg">
        <CircleAlertIcon className="text-background size-20 fill-red-600" />
        <h2 className="mb-3 text-2xl font-semibold">결제가 실패했어요!</h2>
        {code && <p>에러 코드: {`${code}`}</p>}
        <p>
          실패 사유:{" "}
          {message || "알 수 없는 오류가 발생했어요. 고객센터로 문의해주세요."}
        </p>
      </Card>
    </div>
  );
}
