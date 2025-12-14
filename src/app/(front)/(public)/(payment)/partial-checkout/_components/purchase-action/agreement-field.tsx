"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import crypto from "crypto";

interface Agreement {
  id: string;
  label: string;
  url: string;
}

const agreements: Agreement[] = [
  {
    id: "terms",
    label: "전자금융거래 이용약관",
    url: "https://pages.tosspayments.com/terms/user",
  },
  {
    id: "privacy1",
    label: "개인(신용)정보 수집이용 동의",
    url: "https://pages.tosspayments.com/terms/privacy/consent1",
  },
  {
    id: "privacy2",
    label: "개인(신용)정보 제3자 제공 동의",
    url: "https://pages.tosspayments.com/terms/privacy/consent2",
  },
  {
    id: "refund-policy",
    label: "환불 정책 동의",
    url: "/refund-policy",
  },
];

interface Props {
  onAgreementChange: (isAllAgreed: boolean) => void;
}

export default function AgreementField({ onAgreementChange }: Props) {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleAllCheck = (checked: boolean) => {
    if (checked) {
      setCheckedItems(agreements.map((agreement) => agreement.id));
    } else {
      setCheckedItems([]);
    }
  };

  const handleSingleCheck = (checked: boolean, id: string) => {
    if (checked) {
      setCheckedItems([...checkedItems, id]);
    } else {
      setCheckedItems(checkedItems.filter((item) => item !== id));
    }
  };

  const isAllChecked = agreements.length === checkedItems.length;

  useEffect(() => {
    onAgreementChange(isAllChecked);
  }, [isAllChecked, onAgreementChange]);

  const randomString = crypto.randomBytes(1).toString("hex");

  return (
    <div>
      <div className="flex items-center space-x-2 *:cursor-pointer">
        <Checkbox
          id={`all-${randomString}`}
          checked={isAllChecked}
          onCheckedChange={handleAllCheck}
          className="data-[state=checked]:border-primary data-[state=checked]:bg-primary size-4"
          type="button"
        />
        <Label
          htmlFor={`all-${randomString}`}
          className="text-foreground font-medium"
        >
          강의 및 결제 정보를 확인하였으며, 이에 동의합니다(필수)
        </Label>
        <ChevronDown
          className={cn(
            "!ml-5 size-4 transition-transform duration-300",
            isOpen ? "rotate-180" : "rotate-0"
          )}
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>
      <div
        className={cn(
          "space-y-2 overflow-hidden pt-2 pl-5 transition-all duration-500 ease-in-out",
          isOpen ? "max-h-[200px]" : "max-h-0"
        )}
      >
        {agreements.map((agreement) => (
          <div
            key={agreement.id}
            className="flex items-center space-x-2 *:cursor-pointer"
          >
            <Checkbox
              id={`${agreement.id}-${randomString}`}
              checked={checkedItems.includes(agreement.id)}
              onCheckedChange={(checked) =>
                handleSingleCheck(checked as boolean, agreement.id)
              }
            />
            <Label
              htmlFor={`${agreement.id}-${randomString}`}
              className="flex items-center gap-1"
            >
              {agreement.label}
              <Link
                href={agreement.url}
                target="_blank"
                className="text-primary text-sm hover:underline"
              >
                보기
              </Link>
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
