import localFont from 'next/font/local';

/**
 * 김정철 고딕
 */
export const kimjungchulGothic = localFont({
    src: [
        {
            path: './fonts/KimjungchulGothic-Regular.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: './fonts/KimjungchulGothic-Bold.ttf',
            weight: '700',
            style: 'normal',
        },
    ],
    display: 'swap',
    variable: '--font-kimjungchul-gothic',
});

/**
 * Pretendard Variable
 */
export const pretendard = localFont({
    src: './fonts/PretendardVariable.woff2',
    display: 'swap',
    variable: '--font-pretendard',
});
