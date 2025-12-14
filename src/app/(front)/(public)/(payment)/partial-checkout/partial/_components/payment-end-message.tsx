import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentEndMessage() {
  return (
    <section className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-neutral-700 py-10">
      <div className="mx-auto w-full max-w-[500px] px-5">
        <Card className="py-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
              <CheckCircle className="h-10 w-10 text-green-500" />
              결제가 완료되었습니다.
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-muted-foreground mb-4">
              모든 결제가 완료되었습니다. 강의를 시작해보세요.
            </p>
            <Link href={`/mypage/studyroom`}>
              <Button>강의 보러가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
