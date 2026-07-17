import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix Turbopack workspace root detection when multiple lockfiles exist
  turbopack: {
    root: path.join(__dirname),
  },
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
      {
        // Firebase Storage public URLs
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        // Firebase Storage alternate domain
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
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
