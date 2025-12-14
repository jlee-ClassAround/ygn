import { PagePagination } from "@/components/common/sub-page/page-pagination";
import { EmptySection } from "@/components/layout/empty-section";
import { Button } from "@/components/ui/button";
import { getLoggedInUserId } from "@/utils/auth/get-logged-in-user-id";
import { ChevronRight } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { OrderHistoryItem } from "./_components/order-history-item";
import { getMypageOrders } from "./_queries/get-mypage-orders";
import { getCachedSiteSetting } from "@/queries/global/site-setting";

export const metadata: Metadata = {
  title: "구매내역",
};

interface Props {
  searchParams: Promise<{
    page: string;
  }>;
}

export default async function MyPagePayment({ searchParams }: Props) {
  const { page = "1" } = await searchParams;
  const pageSize = 6;
  const userId = await getLoggedInUserId();

  const { orders, totalPages } = await getMypageOrders({
    userId,
    pageSize,
    currentPage: Number(page),
  });

  const siteSetting = await getCachedSiteSetting();

  return (
    <div className="space-y-5">
      {orders.length > 0 ? (
        <div className="space-y-5">
          <div className="space-y-5">
            {orders.map((order) => (
              <OrderHistoryItem
                key={order.id}
                order={order}
                siteSetting={siteSetting}
              />
            ))}
          </div>
          <PagePagination totalPages={totalPages} />
        </div>
      ) : (
        <EmptySection>구매 내역이 없습니다.</EmptySection>
      )}
      <div className="flex items-center justify-end">
        <Link href="/mypage/payment">
          <Button variant="link" className="cursor-pointer">
            예전 내역 보기
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
