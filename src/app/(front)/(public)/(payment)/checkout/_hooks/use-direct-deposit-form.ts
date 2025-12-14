import { GetUserBillingInfo } from "@/utils/auth/get-user-billing-info";
import {
  checkBusinessNumber,
  formatPhoneNumberWithHyphen,
} from "@/utils/formats";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { isMobilePhone } from "validator";
import { z } from "zod";

const directDepositFormSchema = z
  .discriminatedUnion("billingType", [
    z.object({
      billingType: z.literal("CASH_RECEIPT"),
      cashReceiptType: z.enum(["INCOME_DEDUCTION", "PROOF_OF_EXPENSE"]),
      receiptNumber: z.string().min(1, { message: "발행번호를 입력해주세요." }),
      depositorName: z.string().min(1, { message: "예금주명을 입력해주세요." }),
      note: z.string().optional(),
    }),
    z.object({
      billingType: z.literal("TAX_INVOICE"),
      businessNumber: z
        .string()
        .min(1, { message: "사업자등록번호를 입력해주세요." })
        .transform((val) => val.replace(/-/g, ""))
        .refine(
          (val) => checkBusinessNumber(val),
          "정확한 사업자등록번호를 입력해주세요."
        ),
      companyName: z.string().min(1, { message: "사업자명을 입력해주세요." }),
      ceoName: z.string().min(1, { message: "대표자명을 입력해주세요." }),
      businessAddress: z
        .string()
        .min(1, { message: "사업자 주소를 입력해주세요." }),
      businessType: z
        .string()
        .min(1, { message: "사업자 종목을 입력해주세요." }),
      businessItem: z
        .string()
        .min(1, { message: "사업자 업태를 입력해주세요." }),
      contactName: z
        .string()
        .min(1, { message: "담당자명을 입력해주세요." })
        .max(10, { message: "최대 10자까지 입력할 수 있습니다." }),
      contactPhone: z
        .string()
        .min(1, { message: "담당자 전화번호를 입력해주세요." })
        .transform((val) => formatPhoneNumberWithHyphen(val))
        .refine(
          (val) => isMobilePhone(val, "ko-KR"),
          "정확한 휴대폰번호를 입력해주세요."
        ),
      contactEmail: z
        .string()
        .email({ message: "올바른 이메일 형식이 아닙니다." }),
      depositorName: z.string().min(1, { message: "예금주명을 입력해주세요." }),
      note: z.string().optional(),
    }),
  ])
  .superRefine((data, ctx) => {
    if (data.billingType === "CASH_RECEIPT") {
      if (data.cashReceiptType === "INCOME_DEDUCTION") {
        const isPhoneNumber = isMobilePhone(data.receiptNumber, "ko-KR");
        if (!isPhoneNumber) {
          ctx.addIssue({
            code: "custom",
            message: "정확한 휴대폰번호를 입력해주세요.",
            path: ["receiptNumber"],
            fatal: true,
          });
          return z.NEVER;
        }
      }
      if (data.cashReceiptType === "PROOF_OF_EXPENSE") {
        const isBusinessNumber = checkBusinessNumber(data.receiptNumber);
        if (!isBusinessNumber) {
          ctx.addIssue({
            code: "custom",
            message: "정확한 사업자등록번호를 입력해주세요.",
            path: ["receiptNumber"],
            fatal: true,
          });
          return z.NEVER;
        }
      }
    }

    if (data.billingType === "TAX_INVOICE") {
    }
  });

export type DirectDepositFormSchema = z.infer<typeof directDepositFormSchema>;

// interface UseDirectDepositForm {
//   register: UseFormRegister<DirectDepositFormSchema>;
//   handleSubmit: UseFormHandleSubmit<DirectDepositFormSchema>;
//   formState: FormState<DirectDepositFormSchema>;
//   control: Control<DirectDepositFormSchema>;
// }

export function useDirectDepositForm({
  defaultValues,
}: {
  defaultValues: GetUserBillingInfo;
}): UseFormReturn<DirectDepositFormSchema> {
  const form = useForm<DirectDepositFormSchema>({
    resolver: zodResolver(directDepositFormSchema),
    defaultValues: {
      ...defaultValues,
      billingType: defaultValues?.billingType || "CASH_RECEIPT",
      cashReceiptType: defaultValues?.cashReceiptType || "INCOME_DEDUCTION",
      receiptNumber: defaultValues?.receiptNumber || "",
      depositorName: defaultValues?.depositorName || "",
      note: defaultValues?.note || "",
      businessNumber: defaultValues?.businessNumber || "",
      companyName: defaultValues?.companyName || "",
      ceoName: defaultValues?.ceoName || "",
      businessAddress: defaultValues?.businessAddress || "",
      businessType: defaultValues?.businessType || "",
      businessItem: defaultValues?.businessItem || "",
      contactName: defaultValues?.contactName || "",
      contactPhone: defaultValues?.contactPhone || "",
      contactEmail: defaultValues?.contactEmail || "",
    },
  });

  return form;
}
