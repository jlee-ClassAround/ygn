"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleHelp } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { DirectDepositFormSchema } from "../_hooks/use-direct-deposit-form";

interface Props {
  form: UseFormReturn<DirectDepositFormSchema>;
  disabled?: boolean;
}

export function DirectDepositForm({ form, disabled }: Props) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const billingType = watch("billingType");
  const cashReceiptType = watch("cashReceiptType");

  const handleBillingTypeChange = (value: "CASH_RECEIPT" | "TAX_INVOICE") => {
    setValue("billingType", value);
  };
  const handleCashReceiptTypeChange = (
    value: "INCOME_DEDUCTION" | "PROOF_OF_EXPENSE"
  ) => {
    setValue("cashReceiptType", value);
  };

  const getErrorMessage = (field: string) => {
    const error = errors[field as keyof typeof errors];
    return error?.message;
  };

  return (
    <div className="space-y-3 mt-5">
      <div className="flex items-center gap-10">
        <Label className="w-24 shrink-0">청구서 유형</Label>
        <RadioGroup
          defaultValue={billingType}
          className="flex gap-5"
          disabled={disabled}
          onValueChange={handleBillingTypeChange}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="CASH_RECEIPT"
              id="CASH_RECEIPT"
              {...register("billingType")}
            />
            <Label htmlFor="CASH_RECEIPT">현금영수증</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="TAX_INVOICE"
              id="TAX_INVOICE"
              {...register("billingType")}
            />
            <Label htmlFor="TAX_INVOICE">세금계산서</Label>
          </div>
        </RadioGroup>
      </div>

      {billingType === "CASH_RECEIPT" ? (
        <>
          <div className="flex items-center gap-10">
            <Label className="w-24 shrink-0">현금영수증 유형</Label>
            <RadioGroup
              defaultValue={cashReceiptType}
              className="flex gap-5"
              disabled={disabled}
              onValueChange={handleCashReceiptTypeChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="INCOME_DEDUCTION"
                  id="INCOME_DEDUCTION"
                  {...register("cashReceiptType")}
                />
                <Label htmlFor="INCOME_DEDUCTION">개인소득공제용</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="PROOF_OF_EXPENSE"
                  id="PROOF_OF_EXPENSE"
                  {...register("cashReceiptType")}
                />
                <Label htmlFor="PROOF_OF_EXPENSE">사업자증빙용</Label>
              </div>
            </RadioGroup>
            {getErrorMessage("cashReceiptType") && (
              <p className="text-sm text-red-500">
                {getErrorMessage("cashReceiptType")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-10">
            <Label
              className="w-24 shrink-0 flex items-center gap-1"
              htmlFor="receiptNumber"
            >
              발행번호
              <Tooltip>
                <TooltipTrigger>
                  <CircleHelp className="size-4 text-foreground/50" />
                </TooltipTrigger>
                <TooltipContent className="dark">
                  <p>
                    {cashReceiptType === "INCOME_DEDUCTION"
                      ? "휴대폰번호를 입력해주세요."
                      : "사업자등록번호를 입력해주세요."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="space-y-1 w-full">
              <Input
                id="receiptNumber"
                placeholder={
                  cashReceiptType === "INCOME_DEDUCTION"
                    ? "010-1234-5678"
                    : "000-00-00000"
                }
                disabled={disabled}
                {...register("receiptNumber")}
              />
              {getErrorMessage("receiptNumber") && (
                <p className="text-xs text-red-500">
                  {getErrorMessage("receiptNumber")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-10">
            <Label className="w-24 shrink-0" htmlFor="depositorName">
              예금주명
            </Label>
            <div className="space-y-1 w-full">
              <Input
                id="depositorName"
                placeholder="예금주명을 입력해주세요"
                disabled={disabled}
                {...register("depositorName")}
              />
              {getErrorMessage("depositorName") && (
                <p className="text-xs text-red-500">
                  {getErrorMessage("depositorName")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-10">
            <Label className="w-24 shrink-0" htmlFor="note">
              비고
            </Label>
            <div className="space-y-1 w-full">
              <Input
                id="note"
                placeholder="기타 정보를 입력해주세요"
                disabled={disabled}
                {...register("note")}
              />
              {getErrorMessage("note") && (
                <p className="text-xs text-red-500">
                  {getErrorMessage("note")}
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-10">
            <Label className="w-24 shrink-0" htmlFor="businessNumber">
              사업자등록번호
            </Label>
            <div className="space-y-1 w-full">
              <Input
                id="businessNumber"
                placeholder="000-00-00000"
                disabled={disabled}
                {...register("businessNumber")}
              />
              {getErrorMessage("businessNumber") && (
                <p className="text-xs text-red-500">
                  {getErrorMessage("businessNumber")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-10">
            <Label className="w-24 shrink-0" htmlFor="companyName">
              사업자명
            </Label>
            <div className="space-y-1 w-full">
              <Input
                id="companyName"
                placeholder="주식회사 00컴퍼니"
                disabled={disabled}
                {...register("companyName")}
              />
              {getErrorMessage("companyName") && (
                <p className="text-xs text-red-500">
                  {getErrorMessage("companyName")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-10">
            <Label className="w-24 shrink-0" htmlFor="ceoName">
              대표자명
            </Label>
            <div className="space-y-1 w-full">
              <Input
                id="ceoName"
                placeholder="홍길동"
                disabled={disabled}
                {...register("ceoName")}
              />
              {getErrorMessage("ceoName") && (
                <p className="text-xs text-red-500">
                  {getErrorMessage("ceoName")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-10">
            <Label className="w-24 shrink-0" htmlFor="businessAddress">
              사업자 주소
            </Label>
            <div className="space-y-1 w-full">
              <Input
                id="businessAddress"
                placeholder="서울특별시 강남구 테헤란로 14길 6 남도빌딩 2층"
                disabled={disabled}
                {...register("businessAddress")}
              />
              {getErrorMessage("businessAddress") && (
                <p className="text-xs text-red-500">
                  {getErrorMessage("businessAddress")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-10">
            <Label className="w-24 shrink-0" htmlFor="businessType">
              사업자 종목
            </Label>
            <div className="space-y-1 w-full">
              <Input
                id="businessType"
                placeholder="정보통신업"
                disabled={disabled}
                {...register("businessType")}
              />
              {getErrorMessage("businessType") && (
                <p className="text-xs text-red-500">
                  {getErrorMessage("businessType")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-10">
            <Label className="w-24 shrink-0" htmlFor="businessItem">
              사업자 업태
            </Label>
            <div className="space-y-1 w-full">
              <Input
                id="businessItem"
                placeholder="응용 소프트웨어 개발 및 공급업"
                disabled={disabled}
                {...register("businessItem")}
              />
              {getErrorMessage("businessItem") && (
                <p className="text-xs text-red-500">
                  {getErrorMessage("businessItem")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-10">
            <Label className="w-24 shrink-0" htmlFor="contactName">
              담당자명
            </Label>
            <div className="space-y-1 w-full">
              <Input
                id="contactName"
                placeholder="임꺽정"
                disabled={disabled}
                {...register("contactName")}
              />
              {getErrorMessage("contactName") && (
                <p className="text-xs text-red-500">
                  {getErrorMessage("contactName")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-10">
            <Label className="w-24 shrink-0" htmlFor="contactPhone">
              담당자 전화번호
            </Label>
            <div className="space-y-1 w-full">
              <Input
                id="contactPhone"
                placeholder="010-1234-5678"
                disabled={disabled}
                {...register("contactPhone")}
              />
              {getErrorMessage("contactPhone") && (
                <p className="text-xs text-red-500">
                  {getErrorMessage("contactPhone")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-10">
            <Label className="w-24 shrink-0" htmlFor="contactEmail">
              담당자 이메일
            </Label>
            <div className="space-y-1 w-full">
              <Input
                id="contactEmail"
                placeholder="example@example.com"
                disabled={disabled}
                {...register("contactEmail")}
              />
              {getErrorMessage("contactEmail") && (
                <p className="text-xs text-red-500">
                  {getErrorMessage("contactEmail")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-10">
            <Label className="w-24 shrink-0" htmlFor="depositorName">
              예금주명
            </Label>
            <div className="space-y-1 w-full">
              <Input
                id="depositorName"
                placeholder="홍길동"
                disabled={disabled}
                {...register("depositorName")}
              />
              {getErrorMessage("depositorName") && (
                <p className="text-xs text-red-500">
                  {getErrorMessage("depositorName")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-10">
            <Label className="w-24 shrink-0" htmlFor="note">
              비고
            </Label>
            <div className="space-y-1 w-full">
              <Input
                id="note"
                placeholder="기타"
                disabled={disabled}
                {...register("note")}
              />
              {getErrorMessage("note") && (
                <p className="text-xs text-red-500">
                  {getErrorMessage("note")}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
