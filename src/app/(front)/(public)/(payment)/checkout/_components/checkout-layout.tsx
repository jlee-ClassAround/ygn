interface Props {
    left: React.ReactNode;
    right: React.ReactNode;
}

export function CheckoutLayout({ left, right }: Props) {
    return (
        <main className="w-full bg-background">
            <div
                className="
                    mx-auto
                    max-w-[1320px]
                    px-6
                    py-20
                    grid
                    grid-cols-1
                    lg:grid-cols-[minmax(0,580px)_1fr]
                    gap-16
                "
            >
                <aside>{left}</aside>

                <aside className="sticky top-24 h-fit">{right}</aside>
            </div>
        </main>
    );
}
