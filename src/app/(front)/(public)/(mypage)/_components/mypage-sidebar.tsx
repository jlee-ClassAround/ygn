"use client";

import { mypageMenus } from "@/constants/mypage-menus";
import { UserLogout } from "@/utils/auth/user-logout";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function MyPageSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-y-2">
      {mypageMenus.map((menu) => {
        const isActive = pathname.includes(menu.href);
        return (
          <button
            key={menu.href}
            className={cn(
              "flex items-center gap-x-2 rounded-lg py-3 px-4 hover:bg-foreground/10 hover:text-primary transition",
              isActive &&
                "text-primary bg-foreground/10 font-semibold hover:bg-foreground/20"
            )}
            onClick={() => router.push(menu.href)}
          >
            <menu.icon className={cn("size-5")} />
            <span>{menu.label}</span>
          </button>
        );
      })}
      <button
        className={cn(
          "flex items-center gap-x-2 rounded-lg py-3 px-4 hover:bg-foreground/10 hover:text-primary transition"
        )}
        onClick={UserLogout}
      >
        <LogOut className="size-5" />
        <span>로그아웃</span>
      </button>
    </div>
  );
}
