import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.optimization = {
        ...config.optimization,
        minimize: false,
        splitChunks: false,
      };
      config.parallelism = 1;
      config.cache = false;

      // Disable worker threads for webpack
      if (!isServer) {
        config.infrastructureLogging = {
          level: 'error',
        };
        config.stats = 'errors-only';
      }
    }
    return config;
  },
};

export default nextConfig;
