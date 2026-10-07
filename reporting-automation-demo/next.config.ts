import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/raw-data/*/download": ["./data/raw/*.csv"],
  },
};

export default nextConfig;
