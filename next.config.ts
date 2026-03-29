import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 禁用 TypeScript 类型检查以加快构建
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用 ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 确保 data 目录在构建时被包含到 serverless 函数中
  experimental: {
    outputFileTracingIncludes: {
      '/api/questions': ['./data/**/*'],
      '/api/knowledge': ['./data/**/*'],
    },
  },
};

export default nextConfig;
