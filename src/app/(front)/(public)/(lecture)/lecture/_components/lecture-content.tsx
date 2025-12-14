import { DetailImage, SiteSetting } from '@prisma/client';

interface Props {
    detailImages: DetailImage[];
    siteSetting: SiteSetting | null;
}

export function LectureContent({ detailImages, siteSetting }: Props) {
    return (
        <>
            {/* 강의 소개 = 이미지 영역 */}
            <section id="lecture-images" className="py-10">
                {detailImages.map((image) => (
                    <img
                        key={image.id}
                        src={image.imageUrl}
                        alt=""
                        className="w-full"
                        loading="lazy"
                    />
                ))}
            </section>

            {/* 환불 정책 */}
            <section id="refund-policy" className="py-16 border-t">
                <h2 className="text-xl font-semibold mb-6">환불정책</h2>
                <div
                    className="text-sm leading-relaxed text-foreground/70"
                    dangerouslySetInnerHTML={{
                        __html: siteSetting?.courseRefundPolicy ?? '',
                    }}
                />
            </section>
        </>
    );
}
