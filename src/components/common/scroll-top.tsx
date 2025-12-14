'use client';

export function ScrollToTopButton() {
    return (
        <button
            type="button"
            onClick={() =>
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                })
            }
            className="mt-10 flex h-10 w-10 items-center justify-center rounded-md bg-white text-black hover:bg-primary hover:text-white transition"
            aria-label="Scroll to top"
        >
            ↑
        </button>
    );
}
