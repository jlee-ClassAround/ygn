
'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

const container: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.18,
            delayChildren: 0.25,
        },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

export function HeroSection() {
    return (
        <section
            className={cn(
                'relative overflow-hidden rounded-2xl',
                'bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900',
                'min-h-[260px] md:min-h-[340px]'
            )}
        >
            {/* 왼쪽 건물 */}
            <div
                className={cn(
                    'pointer-events-none absolute inset-y-0 left-0 w-[420px]',
                    "bg-[url('https://ygn.co.kr/wp-content/uploads/2025/06/╣TH░µ-░A╣░-└╠╣╠┴÷.webp')]",
                    'bg-contain bg-no-repeat bg-left-bottom opacity-70',
                    'hidden md:block'
                )}
            />

            {/* 오른쪽 사람 */}
            <div
                className={cn(
                    'pointer-events-none absolute inset-y-0 right-0 w-[360px]',
                    "bg-[url('https://ygn.co.kr/wp-content/uploads/2025/06/A%E2%94%B4A%E2%95%ACA%E2%95%A9-%E2%94%94%E2%95%A0%E2%95%A3%E2%95%A0%E2%94%B4%C3%B7.webp')]",
                    'bg-contain bg-no-repeat bg-right-bottom',
                    'hidden md:block'
                )}
            />

            {/* 🔥 Elementor의 e-con-inner 역할 */}
            <div className="relative z-10 mx-auto max-w-[1180px] px-8 md:px-12 py-12">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="max-w-[520px]"
                >
                    {/* 뱃지 */}
                    <motion.div
                        variants={item}
                        className="mb-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-bold text-white"
                    >
                        건물주되는 방법 A to Z
                    </motion.div>

                    {/* 타이틀 */}
                    <motion.h1
                        variants={item}
                        className="text-3xl md:text-5xl font-extrabold leading-tight text-white"
                    >
                        월급쟁이 <br />
                        <span className="text-primary">건물주</span>로 은퇴하라!
                    </motion.h1>

                    {/* 서브 */}
                    <motion.p
                        variants={item}
                        className="mt-4 text-sm md:text-base text-neutral-200"
                    >
                        5.7만 건물투자 인플루언서{' '}
                        <span className="font-extrabold text-primary">영끌남</span>
                    </motion.p>
                </motion.div>
            </div>

            {/* 가독성 오버레이 */}
            <div className="pointer-events-none absolute inset-0 bg-black/20" />
        </section>
    );
}
