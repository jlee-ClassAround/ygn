import { DetailImage } from '@prisma/client';

interface Props {
    detailImages: DetailImage[];
}

export default function MainPoster({ detailImages }: Props) {
    return (
        <div className="flex flex-col">
            {detailImages.map((image) => (
                <img key={image.id} src={image.imageUrl} alt="" loading="lazy" className="w-full" />
            ))}
        </div>
    );
}
