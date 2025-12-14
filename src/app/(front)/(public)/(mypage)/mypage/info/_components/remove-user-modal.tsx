"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useRemoveUserModalStore } from "@/store/use-remove-user-modal-store";
import { MessageSquareWarning } from "lucide-react";
import toast from "react-hot-toast";
import { removeUser } from "../actions/remove-user";
import { useRouter } from "next/navigation";

export function RemoveUserModal() {
  const { isOpen, setIsOpen } = useRemoveUserModalStore();
  const router = useRouter();

  const handleRemoveUser = async () => {
    try {
      await removeUser();
      toast.success("회원탈퇴가 완료되었습니다.");
      setIsOpen(false);
      router.push("/");
    } catch {
      toast.error("회원탈퇴에 실패했습니다.");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="dark bg-background text-foreground space-y-6">
        <AlertDialogHeader className="flex flex-col items-center">
          <AlertDialogTitle className="flex items-center gap-2 text-2xl font-semibold text-red-500">
            <MessageSquareWarning className="size-8" />
            경고!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg text-center">
            회원탈퇴 시 모든 데이터(강의 수강권한, 전자책, 무료강의 신청내역 등
            모든 자료)가 삭제됩니다. 삭제된 데이터는 복구할 수 없습니다.
            <br />
            신중히 결정해주세요. 고객의 실수로 인한 삭제는 책임지지 않습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-xl text-center">
          정말로 회원탈퇴를 진행하시겠습니까?
        </div>
        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-14 text-base font-semibold"
            onClick={() => setIsOpen(false)}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="h-14 text-base font-semibold"
            onClick={handleRemoveUser}
          >
            회원탈퇴
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
