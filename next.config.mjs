/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: 'utfs.io',
            },
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'https',
                hostname: 'ygn.co.kr',
                pathname: '/wp-content/uploads/**',
            },
        ],
    },
};

export default nextConfig;
