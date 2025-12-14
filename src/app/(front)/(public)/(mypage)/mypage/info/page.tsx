import { getUser } from "@/actions/users/get-user";
import { getSession } from "@/lib/session";
import { UserInfoForm } from "./_components/user-info-form";
import { getIsAdmin } from "@/utils/auth/is-admin";
import { Separator } from "@/components/ui/separator";

import { Metadata } from "next";
import { RemoveUserModal } from "./_components/remove-user-modal";

export const metadata: Metadata = {
  title: "회원정보",
};

export default async function MyPageInfo() {
  const session = await getSession();
  if (!session.id) return;
  const user = await getUser(session.id);
  if (!user) return;
  const isAdmin = await getIsAdmin();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">회원정보</h1>
      <Separator className="mb-6" />
      <UserInfoForm user={user} isAdmin={isAdmin} />
      <RemoveUserModal />
    </div>
  );
}
