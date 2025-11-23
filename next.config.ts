import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress middleware deprecation warning (NextAuth v5 still uses middleware pattern)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
