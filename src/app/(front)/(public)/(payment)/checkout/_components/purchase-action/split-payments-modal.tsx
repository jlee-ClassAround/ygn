import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import AgreementField from "./agreement-field";

interface Props {
  onSplitPayments: () => void;
  isLoading: boolean;
  setIsAgreed: (isAgreed: boolean) => void;
}

export function SplitPaymentsModal({
  onSplitPayments,
  isLoading,
  setIsAgreed,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-primary cursor-pointer text-sm font-medium underline-offset-4 hover:underline"
        >
          여러개의 결제수단으로 결제가 필요하신가요?
        </button>
      </DialogTrigger>
      <DialogContent className="md:p-8">
        <DialogHeader>
          <DialogTitle className="text-center">분할결제 기능 안내</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 leading-loose">
          <p>
            여러개의 결제수단으로 결제하려는 분들을 위해 분할결제 기능을
            도입했습니다.
          </p>
          <p>
            분할결제란{" "}
            <span className="font-semibold underline underline-offset-3">
              총 결제 금액을 여러개의 결제수단으로 결제
            </span>
            하는 방식입니다.
          </p>
          <p>
            원하시는 만큼 나눠서 결제를 진행하실 수 있으며 모든 금액에 대한
            결제가 끝나야만 강의 수강이 가능합니다.
          </p>
          <div className="text-foreground/50 flex items-center gap-2 text-sm">
            <InfoIcon className="size-4" />
            <p>분할결제를 시작하면 일반결제는 불가능합니다.</p>
          </div>
        </div>
        <div className="mt-5">
          <AgreementField onAgreementChange={setIsAgreed} />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            취소
          </Button>
          <Button
            onClick={onSplitPayments}
            disabled={isLoading}
            className="w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin stroke-[2px]" />
              </>
            ) : (
              "분할결제 시작하기"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
