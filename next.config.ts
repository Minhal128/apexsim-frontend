import type { NextConfig } from "next";

import path from "path";

const nextConfig = {
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
} satisfies NextConfig as any;

export default nextConfig;
