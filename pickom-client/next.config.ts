import type { NextConfig } from "next";

const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  // Enable static export for Capacitor builds
  ...(isCapacitorBuild && { output: 'export' }),

  // Disable image optimization (needed for Capacitor)
  images: {
    unoptimized: true,
  },

  // Trailing slash for better routing
  trailingSlash: true,

  // Ignore ESLint errors during builds (можно убрать после исправления всех ошибок)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Ignore TypeScript errors during builds (только для production)
  typescript: {
    ignoreBuildErrors: false, // оставляем false, т.к. все TS ошибки исправлены
  },
};

export default nextConfig;
