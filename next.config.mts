import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "",
  },
};

export default nextConfig;
