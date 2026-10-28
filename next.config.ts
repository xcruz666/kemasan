import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: "standalone",
  experimental: {
    // Admin photos are compressed in the browser; 3 MB upload limit plus form overhead.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
