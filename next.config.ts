import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Using webpack instead of Turbopack due to Windows symlink permission issues with better-sqlite3
  // Use --webpack flag in dev script to explicitly use webpack
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "better-sqlite3": "commonjs better-sqlite3",
      });
    } else {
      // External Node.js modules for client-side to prevent bundling
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      
      // Ignore .server.ts files in client bundle
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /database\.server$/,
        })
      );
    }
    return config;
  },
};

export default nextConfig;
