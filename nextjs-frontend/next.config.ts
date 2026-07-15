import type { NextConfig } from "next";
const path = require("node:path");

let bundleAnalyzer: (config: NextConfig) => NextConfig = (c) => c;

if (process.env.ANALYZE === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withBundleAnalyzer = require('@next/bundle-analyzer');
  bundleAnalyzer = withBundleAnalyzer({ enabled: true });
}

const nextConfig: NextConfig = bundleAnalyzer({
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', 'react-icons', 'framer-motion'],
  },
  allowedDevOrigins: ['192.168.0.191', process.env.NEXT_PUBLIC_DEV_ORIGIN].filter(Boolean) as string[],
});

export default nextConfig;
