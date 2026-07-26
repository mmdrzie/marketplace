import type { NextConfig } from "next";

let bundleAnalyzer: (config: NextConfig) => NextConfig = (c) => c;

if (process.env.ANALYZE === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withBundleAnalyzer = require('@next/bundle-analyzer');
  bundleAnalyzer = withBundleAnalyzer({ enabled: true });
}

const nextConfig: NextConfig = bundleAnalyzer({
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'localhost' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  experimental: {
    optimizePackageImports: ['@tanstack/react-query', 'react-icons', 'framer-motion'],
  },
  allowedDevOrigins: (process.env.NEXT_PUBLIC_DEV_ORIGINS || 'localhost').split(',').map(s => s.trim()),
});

export default nextConfig;
