import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp'],
    deviceSizes: [320, 640, 750, 828, 1080, 1200],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.huggingface.co',
      },
    ],
  },
};

export default nextConfig;
