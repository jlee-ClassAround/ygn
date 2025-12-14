"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  remainingAmount: number;
  currentAmount: number;
  setCurrentAmount: (amount: number) => void;
}

export function PartialAmountModal({
  remainingAmount,
  currentAmount,
  setCurrentAmount,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(currentAmount.toString());

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          className="h-12 w-full text-base md:w-auto"
        >
          결제금액 변경하기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>결제금액 변경</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-foreground/50 text-sm">남은 결제금액</span>
            <div className="text-foreground/75 text-lg">
              {remainingAmount.toLocaleString()}원 중
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-foreground/50 text-sm">이번 결제금액</span>
              <Button
                variant="secondary"
                size="sm"
                className="text-foreground/50 text-xs"
                onClick={() => {
                  setCurrentAmount(remainingAmount);
                  setInputValue(remainingAmount.toString());
                }}
              >
                전액 입력
              </Button>
            </div>
            <Input
              type="number"
              min={0}
              max={remainingAmount}
              step={10000}
              className="h-10 text-base! shadow-none"
              value={inputValue}
              onChange={(e) => {
                let newValue = e.target.value;

                // 맨 앞의 0 제거 (단, "0"만 있는 경우는 제외)
                if (newValue.length > 1 && newValue.startsWith("0")) {
                  newValue = newValue.replace(/^0+/, "");
                }

                setInputValue(newValue);

                const numValue = Number(newValue);

                if (numValue > remainingAmount || numValue < 0) {
                  setCurrentAmount(remainingAmount);
                  setInputValue(remainingAmount.toString());
                } else {
                  setCurrentAmount(numValue);
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setCurrentAmount(0);
              setInputValue("0");
              setIsOpen(false);
            }}
          >
            취소
          </Button>
          <Button onClick={() => setIsOpen(false)}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
