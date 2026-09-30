import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  agentRules: false,
  turbopack: { root: process.cwd() },
};

export default nextConfig;
