import { GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from 'next';
import './globals.css';

import { QueryProvider } from '@/providers/query-provider';

import { cn } from '@/lib/utils';
import GtmNoscript from '@/scripts/gtm-noscript';
import { kimjungchulGothic, pretendard } from './fonts';

export const metadata: Metadata = {
    title: {
        default: '영끌남',
        template: '%s - 영끌남',
    },
    description: '영끌남',
    icons: {
        icon: '/favicon.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" className="bg-white" suppressHydrationWarning>
            <GoogleTagManager gtmId="GTM-5SJ2HR6K" />
            <body
                className={cn(kimjungchulGothic.variable, pretendard.variable, 'antialiased')}
                suppressHydrationWarning
            >
                <QueryProvider>{children}</QueryProvider>
                <GtmNoscript />
            </body>
        </html>
    );
}
