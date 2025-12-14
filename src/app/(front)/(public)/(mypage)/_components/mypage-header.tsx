import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  username: string | null;
  avatar: string | null;
  inProgressCount: number;
  completedCount: number;
  couponCount: number;
}

export function MyPageHeader({
  username,
  avatar,
  inProgressCount,
  completedCount,
  couponCount,
}: Props) {
  return (
    <div className="flex items-center justify-between py-4 md:py-10">
      <div className="flex items-center gap-x-3 md:gap-x-5">
        <Avatar className="size-20 md:size-24">
          <AvatarImage src={avatar || undefined} />
          <AvatarFallback>{username?.substring(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-y-1 md:gap-y-3">
          <div className="md:text-xl font-semibold">{username}</div>
          <div className="flex items-center gap-x-3 text-sm text-foreground/50">
            <div>수강중인 강의 {inProgressCount}</div>
            <div>완료한 강의 {completedCount}</div>
            <div>쿠폰 {couponCount}</div>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  );
}
