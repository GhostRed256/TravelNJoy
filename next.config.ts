import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1200],
    imageSizes: [16, 32, 64, 96, 256, 384],
    minimumCacheTTL: 604800, // cache optimized images for 7 days
  },
};

export default nextConfig;
