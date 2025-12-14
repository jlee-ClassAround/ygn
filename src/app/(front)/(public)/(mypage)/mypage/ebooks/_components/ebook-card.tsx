"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { formatPrice } from "@/utils/formats";
import { toast } from "sonner";
import { increaseEbookDownloadCount } from "../actions";
import { useState } from "react";

interface Props {
  userId: string;
  ebookId: string;
  ebookTitle: string;
  ebookThumbnail: string;
  ebookPrice: number;
  fileUrl?: string;
}

export function EbookCard({
  ebookId,
  userId,
  ebookTitle,
  ebookThumbnail,
  ebookPrice,
  fileUrl,
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      if (!fileUrl) return;
      await increaseEbookDownloadCount(ebookId, userId);
      window.open(fileUrl, "_blank");
      toast.success("다운로드 완료");
    } catch {
      toast.error("다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group flex overflow-hidden rounded-xl bg-foreground/10 border border-foreground/20 shadow-sm hover:shadow-lg transition-all duration-200">
      {/* 썸네일 영역 */}
      <div className="relative aspect-[3/4] w-[120px] overflow-hidden bg-foreground/10 flex-shrink-0">
        <Image
          fill
          src={ebookThumbnail}
          alt={ebookTitle}
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex flex-col p-4 flex-1 min-w-0">
        {/* 제목 */}
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
          {ebookTitle}
        </h3>

        {/* 가격 */}
        <div className="text-sm text-foreground/50 mb-4">
          {ebookPrice === 0 ? (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-foreground/10 text-foreground/50 font-medium">
              무료 전자책
            </span>
          ) : (
            <span className="font-medium text-foreground/50">
              {formatPrice(ebookPrice)}원
            </span>
          )}
        </div>

        {/* 다운로드 버튼 */}
        {fileUrl && (
          <div className="mt-auto">
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              disabled={isDownloading}
              className="w-full gap-x-1 hover:bg-foreground/20 hover:text-foreground transition-colors"
            >
              <Download className="size-4" />
              {isDownloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "다운로드"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
