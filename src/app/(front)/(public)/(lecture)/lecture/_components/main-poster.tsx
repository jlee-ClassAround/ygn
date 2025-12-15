import { DetailImage } from '@prisma/client';

interface Props {
    detailImages: DetailImage[];
    refundPolicy: string | null;
    usePolicy: string | null;
}

export default function MainPoster({ detailImages, refundPolicy, usePolicy }: Props) {
    return (
        <>
            <div className="flex flex-col">
                {detailImages.map((image) => (
                    <img
                        key={image.id}
                        src={image.imageUrl}
                        alt=""
                        loading="lazy"
                        className="w-full"
                    />
                ))}
            </div>

            {/* 환불 규정 */}
            <section id="refund-policy" className="pt-12 border-t border-border">
                <h2 className="text-xl font-semibold mb-6">환불규정</h2>
                <div
                    className="text-sm leading-relaxed text-foreground/70"
                    dangerouslySetInnerHTML={{
                        __html: refundPolicy ?? '',
                    }}
                />
            </section>

            {/* 이용 안내 */}
            <section id="usage-guide" className="pt-12 border-t border-border">
                <h2 className="text-xl font-semibold mb-6">이용안내</h2>
                <div
                    className="text-sm leading-relaxed text-foreground/70"
                    dangerouslySetInnerHTML={{
                        __html: usePolicy ?? '',
                    }}
                />
            </section>
        </>
    );
}
