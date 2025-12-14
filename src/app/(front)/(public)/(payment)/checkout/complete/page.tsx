import Container from "@/components/layout/container";
import Section from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCachedSiteSetting } from "@/queries/global/site-setting";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "./_components/copy-button";

export default async function CheckoutComplete() {
  const siteSetting = await getCachedSiteSetting();

  return (
    <Section>
      <Container className="max-w-2xl">
        <div className="space-y-8">
          {/* 헤더 섹션 */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold">수강신청이 완료되었습니다</h1>
            <p className="text-muted-foreground">
              아래 계좌로 입금해 주시면 수강신청이 확정됩니다
            </p>
          </div>

          {/* 계좌 정보 카드 */}
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <h2 className="font-semibold text-lg">입금 계좌 정보</h2>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">은행명</span>
                  <span className="font-medium">{siteSetting?.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">계좌번호</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground bg-foreground/5 rounded-md px-2 py-1 font-mono text-sm">
                      {siteSetting?.bankAccountNumber}
                    </span>
                    <CopyButton
                      text={siteSetting?.bankAccountNumber}
                      successMessage="계좌번호가 복사되었습니다."
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">예금주</span>
                  <span className="font-medium">
                    {siteSetting?.bankHolderName}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* 안내 메시지 */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">입금 안내</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 입금 확인은 영업일 기준 1-2일 소요됩니다.</li>
              <li>
                • 입금자명이 다를 경우 정상적인 처리가 어렵습니다. 고객센터로
                문의해주세요.
              </li>
              <li>
                • 입금 확인 후 수강신청 확정 안내를 이메일로 보내드립니다.
              </li>
            </ul>
          </div>

          {/* 버튼 */}
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/courses">강의 목록으로</Link>
            </Button>
            <Button asChild>
              <Link href="/mypage">마이페이지로</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
