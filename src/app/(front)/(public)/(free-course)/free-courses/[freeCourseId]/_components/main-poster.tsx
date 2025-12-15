export default function MainPoster() {
    // 순서 명시 (gif 포함)
    const posters: string[] = [
        '1.webp',
        '2.webp',
        '3.gif',
        '4.webp',
        '5.webp',
        '6.webp',
        '7.webp',
        '8.webp',
        '9.webp',
        '10.webp',
        '11.webp',
        '12.webp',
        '13.webp',
        '14.webp',
        '15.webp',
        '16.webp',
        '17.webp',
        '18.webp',
        '19.webp',
        '20.webp',
        '21.webp',
    ];

    return (
        <div className="flex flex-col">
            {posters.map((fileName, index) => (
                <img
                    key={fileName}
                    src={`/images/home/${fileName}`}
                    alt={`월급쟁이 건물주 포스터 ${index + 1}`}
                    loading="lazy"
                    className="w-full shadow-lg"
                />
            ))}
        </div>
    );
}
