"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, Copy } from "lucide-react";
import { VirtualAccount } from "@prisma/client";
import { getBankNameByCode } from "@/utils/payments/get-bank-info";
import toast from "react-hot-toast";
import { formatPrice } from "@/utils/formats";

interface Props {
  virtualAccount: VirtualAccount | null;
  amount: number;
}

export default function WaitingForDepositMessage({
  virtualAccount,
  amount,
}: Props) {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-[500px] px-5">
        <Card className="py-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
              <InfoIcon className="size-10 text-green-500" />
              가상계좌 요청이 완료되었습니다.
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center leading-7">
            <p className="text-muted-foreground mb-4">
              가상계좌 입금 후 결제가 완료됩니다.
              <br />
              입금이 완료될 때 까지 다음 결제를 하실 수 없습니다.
              <br />
              입금완료 후 새로고침 해주세요.
            </p>
            <div className="flex w-full flex-col items-center">
              {/* 가상계좌 정보 */}
              {virtualAccount && (
                <>
                  <div className="bg-foreground/5 mb-4 w-full space-y-3 rounded-lg p-4">
                    <h3 className="text-foreground text-center text-sm font-semibold">
                      입금 정보
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm text-nowrap">
                          은행
                        </span>
                        <span className="text-foreground font-semibold">
                          {getBankNameByCode(virtualAccount.bankCode)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm text-nowrap">
                          계좌번호
                        </span>
                        <div className="flex items-center gap-x-2">
                          <span className="text-foreground bg-foreground/5 rounded-md px-2 py-1 font-mono text-sm select-none">
                            {virtualAccount.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                virtualAccount.accountNumber
                              );
                              toast.success("계좌번호가 복사되었습니다.");
                            }}
                            className="hover:bg-foreground/10 cursor-pointer rounded p-1 transition-colors"
                          >
                            <Copy className="text-muted-foreground size-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm text-nowrap">
                          입금 기한
                        </span>
                        <span className="text-foreground font-semibold">
                          {virtualAccount.dueDate.toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm text-nowrap">
                          입금해야할 금액
                        </span>
                        <span className="text-foreground font-semibold">
                          {formatPrice(amount)}원
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-muted-foreground text-center text-sm">
                    가상계좌의 경우 입금이 완료되면 강의를 시청할 수 있어요
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
