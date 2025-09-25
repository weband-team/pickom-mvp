import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.optimization = {
        ...config.optimization,
        minimize: false,
        splitChunks: false,
      };
      config.parallelism = 1;
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
