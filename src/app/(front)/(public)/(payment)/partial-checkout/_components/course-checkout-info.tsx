import { formatPrice } from "@/utils/formats";
import { Category, Teacher } from "@prisma/client";
import Image from "next/image";

interface Props {
  productThumbnail: string;
  productTitle: string;
  teachers: Teacher[];
  productPrice: number;
  category: Category | null;
}

export function CourseCheckoutInfo({
  productThumbnail,
  productTitle,
  teachers,
  productPrice,
  category,
}: Props) {
  return (
    <div className="flex flex-col gap-y-3 md:flex-row md:items-center md:gap-x-5">
      <div className="relative aspect-video w-full max-w-[240px]">
        <Image
          fill
          src={productThumbnail}
          alt="강의 대표이미지"
          className="rounded-lg object-cover"
        />
      </div>
      <div className="flex h-full flex-col justify-between gap-y-3 md:gap-y-5">
        <div className="flex flex-col gap-y-1">
          <div className="text-foreground/60 flex items-center gap-x-2 text-sm">
            {category?.name}
          </div>
          <h1 className="text-xl font-semibold">{productTitle}</h1>
          <div className="flex items-center gap-x-2 text-sm text-gray-500">
            {teachers.map((teacher) => teacher.name)}
          </div>
        </div>
        <div className="text-lg font-semibold">
          {formatPrice(productPrice)}원
        </div>
      </div>
    </div>
  );
}
