import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    PRISMA_DB_URL: process.env.PRISMA_DB_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
  },
};

export default nextConfig;
