import { formatPrice } from "@/utils/formats";
import { Category } from "@prisma/client";
import Image from "next/image";

interface Props {
  thumbnail: string;
  title: string;
  price: number;
  category: Category | null;
}

export function CheckoutInfo({ thumbnail, title, price, category }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-y-3 md:gap-x-5">
      <div className="relative aspect-video max-w-[240px] w-full">
        <Image
          fill
          src={thumbnail}
          alt="전자책 대표이미지"
          className="object-cover rounded-lg"
        />
      </div>
      <div className="flex flex-col justify-between h-full gap-y-3 md:gap-y-5">
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2 text-sm text-foreground/60">
            {category?.name}
          </div>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        <div className="text-lg font-semibold">{formatPrice(price)}원</div>
      </div>
    </div>
  );
}
