import type { NextConfig } from "next";

import path from "path";

const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
} satisfies NextConfig as any;

export default nextConfig;
