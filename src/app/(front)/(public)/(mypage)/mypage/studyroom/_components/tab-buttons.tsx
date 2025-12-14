"use client";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

export function TabButtons() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const buttonStyle =
    "p-3 text-sm md:text-base text-nowrap font-medium text-foreground/70 flex-1 transition shadow-[inset_0px_-1px_0px_#333333] hover:shadow-[inset_0px_-2px_0px_hsl(var(--primary))]";
  const buttonActiveStyle =
    "text-primary font-semibold shadow-[inset_0px_-2px_0px_hsl(var(--primary))]";

  return (
    <div className="flex items-center">
      <button
        type="button"
        className={cn(buttonStyle, tab === "progress" && buttonActiveStyle)}
        onClick={() => router.push("/mypage/studyroom?tab=progress")}
      >
        수강중인 강의
      </button>
      <Separator orientation="vertical" className="h-5" />
      <button
        type="button"
        className={cn(buttonStyle, tab === "complete" && buttonActiveStyle)}
        onClick={() => router.push("/mypage/studyroom?tab=complete")}
      >
        완료한 강의
      </button>
      <Separator orientation="vertical" className="h-5" />
      <button
        type="button"
        className={cn(buttonStyle, tab === "all" && buttonActiveStyle)}
        onClick={() => router.push("/mypage/studyroom?tab=all")}
      >
        전체 강의
      </button>
    </div>
  );
}
