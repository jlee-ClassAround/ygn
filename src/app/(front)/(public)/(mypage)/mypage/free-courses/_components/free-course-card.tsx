"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface Props {
  courseTitle: string;
  kakaoRoomLink: string;
  kakaoRoomPassword: string;
}

export function FreeCourseCard({
  courseTitle,
  kakaoRoomLink,
  kakaoRoomPassword,
}: Props) {
  return (
    <div className="flex flex-col gap-y-3 p-5 rounded-xl bg-foreground/10">
      <h3 className="text-lg font-semibold">{courseTitle}</h3>
      <Separator />
      <div className="flex flex-col gap-y-2">
        <span className="text-sm text-foreground/50">카카오톡 오픈 채팅방</span>
        <span className="text-sm text-primary">{kakaoRoomLink}</span>
        <span className="text-sm text-foreground/50">
          카카오톡 오픈 채팅방 비밀번호
        </span>
        <span className="text-sm text-primary">{kakaoRoomPassword}</span>
      </div>
      <div className="flex items-center gap-x-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            navigator.clipboard.writeText(kakaoRoomPassword ?? "");
            toast.success("비밀번호가 복사되었습니다.");
          }}
        >
          비밀번호 복사
        </Button>
        <Button className="flex-1" asChild>
          <a
            href={kakaoRoomLink ?? ""}
            target="_blank"
            rel="noreferrer noopener"
          >
            채팅방 입장
          </a>
        </Button>
      </div>
    </div>
  );
}
