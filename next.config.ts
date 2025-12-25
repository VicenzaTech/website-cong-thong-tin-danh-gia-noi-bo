import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Using webpack instead of Turbopack due to Windows symlink permission issues with better-sqlite3
  // Use --webpack flag in dev script to explicitly use webpack
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "better-sqlite3": "commonjs better-sqlite3",
      });
    }
    return config;
  },
};

export default nextConfig;
