import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three", "@remotion/web-renderer", "@remotion/media"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  serverExternalPackages: ["@remotion/renderer"],
};

export default nextConfig;
