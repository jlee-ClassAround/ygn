import { Course, DetailImage, SiteSetting, Terms } from '@prisma/client';

interface Props {
    detailImages: DetailImage[];
    lectureInfo: Course | null;
    refundPolicy: string | null;
    usePolicy: string | null;
}

export function LectureContent({ detailImages, lectureInfo, refundPolicy, usePolicy }: Props) {
    return (
        <div className="space-y-20">
            {/* 강의 소개 (이미지) */}
            <section id="lecture-images">
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
            <section id="refund-policy" className="pt-10 border-t border-border">
                <h2 className="text-xl font-semibold mb-6">환불규정</h2>
                <div
                    className="text-sm leading-relaxed text-foreground/70"
                    dangerouslySetInnerHTML={{
                        __html: refundPolicy?.content ?? '',
                    }}
                />
            </section>

            {/* 이용 안내 */}
            <section id="usage-guide" className="pt-10 border-t border-border">
                <h2 className="text-xl font-semibold mb-6">이용안내</h2>
                <div
                    className="text-sm leading-relaxed text-foreground/70"
                    dangerouslySetInnerHTML={{
                        __html: usePolicy?.content ?? '',
                    }}
                />
            </section>
        </div>
    );
}
