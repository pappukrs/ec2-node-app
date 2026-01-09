import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Environment variables that should be available at build time
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD: process.env.NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD,
    NEXT_PUBLIC_MAX_RETRY_ATTEMPTS: process.env.NEXT_PUBLIC_MAX_RETRY_ATTEMPTS,
  },


  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },

  // Image optimization settings
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
