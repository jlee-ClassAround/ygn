interface Props {
    left: React.ReactNode;
    right: React.ReactNode;
}

export function LectureLayout({ left, right }: Props) {
    return (
        <div className="mx-auto max-w-[1200px] px-4">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
                {/* 좌측 메인 */}
                <div>{left}</div>

                {/* 우측 사이드 */}
                <aside className="lg:sticky lg:top-24 h-fit">{right}</aside>
            </div>
        </div>
    );
}
