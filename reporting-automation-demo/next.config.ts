import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/raw-data/*/download": ["./data/raw/*.csv"],
    "/api/process": ["./data/raw/*.csv", "./data/clean/*.csv"],
    "/process/*/download": ["./data/raw/*.csv", "./data/clean/*.csv"],
  },
};

export default nextConfig;
