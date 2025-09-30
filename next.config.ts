import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export',
    reactStrictMode: true,
    swcMinify: true,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '', // Read from .env file
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
