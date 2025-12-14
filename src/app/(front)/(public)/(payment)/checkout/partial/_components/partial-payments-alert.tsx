import { Alert } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

export default function PartialPaymentsAlert() {
  return (
    <Alert>
      <InfoIcon className="size-4" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">분할결제 중입니다</span>
          <Tooltip>
            <TooltipTrigger className="self-start" asChild>
              <span className="cursor-pointer text-sm underline">
                분할결제란?
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-background">
              <p className="text-foreground/50 text-xs">
                한 주문을 여러번의 결제로 나눠서 진행하는 방법이며
                <br />
                모든 결제가 완료될 때 까지는 주문이 완료처리 되지 않습니다.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="text-sm font-medium">
          분할결제 도중 모든 금액을 결제하지 않고 멈추면 강의 수강 등록이 되지
          않습니다.
        </span>
      </div>
    </Alert>
  );
}
