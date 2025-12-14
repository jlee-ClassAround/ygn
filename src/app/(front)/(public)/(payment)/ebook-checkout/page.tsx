import { getUser } from "@/actions/users/get-user";
import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { getUserCoupons } from "@/actions/coupons/get-user-coupons";
import { db } from "@/lib/db";
import { TossPaymentsWidget } from "./_components/toss-payments-widget";
import { Metadata } from "next";
import StartCheckoutTracker from "@/track-events/start-checkout-tracker";

export const metadata: Metadata = {
  title: "전자책 결제하기",
};

export default async function EbookCheckOut({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { ebookId } = await searchParams;
  if (!ebookId) return redirect("/");

  const session = await getSession();
  const user = await getUser(session.id);
  if (!user) return redirect("/");

  // 전자책 정보 조회
  const ebook = await db.ebook.findUnique({
    where: {
      id: ebookId,
      isPublished: true,
    },
    include: {
      category: true,
    },
  });

  if (!ebook) return notFound();

  // 이미 구매했는지 확인
  const existingPurchase = await db.ebookPurchase.findUnique({
    where: {
      userId_ebookId: {
        userId: user.id,
        ebookId: ebook.id,
      },
    },
  });
  if (existingPurchase) return redirect("/mypage/ebooks");

  const ebookPrice = ebook.discountedPrice ?? ebook.originalPrice ?? 0;
  const userCoupons = await getUserCoupons(user.id);

  return (
    <div className="fit-container">
      <StartCheckoutTracker
        contentId={ebookId}
        contentType="ebook"
        value={ebookPrice}
      />
      <TossPaymentsWidget
        userId={user.id}
        userName={user.username}
        userEmail={user.email}
        userPhone={user.phone}
        ebookId={ebookId}
        ebookPrice={ebookPrice}
        ebookTitle={ebook.title}
        ebookThumbnail={ebook.thumbnail!}
        isTaxFree={ebook.isTaxFree}
        coupons={userCoupons}
        category={ebook.category}
      />
    </div>
  );
}
