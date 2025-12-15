'use client';

import { useEffect, useRef, useState } from 'react';

export default function RevealImage() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            if (window.scrollY >= 400) {
                setShow(true);
            } else {
                setShow(false);
            }
        };

        window.addEventListener('scroll', onScroll);
        onScroll(); // 초기 상태 체크

        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`
        hidden md:block
        transition-all duration-700 ease-out
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
      `}
        >
            <img
                src="https://ygn.co.kr/wp-content/uploads/2025/11/┐A▓°│▓8▒O_╝╝└¤┴¯¢µ│I└¤_251031.webp"
                alt="강의 리빌 이미지"
                loading="lazy"
                decoding="async"
                className="w-full rounded-2xl shadow-xl"
            />
        </div>
    );
}
