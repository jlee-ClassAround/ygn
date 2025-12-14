import { EbookCard } from "./_components/ebook-card";
import { getMypageEbooks } from "@/actions/mypage/get-mypage-ebooks";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "전자책",
};

export default async function MyPageEbooks() {
  const session = await getSession();
  if (!session.id) return notFound();
  const ebooks = await getMypageEbooks({ userId: session?.id });

  return (
    <>
      {ebooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8 mt-5">
          {ebooks.map((ebook) => (
            <EbookCard
              key={ebook.id}
              ebookId={ebook.id}
              userId={session.id!}
              ebookTitle={ebook.title}
              ebookThumbnail={ebook.thumbnail!}
              ebookPrice={ebook.discountedPrice ?? ebook.originalPrice ?? 0}
              fileUrl={ebook.fileUrl || undefined}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-80 border border-dashed border-foreground/20 rounded-lg mt-5 bg-foreground/10">
          <p className="text-sm text-foreground/50">
            구매한 전자책이 없습니다.
          </p>
        </div>
      )}
    </>
  );
}
