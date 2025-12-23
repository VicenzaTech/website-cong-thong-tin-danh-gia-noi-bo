import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "pg", "@prisma/adapter-pg"],
  output: "standalone",
};

export default nextConfig;
