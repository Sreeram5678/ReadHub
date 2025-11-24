import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Optimize images if you add them later
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Enable compression
  compress: true,
};

export default nextConfig;
