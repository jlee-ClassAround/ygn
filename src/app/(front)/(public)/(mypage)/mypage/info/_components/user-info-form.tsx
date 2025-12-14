"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserInfoSchema, userInfoSchema } from "@/validations/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { LockedInput } from "./locked-input";
import { Button } from "@/components/ui/button";
import { updateInfo } from "../actions/update-info";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { useRemoveUserModalStore } from "@/store/use-remove-user-modal-store";

interface Props {
  user: User;
  isAdmin: boolean;
}

export function UserInfoForm({ user, isAdmin }: Props) {
  const router = useRouter();

  const { setIsOpen } = useRemoveUserModalStore();

  const form = useForm<UserInfoSchema>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      ...user,
      username: user.username || "",
      avatar: user.avatar || "",
      nickname: user.nickname || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: UserInfoSchema) => {
    try {
      await updateInfo({ userId: user.id, values });
      router.refresh();
      toast.success("변경이 완료되었습니다!");
    } catch {
      toast.error("오류가 발생했습니다.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isAdmin ? (
          <FormField
            name="username"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input
                    placeholder="홍길동"
                    disabled={isSubmitting}
                    {...field}
                    className="h-14"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <LockedInput
            label="이름"
            value={user.username || "이름이 없습니다."}
          />
        )}

        <FormField
          name="nickname"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>닉네임</FormLabel>
              <FormControl>
                <Input
                  placeholder="암행어사"
                  disabled={isSubmitting}
                  {...field}
                  className="h-14"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LockedInput
          label="이메일"
          value={user.email || "이메일이 없습니다."}
        />
        <LockedInput
          label="휴대폰번호"
          value={user.phone || "전화번호가 없습니다."}
        />
        <FormField
          name="optedIn"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>마케팅 수신 설정</FormLabel>
              <div className="flex gap-x-3 space-y-0 p-4 border rounded-md">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="mt-[2px] size-5"
                  />
                </FormControl>
                <div className="space-y-1">
                  <FormLabel className="text-base font-medium">
                    이벤트/쿠폰 등 혜택 수신 동의
                  </FormLabel>
                  <FormDescription className="text-sm">
                    체크하지 않으면 무료강의 혜택을 받으실 수 없습니다.
                  </FormDescription>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="h-14 text-base font-semibold"
            onClick={() => setIsOpen(true)}
          >
            회원탈퇴
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || !isValid}
            className="h-14 text-base font-semibold"
          >
            회원정보 수정
          </Button>
        </div>
      </form>
    </Form>
  );
}
