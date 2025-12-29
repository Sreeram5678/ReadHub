import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // SWC minification is enabled by default in Next.js 13+
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizeCss: true,
    scrollRestoration: true,
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ['lucide-react', '@radix-ui/react-select', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
  compiler: {
    // Remove console.log in production (can be commented out if needed for debugging)
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.github.com',
      },
      {
        protocol: 'https',
        hostname: '**.google.com',
      },
    ],
  },
  // Enable compression
  compress: true,
  // Optimize bundle with chunk splitting
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        // Separate heavy libraries for better caching
        recharts: {
          test: /[\\/]node_modules[\\/]recharts[\\/]/,
          name: 'recharts',
          chunks: 'all',
          priority: 20,
        },
        framer: {
          test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
          name: 'framer-motion',
          chunks: 'all',
          priority: 20,
        },
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
